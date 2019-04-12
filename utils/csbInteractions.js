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

function attachFile(workingDir, fileName, seed, callback) {
    is.startSwarm("attachFile", "withCSBIdentifier", seed, fileName, path.join(workingDir, fileName), workingDir).on({
        handleError: function (err) {
            callback(err);
        },

        __return__: function () {
            callback();
        }
    });
}

function saveBackup(workingDir, seed, callback) {
    is.startSwarm("saveBackup", "withCSBIdentifier", seed, workingDir).on({
        handleError: function (err) {
            callback(err);
        },

        csbBackupReport: function (result) {
            callback(result.errors, result.successes);
        }
    });
}

module.exports = {
    attachFile,
    createCSB,
    saveBackup
};
