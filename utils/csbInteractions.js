const path = require('path');
$$.loadLibrary("flows", require("../../pskwallet/libraries/flows"));
const is = require("interact").createInteractionSpace();



function createCSB(workingDir, backups, callback) {
    let savedSeed;
    is.startSwarm("createCsb", "withoutPin", "", backups, workingDir).on({
        printSensitiveInfo: function (seed, defaultPin) {
            savedSeed = seed;
        },
        handleError: function(err) {
            callback(err);
        },
        __return__: function () {
            callback(undefined, savedSeed);
        }
    });
}

function attachFile(workingDir, fileName, dseed, callback) {
    is.startSwarm("attachFile", "withDseed", dseed, fileName, path.join(workingDir, fileName), workingDir).on({
        handleError: function (err) {
            callback(err);
        },

        __return__: function () {
            callback();
        }
    });
}

function saveBackup(workingDir, dseed, callback){
    is.startSwarm("attachFile", "withDseed", dseed, '', workingDir).on({
        handleError: function (err) {
            callback(err);
        },

        csbBackupReport: function (errors, successes) {
            if(errors.length === 0) {
                errors = undefined;
            }

            callback(errors, successes);
        }
    });
}

module.exports = {
    attachFile,
    createCSB,
    saveBackup
};
