const command = require("./dummyCommand");

function setDLDomain(server){
	const commandRegistry = require("../CommandRegistry").getRegistry(server);
	const utils = require("../utils");

	commandRegistry.register("/setDLDomain", "post", (req, callback)=>{
		const transactionManager = require("../TransactionManager");
		console.log("reading body...");
		utils.bodyParser(req, (err)=>{
			if(err){
				return callback(err);
			}
			console.log("m citit transaction id-ul", req.params.transactionId, req.body);
			const transaction = transactionManager.getTransaction(req.params.transactionId);
			transaction.context.dlDomain = req.body;

			return callback(undefined, command);
		});
	});
}

module.exports = setDLDomain;