transactions = {};

function TransactionsManager(){

	this.beginTransaction = function(req, callback){
		const crypto = require("pskcrypto");
		const Queue = require("swarmutils").Queue;
		const randSize = require("./constants").transactionIdLength;

		let transactionId = crypto.randomBytes(randSize).toString('hex');
		transactions[transactionId] = {
			id: transactionId,
			commands: new Queue(),
			context: {
				result: {},
				domain: req.params.domain,
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
		let newKeySSIJustInitialised = false;
		if(typeof transaction === "undefined" ){
			callback(Error('Transaction could not be found'));
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
			console.log(">>>Creating new SeedSSI ", transaction.context.keySSI.getIdentifier(true), transactionId);
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
			resolver[resolverMethod](transaction.context.keySSI, dsuOptions, (err, dsu)=>{
				if(err){
					return callback(err);
				}
				transaction.context.dsu = dsu;
				//start executing the stored commands from transaction
				executeCommand();
			});
		}

        if(resolverMethod === "createDSU" && !newKeySSIJustInitialised){
        	let testSSI = keyssiutil.parse(transaction.context.keySSI.getIdentifier());
			resolver.loadDSU(testSSI, dsuOptions, (err, dsu)=>{
				if(!err && dsu){
					return callback(createOpenDSUErrorWrapper("DSU already exist, refusing to overwrite"));
				}
				//a DSU with this Seed does not exist, so it is safe to create one
				initialiseContextDSU();
			});
		} else {
			initialiseContextDSU();
		}
	}
}

module.exports = new TransactionsManager();
