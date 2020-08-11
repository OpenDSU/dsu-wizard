const EDFS = require("edfs");

function createArchive(endpoint, seedKey, callback) {
    if (typeof seedKey === "function") {
        callback = seedKey;
        seedKey = undefined;
    }
    $$.BDNS.addConfig("default", {
        endpoints: [
            {
                endpoint: endpoint,
                type: 'brickStorage'
            },
            {
                endpoint: endpoint,
                type: 'anchorService'
            }
        ]
    })
    EDFS.createDSU("RawDossier", callback);
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