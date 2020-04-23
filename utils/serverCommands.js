const fs = require("fs");
const path = require("path");
const url = require('url');

const CommandsAssistant = require("./CommandsAssistant");

function addFile(workingDir, FileObj, callback) {
	const cmd = {
		name: 'addFile',
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

function addEndpoint(workingDir, endpointObj, callback) {
	try {
		const endpoint = new url.URL(endpointObj.endpoint).origin;
		const cmd = {
			name: 'addEndpoint',
			params: {
				endpoint: endpoint
			}
		};

		const commandAssistant = new CommandsAssistant(workingDir);
		commandAssistant.addCommand(cmd, callback);
	} catch (e) {
		return callback(e);
	}
}

module.exports = {
	addFile,
	addEndpoint
};
