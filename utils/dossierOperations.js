const openDSU = require("opendsu");
const keyssi = openDSU.loadApi("keyssi");

function createArchiveWithKeySSI(keySSI, callback) {
    openDSU.loadApi("resolver").createDSU(keySSI, {useSSIAsIdentifier: true}, callback);
}

function createArchiveWithDomain(dlDomain, callback) {
    openDSU.loadApi("resolver").createDSU(keyssi.buildSeedSSI(dlDomain), callback);
}

function addFile(workingDir, dossierPath, archive, callback) {
    const path = require("path");
    archive.addFile(path.join(workingDir, path.basename(dossierPath)), dossierPath, (err) => {

        if (err) {
            throw err;
        }

        callback(undefined);
    });
}

function mount(workingDir, path, seed, archive, callback) {
    archive.mount(path, seed, callback);
}

module.exports = {
    addFile,
    createArchiveWithDomain,
    createArchiveWithKeySSI,
    mount
};