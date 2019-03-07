const path = require('path');

const VirtualMQ = require('virtualmq');
const httpWrapper = VirtualMQ.getHttpWrapper();
const httpUtils = httpWrapper.httpUtils;
const Server = httpWrapper.Server;
const crypto = require('pskcrypto');
const interact = require('interact');
const serverCommands = require('./utils/serverCommands');
const executioner = require('./utils/executioner');
const QRImage = require('qr-image');

function CSBWizard(listeningPort, rootFolder, callback) {
	const port = listeningPort || 8081;
	const server = new Server().listen(port);
	const randSize = 32;
	rootFolder = path.join(rootFolder, 'CSB_TMP');

	console.log("Listening on port:", port);

	$$.ensureFolderExists(rootFolder, (err) => {
		if(err) {
			throw err;
		}

		console.log("Local folder:", rootFolder);
		registerEndpoints();
		if(typeof callback === 'function') {
			callback();
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

		server.post('/beginCSB', (req, res) => {
			const transactionId = crypto.randomBytes(randSize).toString('hex');
			$$.ensureFolderExists(path.join(rootFolder, transactionId), (err) => {
				if(err) {
					res.statusCode = 500;
					res.end();
					return;
				}

				res.end(transactionId);
			});
		});

		server.post('/attachFile', (req, res) => {
			res.statusCode = 400;
			res.end('Illegal url, missing transaction id');
		});

		server.post('/attachFile/:transactionId/:fileAlias', (req, res) => {
			const transactionId = req.params.transactionId;
			const fileObj = {
				fileName: req.params.fileAlias,
				stream: req
			};

			serverCommands.attachFile(path.join(rootFolder, transactionId), fileObj, (err) => {
				if(err) {
					if(err.code === 'EEXIST') {
						res.statusCode = 409;
					} else {
						res.statusCode = 500;
					}
				}

				res.end();
			})
		});

		server.post('/addBackup', (req, res) => {
			res.statusCode = 400;
			res.end('Illegal url, missing transaction id');
		});

		server.post('/addBackup/:transactionId', httpUtils.bodyParser);

		server.post('/addBackup/:transactionId', (req, res) => {
			const transactionId = req.params.transactionId;

			const backupObj = {
				endpoint: req.body
			};

			serverCommands.addBackup(path.join(rootFolder, transactionId), backupObj, (err) => {
				if(err) {
					res.statusCode = 500;
				}

				res.end();
			});
		});

		server.post('/buildCSB', (req, res) => {
			res.statusCode = 400;
			res.end('Illegal url, missing transaction id');
		});
		server.post('/buildCSB/:transactionId', httpUtils.bodyParser);
		server.post('/buildCSB/:transactionId', (req, res) => {
			const transactionId = req.params.transactionId;
			executioner.executioner(path.join(rootFolder, transactionId), (err, seed) => {
				if(err) {
					res.statusCode = 500;
					console.log("Error", err);
					res.end();
					return;
				}

				if(req.body){
					const body = JSON.parse(req.body);
					const endpoint = body.url;
					const channel = body.channel;
					const ris = interact.createRemoteInteractionSpace('remote', endpoint, channel);
					ris.startSwarm('notifier', 'init', seed.toString());
					res.end(seed.toString());
				}else {
					res.end(seed.toString());
				}
			});
		});

		server.use('/web/*', httpUtils.serveStaticFile(path.join(__dirname, 'web'), '/web'));

		server.use((req, res) => {
			res.statusCode = 404;
			res.end();
		});
	}
}

module.exports = CSBWizard;
