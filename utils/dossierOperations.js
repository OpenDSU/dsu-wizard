const EDFS = require("edfs");

function createArchive(endpoint) {
    const edfs = EDFS.attachToEndpoint(endpoint);
    return edfs.createRawDossier();
}

function addFile(workingDir, dossierPath, archive, callback) {
    const path = require("path");
    archive.addFile(path.join(workingDir, path.basename(dossierPath)), dossierPath, callback);
}

function mount(workingDir, path, seed, archive, callback) {
    archive.mount(path, seed, false, callback);
}

module.exports = {
    addFile,
    createArchive,
    mount
};