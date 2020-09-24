const dossierOperations = require('./dossierOperations');
const TransactionManager = require('./TransactionManager');

function executioner(workingDir, callback) {
    const manager = new TransactionManager(workingDir);
    manager.loadTransaction((err, transaction) => {
        if (err) {
            return callback(err);
        }

        if (typeof transaction.keySSI === "undefined") {
            dossierOperations.createArchiveWithDomain(transaction.dlDomain, (err, archive) => {
                if (err) {
                    return callback(err);
                }

                executeCommand(transaction.commands, archive, workingDir, 0, (err) => {
                    if (err) {
                        return callback(err);
                    }

                    archive.getKeySSI(callback);
                });
            });
        }else{
            dossierOperations.createArchiveWithKeySSI(transaction.keySSI, (err, archive) => {
                if (err) {
                    return callback(err);
                }

                console.log("Got archive using keySSI");
                archive.getKeySSI(callback);
            });
        }
    });
}

function executeCommand(commands, archive, workingDir, index = 0, callback) {
    if (!Array.isArray(commands)) {
        return callback(Error(`No commands`));
    }
    if (index === commands.length) {
        return callback();
    }

    const match = judge(commands[index], archive, workingDir, (err) => {
        if (err) {
            return callback(err);
        }

        executeCommand(commands, archive, workingDir, ++index, callback);
    });

    if (!match) {
        return callback(new Error('No match for command found' + commands[index].name));
    }
}

function judge(command, archive, workingDir, callback) {
    switch (command.name) {
        case 'addFile':
            dossierOperations.addFile(workingDir, command.params.dossierPath, archive, callback);
            break;

        case 'mount':
            dossierOperations.mount(workingDir, command.params.path, command.params.seed, archive, callback);
            break;

        default:
            return false;
    }

    return true;
}

module.exports = {
    executioner
};
