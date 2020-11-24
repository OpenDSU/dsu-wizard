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
                    // Anchor all changes in this transaction
                    return transaction.context.dsu.doAnchoring((err, result) => {
                        if (err) {
                            return callback(err);
                        }
                        return transaction.context.dsu.getKeySSI(callback);
                    });
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

        let resolverMethod = 'loadDSU';
		if(typeof transaction.context.keySSI === "undefined"){
			transaction.context.keySSI = keyssi.buildSeedSSI(transaction.context.domain);
            resolverMethod = 'createDSU';
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

        openDSU.loadApi("resolver")[resolverMethod](transaction.context.keySSI, dsuOptions, (err, dsu)=>{
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
