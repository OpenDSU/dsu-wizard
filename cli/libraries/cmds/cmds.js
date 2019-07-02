$$.loadLibrary("swarms", require("../swarms"));

const is = require("interact").createInteractionSpace();

function generateErrorHandler(){
	return function(err, info = '', isWarning){
		if(isWarning){
			console.log("Warning", info);
		} else{
			console.log("Error", info, err);
		}
	};
}

function generateMessagePrinter(){
	return function(message){
		console.log(message);
	};
}

function beginCSB() {
	is.startSwarm("beginCSB", "start").on({
		handleError: generateErrorHandler(),
		printInfo: generateMessagePrinter()
	});
}

function attachFile(transactionId, filePath) {
	is.startSwarm("attachFile", "start", transactionId, filePath).on({
		handleError: generateErrorHandler(),
		printInfo: generateMessagePrinter()
	});
}

function addBackup(transactionId, backupUrl) {
	is.startSwarm("addBackup", "start", transactionId, backupUrl).on({
		handleError: generateErrorHandler(),
		printInfo: generateMessagePrinter()
	});
}

function buildCSB(transactionId) {
	is.startSwarm("buildCSB", "start", transactionId).on({
		handleError: generateErrorHandler(),
		printInfo: generateMessagePrinter()
	});
}

function buildCSBViaVMQ(transactionId, endpoint, alias, channel) {
	is.startSwarm("buildCSBViaVMQ", "start", transactionId, endpoint, alias, channel).on({
		handleError: generateErrorHandler(),
		printInfo: generateMessagePrinter()
	});
}

function receive() {
	is.startSwarm("receive", "start").on({
		handleError: generateErrorHandler(),
		printInfo: generateMessagePrinter()
	});
}

addCommand("begin", "csb", beginCSB, "\t\t\t |add a new PSKNode remote to be managed");
addCommand("attach", "file", attachFile, "<transactionId> <filePath>");
addCommand("add", "backup", addBackup, "<transactionId> <backupUrl>");
addCommand("build", "csb", buildCSB, "<transactionId>");
addCommand("encrypt", "seed", buildCSBViaVMQ, "<transactionId> <endpoint> <alias> <channel> <publicKey>");
addCommand("receive", null, receive);
