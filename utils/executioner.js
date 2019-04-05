const csbInteraction = require('./csbInteractions');
const CSBIdentifier = require('pskwallet').CSBIdentifier;
const CommandsAssistant = require('./CommandsAssistant');

function executioner(workingDir, callback) {
    const filteredCommands = [];
    const backups = [];
    let csbIdentifier;

    const commandsAssistant = new CommandsAssistant(workingDir);
    commandsAssistant.loadCommands((err, commands) => {
        for (let i = 0; i < commands.length; ++i) {
            if (commands[i].name === 'addBackup') {
                backups.push(commands[i].params.endpoint);
                continue;
            }

            filteredCommands.push(commands[i]);
        }


        csbInteraction.createCSB(workingDir, backups, (err, seed) => {
            if (err) {
                return callback(err);
            }

            executeCommand(filteredCommands, seed, workingDir, 0, (err) => {
                if (err) {
                    return callback(err);
                }

                csbInteraction.saveBackup(workingDir, seed, (errors, successes) => {
                    if (errors) {
                        return callback(errors);
                    }

                    callback(undefined, seed);
                });
            });
        });
    });
}

function executeCommand(commands, seed, workingDir, index = 0, callback) {
    if (index === commands.length) {
        return callback();
    }

    let match = judge(commands[index], seed, workingDir, (err) => {
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
        case 'attachFile':
            csbInteraction.attachFile(workingDir, command.params.fileName, seed, callback);
            break;
        default:
            return false;
    }

    return true;
}

module.exports = {
    executioner
};
