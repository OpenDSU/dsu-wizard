const fs = require("fs");
const path = require("path");

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

function addBackup(workingDir, backupObj, callback){
	const cmd = {
		name: 'addBackup',
		params: {
			endpoint: backupObj.endpoint
		}
	};

	const commandAssistant = new CommandsAssistant(workingDir);
	commandAssistant.addCommand(cmd, callback);
}

module.exports = {
	attachFile,
	addBackup
};
