function TransactionsManager(){
	const serverConfig = require("apihub").getServerConfig();
	const config = serverConfig.componentsConfig["dsu-wizard"];

	const WorkerPoolManager = require("./WorkerPoolManager.js");

	const {persistTransaction, getTransaction, getWorkerScript} = require("./TransactionUtils");

	const numberOfWorkers = config.workers || 5;
	const poolManager = new WorkerPoolManager(getWorkerScript(), numberOfWorkers);

	this.persistTransaction = persistTransaction;
	this.getTransaction = getTransaction;

	this.beginTransaction = function(req, callback){
		const crypto = require("pskcrypto");
		const randSize = require("./constants").transactionIdLength;

		let transactionId = crypto.randomBytes(randSize).toString('hex');
		let transaction = {
			id: transactionId,
			commands: [],
			context: {
				result: {},
				dlDomain: req.params.domain,
				domain: req.params.domain,
				options: {useSSIAsIdentifier: false}
			}
		};

		persistTransaction(transaction, (err) => {
			if(err){
				return callback(err);
			}
			callback(undefined, transactionId);
		});
	}

	this.addCommandToTransaction = function(transactionId, command, callback){
		getTransaction(transactionId, (err, transaction)=>{
			if(!transaction || err){
				callback('Transaction could not be found');
			}

			transaction.commands.push(command);
			persistTransaction(transaction, (err)=>{
				if(err){
					return callback(err);
				}
				callback();
			});
		});
	}

	this.closeTransaction = function (transactionId, authorization, callback) {
		getTransaction(transactionId, (err, transaction) => {
			if (typeof transaction === "undefined" || err) {
				return callback(Error('Transaction could not be found'));
			}

			poolManager.runTask({transactionId, authorization}, (err, taskResult)=>{
				if(err){
					return callback(err);
				}

				let {error, result} = taskResult;
				callback(error, result);
			});
		});
	}
}

module.exports = new TransactionsManager();
