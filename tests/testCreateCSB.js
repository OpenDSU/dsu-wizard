require('../../../psknode/bundles/pskruntime');
require('../../../psknode/bundles/psknode');
require('../../../psknode/bundles/virtualMQ');
require('../../../psknode/bundles/consoleTools');
const assert = require("double-check").assert;
const Seed = require('pskwallet').Seed;
const path = require('path');
const fileStateManager = require('../../../libraries/utils/FileStateManager').getFileStateManager();

const tempFolder = path.resolve('../../tmp');
const csbFolder = path.join(tempFolder, 'csb');

const csbInteractions = require("../../../modules/csb-wizard/utils/csbInteractions");

const flow = $$.flow.describe('testCreateCSB', {

    start: function (callback) {
        this.callback = callback;
        fileStateManager.saveState([tempFolder], () => {
            const serial = this.serial(this.callback);
            serial.stringBackup(serial.progress);
            serial.arraySingleBackup(serial.progress);
            serial.arrayMultipleDuplicateBackup(serial.progress);
            serial.emptyStringBackup(serial.progress);
            serial.restoreState(serial.progress);
        });
    },

    stringBackup: function (callback) {
        csbInteractions.createCSB(csbFolder, "http://localhost:8080", (err, seed) => {
            assert.false(err, "Error creating CSB: " + (err && err.message));
            assert.true(seed, "Seed is undefined");
            assert.true(Seed.isValidForm(seed), 'Received invalid seed');
            callback();
        });
    },
    arraySingleBackup: function (callback) {
        csbInteractions.createCSB(csbFolder, ["http://localhost:8080"], (err, seed) => {
            assert.false(err, "Error creating CSB: " + (err && err.message));
            assert.true(seed, "Seed is undefined");
            assert.true(Seed.isValidForm(seed), 'Received invalid seed');
            callback();
        });
    },
    arrayMultipleDuplicateBackup: function (callback) {
        csbInteractions.createCSB(csbFolder, ["http://localhost:8080", "http://localhost:8080", "http://localhost:8080"], (err, seed) => {
            assert.false(err, "Error creating CSB: " + (err && err.message));
            assert.true(seed, "Seed is undefined");
            assert.true(Seed.isValidForm(seed), 'Received invalid seed');
            callback();
        });
    },
    emptyStringBackup: function (callback) {
        csbInteractions.createCSB(csbFolder, '', (err, seed) => {
            assert.false(err, "Error creating CSB: " + (err && err.message));
            assert.true(seed, "Seed is undefined");
            assert.true(Seed.isValidForm(seed), 'Received invalid seed');
            callback();
        });
    },
    restoreState: function (callback) {
        fileStateManager.restoreState(callback);
    }
})();

assert.callback('testCreateCSB', function (callback) {
    flow.start(callback);
}, 2000);
