require('../../../psknode/bundles/pskruntime');
require('../../../psknode/bundles/psknode');
require('../../../psknode/bundles/virtualMQ');
require('../../../psknode/bundles/consoleTools');
const assert = require("double-check").assert;
const path = require('path');
const fs = require('fs');
const pskwallet = require('pskwallet');
const CSBIdentifier = pskwallet.CSBIdentifier;
const fileStateManager = require('../../../libraries/utils/FileStateManager').getFileStateManager();

const tempFolder = path.resolve('../../tmp');
const csbFolder = path.join(tempFolder, 'csb');
const fileName = 'fileName';
const multipleFilesNumber = 5;

const csbInteractions = require("../../../modules/csb-wizard/utils/csbInteractions");

const flow = $$.flow.describe('testAttachFile', {

    start: function (callback) {
        this.callback = callback;
        fileStateManager.saveState([tempFolder], () => {
            const serial = this.serial(this.result);
            serial.createCSB(serial.progress);
            serial.prepareFile(fileName, serial.progress);
            serial.attachSingleFile(serial.progress);
            serial.attachSameNameFile(serial.progress);
            serial.prepareMultipleFiles(0, serial.progress);
            serial.attachMultipleFiles(0, serial.progress);
            serial.restoreState(serial.progress);
        });
    },

    createRawDossier: function (callback) {
        csbInteractions.createCSB(csbFolder, "http://localhost:8080", (err, seed) => {
            assert.false(err, "Error creating CSB: " + (err && err.message));
            assert.true(seed, "Seed is undefined");
            this.seed = seed;
            callback();
        });
    },
    prepareFile: function (fileName, callback) {
        const file = Buffer.alloc(10000, 'a');
        fs.writeFile(path.join(csbFolder, fileName), file, (err) => {
            assert.false(err, 'Error preparing file for test ' + (err && err.message));
            callback();
        });
    },

    attachSingleFile: function (callback) {
        csbInteractions.addFile(csbFolder, fileName, this.seed, (err) => {
            assert.false(err, 'Error attaching single file ' + (err && err.message));
            callback();
        })
    },
    attachSameNameFile: function (callback) {
        csbInteractions.addFile(csbFolder, fileName , this.seed, (err) => {
            assert.true(err, 'Error missing when attaching a file with an existing name ');
            callback();
        })
    },
    prepareMultipleFiles: function(index = 0, callback) {
        if(index >= multipleFilesNumber) {
            callback();
            return;
        }

        this.prepareFile(fileName + index, (err) => {
            assert.false(err, 'Unexpected error while preparing files ' + (err && err.message));
            this.prepareMultipleFiles(++index, callback);
        });
    },
    attachMultipleFiles: function (index = 0, callback) {
        if(index >= multipleFilesNumber) {
            callback();
            return;
        }

        csbInteractions.addFile(csbFolder, fileName + index , this.seed, (err) => {
            assert.false(err, 'Error missing when attaching file in sequence with number ' + index);
            this.attachMultipleFiles(++index, callback);
        });
    },
    restoreState: function (callback) {
        fileStateManager.restoreState(callback);
    },
    progress: function (err) {
        assert.false(err, 'Unexpected error ', (err && err.message));
    },
    result: function(err) {
        assert.false(err, 'Unexpected error ', (err && err.message));
        this.callback();
    }
})();

assert.callback('testAttachFile', function (callback) {
    flow.start(callback);
}, 2000);
