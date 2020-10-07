transactions = {};

function TransactionsManager(){

	this.beginTransaction = function(callback){
		const crypto = require("pskcrypto");
		const Queue = require("swarmutils").Queue;
		const randSize = require("./constants").transactionIdLength;

		let transactionId = crypto.randomBytes(randSize).toString('hex');
		transactions[transactionId] = {
			id: transactionId,
			commands: new Queue(),
			context: {
				result: {},
				domain: "default",
				options: {useSSIAsIdentifier: false}
			}
		}
		return callback(undefined, transactionId);
	}

	this.getTransaction = function(transactionId){
		return transactions[transactionId];
	}

	this.addCommandToTransaction = function(transactionId, command, callback){
		let transaction = transactions[transactionId];
		if(!transaction){
			callback('Transaction could not be found');
		}

		if(typeof command.execute !== "function"){
			callback('Wrong type of the argument called command');
		}

		transaction.commands.push(command);
		return callback();
	}

	this.closeTransaction = function(transactionId, callback){
		let transaction = transactions[transactionId];
		if(!transaction){
			callback('Transaction could not be found');
		}

		function executeCommand(){
			let command = transaction.commands.pop();
			if(!command){
				if(transaction.commands.length === 0){
					return transaction.context.dsu.getKeySSI(callback);
				}
			}

			command.execute(transaction.context, (err)=>{
				if(err){
					return callback(err);
				}

				executeCommand();
			});
		}

		const openDSU = require("opendsu");
		const keyssi = openDSU.loadApi("keyssi");

		if(typeof transaction.context.keySSI === "undefined"){
			transaction.context.keySSI = keyssi.buildSeedSSI(transaction.context.domain);
		}
		openDSU.loadApi("resolver").createDSU(transaction.context.keySSI, transaction.context.options, (err, dsu)=>{
			if(err){
				return callback(err);
			}
			transaction.context.dsu = dsu;

			//start executing the stored commands from transaction
			executeCommand();
		});
	}
}

module.exports = new TransactionsManager();