const EDFS = require("edfs");

function createArchive(endpoint) {
    const edfs = EDFS.attachToEndpoint(endpoint);
    let archive = edfs.createBar();
    return archive;
}

function addFile(workingDir, fileName, archive, callback) {
    const path = require("path");
    archive.addFile(path.join(workingDir, fileName), fileName, callback);
}

module.exports = {
    addFile,
    createArchive
};