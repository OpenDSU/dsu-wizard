function CommandRegistry(server){
	const URL_PREFIX = require("./constants").URL_PREFIX;

	this.register = (url, method, commandFactory)=>{
		const fullUrl = "/dsu-wizard/:domain"+url+"/:transactionId";
		console.log("Registering url", fullUrl, method);
		server[method](fullUrl, (req, res)=>{
			commandFactory(req, (err, command)=>{
				if(err){
					console.log(err);
					res.statusCode = 500;
					return res.end();
				}

				const transactionManager = require("./TransactionManager");
				transactionManager.addCommandToTransaction(req.params.transactionId, command, (err)=>{
					if(err){
						console.log(err);
						res.statusCode = 500;
						return res.end();
					}

					res.statusCode = 200;
					res.end();
				});
			});
		});
	}
}

module.exports = {
	getRegistry : function(server){
		return new CommandRegistry(server);
	}
};