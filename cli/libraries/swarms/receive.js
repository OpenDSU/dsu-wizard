require('psk-http-client');

// const interact = require('interact');
// interact.enableRemoteInteractions();
// const url = "http://localhost:8081/beginCSB";

$$.swarm.describe("receive", {
	start: function () {
		$$.remote['node1'].on('*', '*', (err, res) =>{
			if (err) {
				throw err;
			}

			console.log("seed", res);
		});
	}
});