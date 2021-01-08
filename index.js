function initWizard(server) {

	const transactionManager = require("./TransactionManager");

	server.post(`/dsu-wizard/:domain/begin`, (req, res)=>{
		transactionManager.beginTransaction(req, (err, transactionId)=>{
			if(err){
				res.statusCode = 500;
				return res.end();
			}
			res.write(transactionId);
			res.end();
		});
	});

	server.post(`/dsu-wizard/:domain/build/:transactionId`, (req, res)=>{
		let authorization = req.headers['authorization'];
		transactionManager.closeTransaction(req.params.transactionId, authorization,(err, result)=>{
			if(err){
				console.log(err);
				res.statusCode = 500;
				res.write(err.toString());
				return res.end();
			}
			res.write(result);
			res.end();
		});
	});

	const commands = require("./commands");
	Object.keys(commands).forEach((commandName)=>{
		commands[commandName](server);
	});

	server.use(`/dsu-wizard`, require("./utils").redirect);

	const pathName = "path";
	const path = require(pathName);
	if (!process.env.PSK_ROOT_INSTALATION_FOLDER) {
		process.env.PSK_ROOT_INSTALATION_FOLDER = require("path").resolve("." + __dirname + "/../..");
	}

	const VirtualMQ = require('apihub');
	const httpWrapper = VirtualMQ.getHttpWrapper();
	const httpUtils = httpWrapper.httpUtils;
	setTimeout(()=>{
		server.use(`/dsu-wizard/:domain/*`, httpUtils.serveStaticFile(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, 'modules/dsu-wizard/web'), `dsu-wizard/`));
	}, 1000);
}

module.exports = {
	initWizard,
	getTransactionManager : function(){
		return require("./TransactionManager");
	},
	getCommandRegistry: function(server){
		return require("./CommandRegistry").getRegistry(server);
	},
	getDummyCommand: function(){
		return require("./commands/dummyCommand");
	},
	utils: require("./utils")
}