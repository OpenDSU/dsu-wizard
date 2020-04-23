require('psk-http-client');
function beginCSB() {
	const url = "http://localhost:8081/beginCSB";
	$$.remote.doHttpPost(url, '', (err, res) => {
		if(err){
			console.log("err");
			throw err;
		}

		console.log(res);
	});
}

function addFile(transactionId, filePath) {
	const fs = require('fs');
	const path = require('path');
	const url = "http://localhost:8081/addFile";
	const rs = fs.createReadStream(filePath);
	const alias = path.basename(filePath);
	console.log('alias', alias);
	$$.remote.doHttpPost(url + "/" + transactionId + '/' + alias, rs, (err, res) => {
		if (err) {
			throw err;
		}

		console.log(alias, "has been added.");
	});
}

function addEndpoint(transactionId, endpoint ) {
	const url = "http://localhost:8081/addEndpoint";
	$$.remote.doHttpPost(url + "/" + transactionId, endpoint, (err, res) => {
		if (err) {
			throw err;
		}

		console.log(endpoint, "has been added.");
	});
}

function buildCSB(transactionId) {
	const url = "http://localhost:8081/buildCSB";
	$$.remote.doHttpPost(url + "/" + transactionId, '', (err, res) => {
		if (err) {
			throw err;
		}
		console.log("CSB has been built.");
	});
}

addCommand("begin", "csb", beginCSB, "\t\t\t |add a new PSKNode remote to be managed");
addCommand("attach", "file", addFile, "<transactionId> <filePath>");
addCommand("add", "backup", addEndpoint, "<transactionId> <backupUrl>");
addCommand("build", "csb", buildCSB, "<transactionId>");
