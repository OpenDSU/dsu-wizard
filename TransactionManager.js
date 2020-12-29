function TransactionsManager(){

	this.beginTransaction = function(req, callback){
		const crypto = require("pskcrypto");
		const randSize = require("./constants").transactionIdLength;

		let transactionId = crypto.randomBytes(randSize).toString('hex');
		let transaction = {
			id: transactionId,
			commands: [],
			context: {
				result: {},
				domain: req.params.domain,
				options: {useSSIAsIdentifier: false}
			}
		};

		this.persistTransaction(transaction, (err) => {
			if(err){
				return callback(err);
			}
			callback(undefined, transactionId);
		});
	}

	this.persistTransaction = function(transaction, callback){
		const fs = require("fs");
		let serialization = JSON.stringify(transaction, function(key, value) {
			return typeof value === "function" ? value.toString() : value;
		});
		//console.log("Preparing to persist transaction into file", this.getFileForTransaction(transaction.id));
		fs.writeFile(this.getFileForTransaction(transaction.id), serialization, callback);
	}

	this.clearTransaction = function(transaction, callback){
		const fs = require("fs");
		fs.unlink(this.getFileForTransaction(transaction.id), callback);
	}

	this.getFileForTransaction = function(transactionId){
		const serverConfig = require("apihub").getServerConfig();
		const config = serverConfig.endpointsConfig["dsu-wizard"];
		let path = require("path");
		const storage = path.join(serverConfig.storage, config.storage);

		const fs = require("fs");
		if (!fs.existsSync(storage)) {
			console.log(`[DSU-Wizard] Creating storage folder at path: <${storage}>`);
			fs.mkdirSync(storage, {recursive: true});
		}

		return path.join(storage, transactionId);
	}

	this.getTransaction = function(transactionId, callback){
		function testIfFunction(value) {
			return /^function.*?\(.*?\)\s*\{(\s*|.*)*\}$/.test(value);
		}

		function convertStringIntoFunction(value) {
			return eval(`(${value})`);
		}

		const fs = require("fs");
		fs.readFile(this.getFileForTransaction(transactionId), (err, transactionBuffer)=>{
			let serialization = transactionBuffer.toString();
			let transaction;
			try{
				transaction = JSON.parse(serialization, function(key, value) {
					if (testIfFunction(value)) {
						return convertStringIntoFunction(value);
					} else {
						return value;
					}
				});
			}catch(err){
				return callback(err);
			}
			return callback(undefined, transaction);
		});
	}

	this.addCommandToTransaction = function(transactionId, command, callback){
		this.getTransaction(transactionId, (err, transaction)=>{
			if(!transaction || err){
				callback('Transaction could not be found');
			}

			transaction.commands.push(command);
			this.persistTransaction(transaction, (err)=>{
				if(err){
					return callback(err);
				}
				callback();
			});
		});
	}

	this.closeTransaction = function (transactionId, callback) {
		this.getTransaction(transactionId, (err, transaction) => {
			let newKeySSIJustInitialised = false;
			if (typeof transaction === "undefined") {
				callback(Error('Transaction could not be found'));
			}

			const executeCommand = () => {
				let command = transaction.commands.pop();
				//console.log("Preparing to execute command", command);
				if (!command) {
					if (transaction.commands.length === 0) {
						// Anchor all changes in this transaction
						return transaction.context.dsu.doAnchoring((err, result) => {
							if (err) {
								return callback(createOpenDSUErrorWrapper(`Failed to anchor DSU`, err));
							}
							this.clearTransaction(transaction, (err)=>{
								if(err){
									//todo: do we need to do something if we fail to remove transaction?
								}
								return transaction.context.dsu.getKeySSI(callback);
							});
						});
					}
				}

				command = command.method(...command.args);
				command.execute(transaction.context, (err) => {
					if (err) {
						return callback(createOpenDSUErrorWrapper(`Failed to execute command`, err));
					}

					executeCommand();
				});
			}

			const openDSU = require("opendsu");
			const keyssi = openDSU.loadApi("keyssi");

			let resolverMethod = 'loadDSU';
			if (typeof transaction.context.keySSI === "undefined") {
				transaction.context.keySSI = keyssi.buildSeedSSI(transaction.context.domain);
				resolverMethod = 'createDSU';
				newKeySSIJustInitialised = true;
			}

			if (transaction.context.forceNewDSU) {
				resolverMethod = 'createDSU';
			}

			const dsuOptions = transaction.context.options || {};
			if (typeof dsuOptions.anchoringOptions === 'undefined') {
				dsuOptions.anchoringOptions = {};
			}

			if (typeof dsuOptions.anchoringOptions.decisionFn !== 'function') {
				dsuOptions.anchoringOptions.decisionFn = (brickMap, callback) => {
					// Prevent "auto anchoring" each file
					// Anchoring will be manually triggered
					// when closing the transaction
					callback(false);
				};
			}
			let resolver = openDSU.loadApi("resolver");
			let keyssiutil = openDSU.loadApi("keyssi");

			let initialiseContextDSU = () => {
				resolver[resolverMethod](transaction.context.keySSI, dsuOptions, (err, dsu) => {
					if (err) {
						return callback(createOpenDSUErrorWrapper(`Failed to initialize context DSU`, err));
					}
					transaction.context.dsu = dsu;
					//start executing the stored commands from transaction
					executeCommand();
				});
			}

			if (resolverMethod === "createDSU" && !newKeySSIJustInitialised) {
				let testSSI = keyssiutil.parse(transaction.context.keySSI);
				resolver.loadDSU(testSSI, dsuOptions, (err, dsu) => {
					if (!err && dsu) {
						return callback(createOpenDSUErrorWrapper("DSU already exist, refusing to overwrite"));
					}
					//a DSU with this Seed does not exist, so it is safe to create one
					initialiseContextDSU();
				});
			} else {
				initialiseContextDSU();
			}
		});
	}
}

module.exports = new TransactionsManager();
