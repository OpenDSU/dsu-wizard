const serverConfig = require("apihub").getServerConfig();
const config = serverConfig.endpointsConfig["dsu-wizard"];

function persistTransaction(transaction, callback){
	const fs = require("fs");
	let serialization = JSON.stringify(transaction, function(key, value) {
		return typeof value === "function" ? value.toString() : value;
	});
	fs.writeFile(getFileForTransaction(transaction.id), serialization, callback);
}

function clearTransaction(transaction, callback){
	const fs = require("fs");
	fs.unlink(getFileForTransaction(transaction.id), callback);
}

function getFileForTransaction(transactionId){
	let path = require("path");
	const storage = path.join(serverConfig.storage, config.storage);

	const fs = require("fs");
	if (!fs.existsSync(storage)) {
		console.log(`[DSU-Wizard] Creating storage folder at path: <${storage}>`);
		fs.mkdirSync(storage, {recursive: true});
	}

	return path.join(storage, transactionId);
}

function getTransaction(transactionId, callback){
	function testIfFunction(value) {
		return /^function.*?\(.*?\)\s*\{(\s*|.*)*\}$/.test(value);
	}

	function convertStringIntoFunction(value) {
		return eval(`(${value})`);
	}

	const fs = require("fs");
	fs.readFile(getFileForTransaction(transactionId), (err, transactionBuffer)=>{
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

function initializeWorker(){

	function TransactionWorker(){
		const { parentPort, isMainThread } = require('worker_threads');

		if(isMainThread){
			throw Error("This script is not meant to be ran in a main thread!");
		}

		let busy = false;
		function deliverMessage(message){
			busy = false;
			parentPort.postMessage(message);
		}

		parentPort.on('message', (message) => {
			//console.log("Received message", message);
			if(busy){
				return parentPort.postMessage({ error: Error("Worker still busy...") });
			}
			if(typeof message.transactionId !== "undefined"){
				busy = true;
				const {transactionId, authorization} = message;

				return getTransaction(transactionId, (err, transaction)=>{
					if(err){
						return deliverMessage({error: err});
					}
					processTransaction(transaction, authorization, (err, result)=>{
						deliverMessage({ error: err, result });
					});
				});
			}
			deliverMessage({ error: Error("Unknown message type") });
		});

		function processTransaction(transaction, authorization, callback){
			let newKeySSIJustInitialised = false;
			if (typeof transaction === "undefined") {
				callback(Error('Transaction could not be found'));
			}

			function authInterceptor(target, callback){
				const {url, headers} = target;
				headers['authorization'] = authorization;
				//console.log("Setting authorization header for url", headers, url);
				return callback(undefined, target);
			}

			function enableAuthorization(){
				let http = require("opendsu").loadApi("http");
				http.registerInterceptor(authInterceptor);
			}

			function resetAuthorization(){
				let http = require("opendsu").loadApi("http");
				http.unregisterInterceptor(authInterceptor);
			}

			const executeCommand = () => {
				let command = transaction.commands.pop();
				//console.log("Preparing to execute command", command);
				if (!command) {
					if (transaction.commands.length === 0) {
						// Anchor all changes in this transaction
						return transaction.context.dsu.doAnchoring((err, result) => {
							if (err) {
								return callback(new Error(`Failed to anchor DSU`, err));
							}
							return transaction.context.dsu.getKeySSI((err, keySSI)=>{
								resetAuthorization();
								callback(err, keySSI);
							});
						});
					}
				}

				command = command.method(...command.args);
				command.execute(transaction.context, (err) => {
					if (err) {
						return callback(new Error(`Failed to execute command`, err));
					}

					executeCommand();
				});
			}

			if(typeof config.bundle !== "undefined"){
				require(config.bundle);
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
				enableAuthorization();
				resolver[resolverMethod](transaction.context.keySSI, dsuOptions, (err, dsu) => {
					if (err) {
						return callback(new Error(`Failed to initialize context DSU`, err));
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
						return callback(new Error("DSU already exist, refusing to overwrite"));
					}
					//a DSU with this Seed does not exist, so it is safe to create one
					initialiseContextDSU();
				});
			} else {
				initialiseContextDSU();
			}
		}
	}

	new TransactionWorker();
}

function getWorkerScript(){
	let script = "";

	script += "const serverConfig = JSON.parse(\'"+JSON.stringify(serverConfig)+"\'); \n";
	script += "const config = serverConfig.endpointsConfig[\"dsu-wizard\"]; \n";
	script += `${getTransaction.toString()} ${getFileForTransaction.toString()} (${initializeWorker.toString()})()`;

	return script;
}

module.exports = {getTransaction, getFileForTransaction, clearTransaction, persistTransaction, getWorkerScript};
