require('psk-http-client');
const fs = require('fs');
const path = require('path');
const url = "http://localhost:8081/addBackup";

$$.swarm.describe("addBackup", {
	start: function (transactionId, backupUrl) {
		$$.remote.doHttpPost(url+"/" +transactionId , backupUrl, (err, res) => {
			if(err){
				throw err;
			}

			console.log(backupUrl, "has been added.");
		})
	}
});