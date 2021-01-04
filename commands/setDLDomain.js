function setDLDomain(server){
	const commandRegistry = require("../CommandRegistry").getRegistry(server);
	const utils = require("../utils");

	commandRegistry.register("/setDLDomain", "post", (req, callback)=>{
		const transactionManager = require("../TransactionManager");
		utils.bodyParser(req, (err)=>{
			if(err){
				return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to parse body`, err));
			}
			const transaction = transactionManager.getTransaction(req.params.transactionId, (err, transaction) =>{
				if(err || !transaction){
					return callback(err);
				}
				transaction.context.dlDomain = req.body;
				transactionManager.persistTransaction(transaction, (err)=> {
					if (err) {
						return callback(err);
					}
					const command = require("./dummyCommand").create("setDLDomain");
					return callback(undefined, command);
				});
			});
		});
	});
}

module.exports = setDLDomain;