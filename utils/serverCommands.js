const fs = require("fs");
const path = require("path");
const url = require('url');

const TransactionManager = require("./TransactionManager");

function addFile(workingDir, FileObj, callback) {
    const cmd = {
        name: 'addFile',
        params: {
            fileName: FileObj.fileName
        }
    };

    const manager = new TransactionManager(workingDir);
    const filePath = path.join(workingDir, FileObj.fileName);
    fs.access(filePath, (err) => {
        if (!err) {
            const e = new Error('File already exists');
            e.code = 'EEXIST';
            return callback(e);
        }

        const file = fs.createWriteStream(filePath);

        file.on('close', () => {
            manager.addCommand(cmd, callback);
        });

        FileObj.stream.pipe(file);
    });
}

function setEndpoint(workingDir, endpointObj, callback) {
    let endpoint;
    try {
        endpoint = new url.URL(endpointObj).origin;
    } catch (e) {
        return callback(e);
    }
    const manager = new TransactionManager(workingDir);
    manager.loadTransaction((err, transaction) => {
        if (err) {
            return callback(err);
        }
        transaction.endpoint = endpoint;

        manager.saveTransaction(transaction, callback);
    });
}

module.exports = {
    addFile,
    setEndpoint
};
