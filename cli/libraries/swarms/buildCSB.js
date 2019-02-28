require('psk-http-client');

const url = "http://localhost:8081/buildCSB";

$$.swarm.describe("buildCSB", {
	start: function (transactionId) {
		$$.remote.doHttpPost(url + "/" + transactionId, '', (err, res) => {
			if (err) {
				throw err;
			}

			console.log("CSB has been built.");
		})
	}
});