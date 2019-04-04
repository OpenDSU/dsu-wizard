const path = require('path');
$$.loadLibrary("flows", require("../../pskwallet/libraries/flows"));
const is = require("interact").createInteractionSpace();


function createCSB(workingDir, backups, callback) {
    let savedSeed;
    is.startSwarm("createCsb", "withoutPin", "", backups, workingDir, undefined, false).on({
        printSensitiveInfo: function (seed, defaultPin) {
            savedSeed = seed;
        },
        handleError: function (err) {
            callback(err);
        },
        __return__: function () {
            callback(undefined, savedSeed);
        }
    });
}

function attachFile(workingDir, fileName, dseed, callback) {
    is.startSwarm("attachFile", "withCSBIdentifier", dseed, fileName, path.join(workingDir, fileName), workingDir).on({
        handleError: function (err) {
            callback(err);
        },

        __return__: function () {
            callback();
        }
    });
}

function saveBackup(workingDir, dseed, callback) {
    is.startSwarm("saveBackup", "withCSBIdentifier", dseed, workingDir).on({
        handleError: function (err) {
            callback(err);
        },

        csbBackupReport: function (result) {
            if (result.errors.length === 0) {
                result.errors = undefined;
            }

            callback(result.errors, result.successes);
        }
    });
}

module.exports = {
    attachFile,
    createCSB,
    saveBackup
};
