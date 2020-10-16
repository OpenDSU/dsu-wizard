function AddFile(server){
	const pathName = "path";
	const path = require(pathName);
	const fsName = "fs";
	const fs = require(fsName);
	const osName = "os";
	const os = require(osName);

	const utils = require("../utils");

	function createAddFileCommand(filePath, dossierPath){
		const command = {
			execute: function(context, callback){
				context.dsu.addFile(filePath, dossierPath, (err)=>{
					if(err){
						return callback(err);
					}
					//once the file is added into dossier we remove it.
					fs.unlink(filePath, ()=>{
						//we ignore errors that can appear during unlink on windows machines
						return callback();
					});
				});
			}
		}

		return command;
	}

	const commandRegistry = require("../CommandRegistry").getRegistry(server);
	commandRegistry.register("/addFile", "post", (req, callback)=>{
		utils.formDataParser(req, (err, formData)=>{
			if(err){
				return callback(err);
			}
			if(formData.length === 0){
				return callback('No files found');
			}

			let fileContent = formData[0].content;
			const crypto = require("pskcrypto");

			const dossierPath = req.headers["x-dossier-path"];
			let tempFileName = crypto.randomBytes(10).toString('hex');

			fs.mkdtemp(path.join(os.tmpdir(), req.params.transactionId), (err, directory) => {
				if (err){
					return callback(err);
				}

				const tempFilePath = path.join(directory, tempFileName);
				const file = fs.createWriteStream(tempFilePath);

				/*file.on('close', () => {
					return callback(undefined, createAddFileCommand(tempFilePath, dossierPath));
				});

				file.on('error', (err)=>{
					return callback(err);
				});
				req.pipe(file);
				*/

				file.write(fileContent);
				return callback(undefined, createAddFileCommand(tempFilePath, dossierPath));
			});
		});
	});
}

module.exports = AddFile;