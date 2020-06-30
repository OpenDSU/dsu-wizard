const EDFS = require("edfs");

function createArchive(endpoint, seedKey, callback) {
    if (typeof seedKey === "function") {
        callback = seedKey;
        seedKey = undefined;
    }
    const edfs = EDFS.attachToEndpoint(endpoint);
    if (typeof seedKey !== "undefined") {
        const barModule = require("bar");
        const Seed = barModule.Seed;
        const seed = new Seed(undefined, endpoint, seedKey);
        edfs.loadRawDossier(seed.getCompactForm(), callback)
    } else {
        edfs.createRawDossier(callback);
    }
}

function addFile(workingDir, dossierPath, archive, callback) {
    const path = require("path");
    archive.addFile(path.join(workingDir, path.basename(dossierPath)), dossierPath, callback);
}

function mount(workingDir, path, seed, archive, callback) {
    archive.mount(path, seed, callback);
}

module.exports = {
    addFile,
    createArchive,
    mount
};