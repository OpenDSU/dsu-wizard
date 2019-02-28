require('psk-http-client');
const fs = require('fs');
const path = require('path');
const url = "http://localhost:8081/attachFile";

$$.swarm.describe("attachFile", {
	start: function (transactionId, filePath) {
		const rs = fs.createReadStream(filePath);
		const alias = path.basename(filePath);
		console.log('alias', alias);
		$$.remote.doHttpPost(url+"/" +transactionId + '/' + alias, rs, (err, res) => {
			if(err){
				throw err;
			}

			console.log(alias, "has been added.");
		})
	}
});