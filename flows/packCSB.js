const flowsUtils = require('../../pskwallet/utils/flowsUtils');
const Seed = require('../../pskwallet/utils/Seed');
const RootCSB = require("../../pskwallet/libraries/RootCSB");
const RawCSB = require("../../pskwallet/libraries/RawCSB");
const crypto = require('pskcrypto');
const validator = require("../../pskwallet/utils/validator");
const DseedCage = require("../../pskwallet/utils/DseedCage");
const HashCage = require("../../pskwallet/utils/HashCage");
$$.loadLibrary("flows", require("../../pskwallet/libraries/flows"));
const is = require("interact").createInteractionSpace();


$$.flow.describe('packCSB', {
	start: function (workingDir) {
		process.chdir(workingDir);
		is.startSwarm("createCsb", "start", 'default').on({
			readPin: function (noTries, defaultPin, isFirstCall) {
				if(isFirstCall){
					this.swarm("createMasterCSB", defaultPin);
				}else {
					if (noTries < 3 && noTries > 0) {
						console.log("Invalid pin");
						console.log("Try again");
					}
					utils.insertPassword("Insert pin:", noTries, (err, pin) =>{
						this.swarm("validatePin", pin, noTries);
					})
				}
			},
			printSensitiveInfo: function (seed, defaultPin) {
				this.seed = seed;
			}
		});
	}
});