const fs = require('fs');
const path = require('path');

function CommandsAssistant(localFolder) {

	const filePath = path.join(localFolder, 'commands.json');

	function loadCommands(callback) {
		$$.ensureFolderExists(localFolder, (err) => {
			if (err) {
				return callback(err);
			}

			fs.readFile(filePath, (err, commands) => {
				if (err) {
					return callback(undefined, []);
				}

				callback(undefined, JSON.parse(commands.toString()));
			})
		})
	}

	function saveCommands(commandsArr, callback) {
		$$.ensureFolderExists(localFolder, (err) => {
			if (err) {
				return callback(err);
			}

			fs.writeFile(filePath, JSON.stringify(commandsArr), callback);
		})
	}

	function addCommand(command, callback) {
		loadCommands((err, commandsArr) => {
			if (err) {
				return callback(err);
			}

			commandsArr.push(command);

			saveCommands(commandsArr, callback);
		});
	}

	return {
		addCommand,
		loadCommands
	}
}

module.exports = CommandsAssistant;
