require('psk-http-client');

const url = "http://localhost:8081/buildCSB";
const interact = require('interact');

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
			$$.remote.createRequestManager(1000);
			//const ris = interact.createRemoteInteractionSpace(alias, endpoint, channel);
			$$.remote.newEndPoint(alias, endpoint, channel);


			$$.remote[alias].on('*', '*', (err, swarm) => {
				if (err) {
					throw err;
				}

				console.log("CSB has been built. Here's the seed:");
				try{
					console.log(swarm.meta.args);
				}catch(err){
					//
				}

				$$.remote[alias].off("*", "*");
			});

		})
	}
});