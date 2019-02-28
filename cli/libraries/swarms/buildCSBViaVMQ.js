require('psk-http-client');

const url = "http://localhost:8081/buildCSB";

$$.swarm.describe("buildCSBViaVMQ", {
	start: function (transactionId, endpoint, alias, channel) {
		let publicKey = '';
		const body = JSON.stringify({
			publicKey,
			endpoint,
			alias,
			channel
		});

		$$.remote.doHttpPost(url + "/" + transactionId, body, (err, res) => {
			if (err) {
				throw err;
			}

			$$.remote[alias].on('*', '*', (err, seed) => {
				if (err) {
					throw err;
				}

				console.log("CSB has been built. Here's the seed:");
				console.log(seed);
			});

		})
	}
});