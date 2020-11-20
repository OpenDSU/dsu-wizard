const command = require("./dummyCommand");

function setDLDomain(server){
	const commandRegistry = require("../CommandRegistry").getRegistry(server);
	const utils = require("../utils");

	commandRegistry.register("/setDLDomain", "post", (req, callback)=>{
		const transactionManager = require("../TransactionManager");
		utils.bodyParser(req, (err)=>{
			if(err){
				return callback(err);
			}
			const transaction = transactionManager.getTransaction(req.params.transactionId);
			transaction.context.dlDomain = req.body;

			return callback(undefined, command);
		});
	});
}

module.exports = setDLDomain;