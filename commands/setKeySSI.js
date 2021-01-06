

function setKeySSI(server){
	const commandRegistry = require("../CommandRegistry").getRegistry(server);
	const utils = require("../utils");

	commandRegistry.register("/setKeySSI", "post", (req, callback)=>{
		const transactionManager = require("../TransactionManager");
		utils.bodyParser(req, (err)=>{
			if(err){
				return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to parse body`, err));
			}

			transactionManager.getTransaction(req.params.transactionId, (err, transaction) => {
				if (err || !transaction) {
					return callback(err);
				}
				transaction.context.keySSI = req.body;
				transaction.context.options.useSSIAsIdentifier = true;
				transactionManager.persistTransaction(transaction, (err) => {
					if (err) {
						return callback(err);
					}

					const command = require("./dummyCommand").create("setKeySSI");
					return callback(undefined, command);
				});
			});
		});
	});
}

module.exports = setKeySSI;