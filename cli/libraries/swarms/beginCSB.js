require('psk-http-client');

const url = "http://localhost:8081/beginCSB";

$$.swarm.describe("beginCSB", {
	start: function () {
		$$.remote.doHttpPost(url, '', (err, res) => {
			if(err){
				console.log("err");
				throw err;
			}

			console.log(res);
		});
	}
});