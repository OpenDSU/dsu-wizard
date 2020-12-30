

function setKeySSI(server){
	const commandRegistry = require("../CommandRegistry").getRegistry(server);
	const utils = require("../utils");

	commandRegistry.register("/setKeySSI", "post", (req, callback)=>{
		const transactionManager = require("../TransactionManager");
		const keyssiSpace = require("opendsu").loadApi("keyssi");
		utils.bodyParser(req, (err)=>{
			if(err){
				return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to parse body`, err));
			}

			const transaction = transactionManager.getTransaction(req.params.transactionId);
			transaction.context.keySSI = keyssiSpace.parse(req.body);
			transaction.context.options.useSSIAsIdentifier = true;
			transactionManager.persistTransaction(transaction, (err)=> {
				if (err) {
					return callback(err);
				}

				const command = require("./dummyCommand").create("setKeySSI");
				return callback(undefined, command);
			});
		});
	});
}

module.exports = setKeySSI;