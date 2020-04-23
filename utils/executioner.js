const dossierOperations = require('./dossierOperations');
const CommandsAssistant = require('./CommandsAssistant');

function executioner(workingDir, callback) {
    const filteredCommands = [];
    let endpoint;

    const commandsAssistant = new CommandsAssistant(workingDir);
    commandsAssistant.loadCommands((err, commands) => {
        if (err) {
            return callback(err);
        }
        for (let i = 0; i < commands.length; ++i) {
            if (commands[i].name === 'addEndpoint') {
                endpoint = commands[i].params.endpoint;
                continue;
            }

            filteredCommands.push(commands[i]);
        }

        dossierOperations.createRawDossier(endpoint, (err, seed) => {
            if (err) {
                return callback(err);
            }

            executeCommand(filteredCommands, seed, workingDir, 0, (err) => {
                if (err) {
                    return callback(err);
                }

                callback(undefined, seed);
            });
        });
    });
}

function executeCommand(commands, seed, workingDir, index = 0, callback) {
    if (index === commands.length) {
        return callback();
    }

    const match = judge(commands[index], seed, workingDir, (err) => {
        if (err) {
            return callback(err);
        }

        executeCommand(commands, seed, workingDir, ++index, callback);
    });

    if (!match) {
        return callback(new Error('No match for command found' + commands[index].name));
    }
}

function judge(command, seed, workingDir, callback) {
    switch (command.name) {
        case 'addFile':
            dossierOperations.addFile(workingDir, command.params.fileName, seed, callback);
            break;
        default:
            return false;
    }

    return true;
}

module.exports = {
    executioner
};
