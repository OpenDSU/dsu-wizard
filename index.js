function initWizard(server) {

	const URL_PREFIX = require("./constants").URL_PREFIX;
	const transactionManager = require("./TransactionManager");

	server.post(`${URL_PREFIX}/begin`, (req, res)=>{
		transactionManager.beginTransaction((err, transactionId)=>{
			if(err){
				res.statusCode = 500;
				return res.end();
			}
			res.write(transactionId);
			res.end();
		});
	});

	server.post(`${URL_PREFIX}/build/:transactionId`, (req, res)=>{
		transactionManager.closeTransaction(req.params.transactionId, (err, result)=>{
			if(err){
				res.statusCode = 500;
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

	server.use(`${URL_PREFIX}`, require("./utils").redirect);

	const pathName = "path";
	const path = require(pathName);
	if (!process.env.PSK_ROOT_INSTALATION_FOLDER) {
		process.env.PSK_ROOT_INSTALATION_FOLDER = require("path").resolve("." + __dirname + "/../..");
	}

	const VirtualMQ = require('psk-apihub');
	const httpWrapper = VirtualMQ.getHttpWrapper();
	const httpUtils = httpWrapper.httpUtils;
	setTimeout(()=>{
		server.use(`${URL_PREFIX}/*`, httpUtils.serveStaticFile(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, 'modules/dsu-wizard/web'), `${URL_PREFIX}/`));
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