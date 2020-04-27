
const URL_PREFIX = "/dossierWizard";

function DossierWizardMiddleware(server){
	const path = require('path');
	const fs = require('fs');
	const VirtualMQ = require('virtualmq');
	const httpWrapper = VirtualMQ.getHttpWrapper();
	const httpUtils = httpWrapper.httpUtils;
	const crypto = require('pskcrypto');
	const serverCommands = require('./utils/serverCommands');
	const executioner = require('./utils/executioner');

	const randSize = 32;
	server.use(`${URL_PREFIX}/*`, function (req, res, next) {
		res.setHeader('Access-Control-Allow-Origin', '*');

		// Request methods you wish to allow
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

		// Request headers you wish to allow
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Content-Length, X-Content-Length');
		next();
	});

	server.post(`${URL_PREFIX}/begin`, (req, res) => {
		const transactionId = crypto.randomBytes(randSize).toString('hex');
		fs.mkdir(path.join(server.rootFolder, transactionId), {recursive: true}, (err) => {
			if (err) {
				res.statusCode = 500;
				res.end();
				return;
			}

			res.end(transactionId);
		});
	});

	server.post(`${URL_PREFIX}/addFile`, (req, res) => {
		res.statusCode = 400;
		res.end('Illegal url, missing transaction id');
	});

	server.post(`${URL_PREFIX}/addFile/:transactionId`, (req, res) => {
		const transactionId = req.params.transactionId;
		const fileObj = {
			dossierPath: req.headers["x-dossier-path"],
			stream: req
		};

		serverCommands.addFile(path.join(server.rootFolder, transactionId), fileObj, (err) => {
			if(err) {
				if(err.code === 'EEXIST') {
					res.statusCode = 409;
				} else {
					res.statusCode = 500;
				}
			}

			res.end();
		});
	});

	server.post(`${URL_PREFIX}/addEndpoint`, (req, res) => {
		res.statusCode = 400;
		res.end('Illegal url, missing transaction id');
	});

	server.post(`${URL_PREFIX}/addEndpoint/:transactionId`, httpUtils.bodyParser);

	server.post(`${URL_PREFIX}/addEndpoint/:transactionId`, (req, res) => {
		const transactionId = req.params.transactionId;
		serverCommands.setEndpoint(path.join(server.rootFolder, transactionId), req.body, (err) => {
			if(err) {
				res.statusCode = 500;
			}

			res.end();
		});
	});

	server.post(`${URL_PREFIX}/build`, (req, res) => {
		res.statusCode = 400;
		res.end('Illegal url, missing transaction id');
	});
	server.post(`${URL_PREFIX}/build/:transactionId`, httpUtils.bodyParser);
	server.post(`${URL_PREFIX}/build/:transactionId`, (req, res) => {
		const transactionId = req.params.transactionId;
		executioner.executioner(path.join(server.rootFolder, transactionId), (err, seed) => {
			if(err) {
				res.statusCode = 500;
				console.log("Error", err);
				res.end();
				return;
			}
			res.end(seed.toString());

		});
	});

	server.use(`${URL_PREFIX}`, (req, res) => {
		res.statusCode = 303;
		let redirectLocation = 'index.html';

		if(!req.url.endsWith('/')) {
			redirectLocation = `${URL_PREFIX}/` + redirectLocation;
		}

		res.setHeader("Location", redirectLocation);
		res.end();
	});

	server.use(`${URL_PREFIX}/*`, httpUtils.serveStaticFile(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, 'modules/dossier-wizard/web'), `${URL_PREFIX}/`));

	server.use((req, res) => {
		res.statusCode = 404;
		res.end();
	});
}
module.exports = DossierWizardMiddleware;
