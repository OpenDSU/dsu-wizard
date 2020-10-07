function bodyParser(req, callback) {
	let bodyContent = '';

	req.on('data', function (dataChunk) {
		bodyContent += dataChunk;
	});

	req.on('end', function () {
		req.body = bodyContent;
		callback(undefined, req.body);
	});

	req.on('error', function (err) {
		callback(err);
	});
}

function redirect(req, res) {
	const URL_PREFIX = require("./constants").URL_PREFIX;
	res.statusCode = 303;
	let redirectLocation = 'index.html';

	if (!req.url.endsWith('/')) {
		redirectLocation = `${URL_PREFIX}/` + redirectLocation;
	}

	res.setHeader("Location", redirectLocation);
	res.end();
}

module.exports = {
	bodyParser,
	redirect
}