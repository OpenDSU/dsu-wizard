const csbInteraction = require('./csbInteractions');
const Seed = require('pskwallet').Seed;
const CommandsAssistant = require('./CommandsAssistant');

function executioner(workingDir, callback) {
    const filteredCommands = [];
    const backups = [];
    let dseed;

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

            dseed = Seed.generateCompactForm(Seed.deriveSeed(seed));

            executeCommand(filteredCommands, dseed, workingDir, 0, (err) => {
                if (err) {
                    return callback(err);
                }

                csbInteraction.saveBackup(workingDir, dseed, (errors, successes) => {
                    if (errors) {
                        return callback(errors);
                    }

                    callback(undefined, seed);
                });
            });
        });
    });
}

function executeCommand(commands, dseed, workingDir, index = 0, callback) {
    if (index === commands.length) {
        return callback();
    }

    let match = judge(commands[index], dseed, workingDir, (err) => {
        if (err) {
            return callback(err);
        }

        executeCommand(commands, dseed, workingDir, ++index, callback);
    });

    if (!match) {
        return callback(new Error('No match for command found' + commands[index].name));
    }
}

function judge(command, dseed, workingDir, callback) {
    switch (command.name) {
        case 'attachFile':
            csbInteraction.attachFile(workingDir, command.params.fileName, dseed, callback);
            break;
        default:
            return false;
    }

    return true;
}

module.exports = {
    executioner
};
