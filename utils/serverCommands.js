const fs = require("fs");
const path = require("path");
const url = require('url');

const CommandsAssistant = require("./CommandsAssistant");

function attachFile(workingDir, FileObj, callback) {
	const cmd = {
		name: 'attachFile',
		params: {
			fileName: FileObj.fileName
		}
	};

	const commandsAssistant = new CommandsAssistant(workingDir);
	const filePath = path.join(workingDir, FileObj.fileName);
	fs.access(filePath, (err) => {
		if (!err) {
			const e = new Error('File already exists');
			e.code = 'EEXIST';
			return callback(e);
		}

		const file = fs.createWriteStream(filePath);

		file.on('close', () => {
			commandsAssistant.addCommand(cmd, callback);
		});

		FileObj.stream.pipe(file);
	});
}

function addBackup(workingDir, backupObj, callback) {
	try {
		let endpoint = new url.URL(backupObj.endpoint).origin;

		const cmd = {
			name: 'addBackup',
			params: {
				endpoint: endpoint
			}
		};

		const commandAssistant = new CommandsAssistant(workingDir);
		commandAssistant.addCommand(cmd, callback);
	} catch (e) {
		callback(e);
	}
}

module.exports = {
	attachFile,
	addBackup
};
