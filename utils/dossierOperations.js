// require("../../../psknode/bundles/edfsBar");
const EDFS = require("edfs");

function createRawDossier(endpoint, callback) {
    const edfs = EDFS.attachToEndpoint(endpoint);
    let rawDossier = edfs.createRawDossier();
    rawDossier.writeFile("default", '', err => {
        if (err) {
            return callback(err);
        }

        rawDossier.delete("default", (err => {
            if (err) {
                return callback(err);
            }

            callback(undefined, rawDossier.getSeed());
        }));
    });
}

function addFile(workingDir, fileName, seed, callback) {
    const path = require("path");
    EDFS.attachWithSeed(seed, (err, edfs) => {
        if (err) {
            return callback(err);
        }
        let rawDossier = edfs.loadRawDossier(seed);
        rawDossier.addFile(path.join(workingDir, fileName), fileName, callback);
    });
}

module.exports = {
    addFile,
    createRawDossier
};