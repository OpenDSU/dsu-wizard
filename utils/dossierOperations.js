const openDSU = require("opendsu");

function createArchive(dlDomain, callback) {
    if (typeof dlDomain === "function") {
        callback = dlDomain;
        dlDomain = "default";
    }

    if (typeof dlDomain === "undefined" || dlDomain === '') {
        dlDomain = "default";
    }

    const keyssi = openDSU.loadApi("keyssi");
    openDSU.loadApi("resolver").createDSU(keyssi.buildSeedSSI(dlDomain), callback);
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