const EDFS = require("edfs");

function createArchive(endpoint) {
    const edfs = EDFS.attachToEndpoint(endpoint);
    let archive = edfs.createBar();
    return archive;
}

function addFile(workingDir, dossierPath, archive, callback) {
    const path = require("path");
    archive.addFile(path.join(workingDir, path.basename(dossierPath)), dossierPath, callback);
}

module.exports = {
    addFile,
    createArchive
};