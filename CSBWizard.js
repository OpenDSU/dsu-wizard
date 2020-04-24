const path = require('path');
const fs = require('fs');
const VirtualMQ = require('virtualmq');
const httpWrapper = VirtualMQ.getHttpWrapper();
const httpUtils = httpWrapper.httpUtils;
const Server = httpWrapper.Server;
const crypto = require('pskcrypto');
const serverCommands = require('./utils/serverCommands');
const executioner = require('./utils/executioner');
const url = require('url');

function CSBWizard({listeningPort, rootFolder, sslConfig}, callback) {
	const port = listeningPort || 8081;
	const server = new Server(sslConfig);
	server.listen(port);
	const randSize = 32;
	rootFolder = path.join(rootFolder, 'CSB_TMP');
	console.log("Listening on port:", port);

	fs.mkdir(rootFolder, {recursive: true}, (err) => {
		if(err) {
			throw err;
		}

		console.log("Local folder:", rootFolder);
		registerEndpoints();
		if(typeof callback === 'function') {
			return callback();
		}
	});

	function registerEndpoints() {
		server.use((req, res, next) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Origin');
			res.setHeader('Access-Control-Allow-Credentials', true);
			next();
		});

		server.post('/begin', (req, res) => {
			const transactionId = crypto.randomBytes(randSize).toString('hex');
			fs.mkdir(path.join(rootFolder, transactionId), {recursive: true}, (err) => {
				if (err) {
					res.statusCode = 500;
					res.end();
					return;
				}

				res.end(transactionId);
			});
		});

		server.post('/addFile', (req, res) => {
			res.statusCode = 400;
			res.end('Illegal url, missing transaction id');
		});

		server.post('/addFile/:transactionId/:fileAlias', (req, res) => {
			const transactionId = req.params.transactionId;
			const fileObj = {
				fileName: req.params.fileAlias,
				stream: req
			};

			serverCommands.addFile(path.join(rootFolder, transactionId), fileObj, (err) => {
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

		server.post('/addEndpoint', (req, res) => {
			res.statusCode = 400;
			res.end('Illegal url, missing transaction id');
		});

		server.post('/addEndpoint/:transactionId', httpUtils.bodyParser);

		server.post('/addEndpoint/:transactionId', (req, res) => {
			const transactionId = req.params.transactionId;
			serverCommands.setEndpoint(path.join(rootFolder, transactionId), req.body, (err) => {
				if(err) {
					res.statusCode = 500;
				}

				res.end();
			});
		});

		server.post('/build', (req, res) => {
			res.statusCode = 400;
			res.end('Illegal url, missing transaction id');
		});
		server.post('/build/:transactionId', httpUtils.bodyParser);
		server.post('/build/:transactionId', (req, res) => {
			const transactionId = req.params.transactionId;
			executioner.executioner(path.join(rootFolder, transactionId), (err, seed) => {
				if(err) {
					res.statusCode = 500;
					console.log("Error", err);
					res.end();
					return;
				}
				res.end(seed.toString());

			});
		});

		server.use('/web', (req, res) => {
			res.statusCode = 303;
			let redirectLocation = 'index.html';

			if(!req.url.endsWith('/')) {
				redirectLocation = '/web/' + redirectLocation;
			}

			res.setHeader("Location", redirectLocation);
			res.end();
		});

		server.use('/web/*', httpUtils.serveStaticFile(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, 'modules/dossier-wizard/web'), '/web'));

		server.use((req, res) => {
			res.statusCode = 404;
			res.end();
		});
	}
}

module.exports = CSBWizard;
