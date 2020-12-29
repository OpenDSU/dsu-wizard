function mount(server){
	const commandRegistry = require("../CommandRegistry").getRegistry(server);

	commandRegistry.register("/mount", "post", (req, callback)=>{
		const path = req.headers['x-mount-path'];
		const keySSI = req.headers['x-mounted-dossier-seed'];

		if(typeof path === "undefined" || typeof keySSI === "undefined"){
			return callback('Wrong usage of the command');
		}

		function createExecutableCommand(path, keySSI){
			const command = {
				execute : function(context, callback){
					context.dsu.mount(path, keySSI, callback);
				}
			}
			return command;
		}

		let cmd = {
			args: [path, keySSI],
			type: "mount",
			method: createExecutableCommand
		}

		return callback(undefined, cmd);
	});
}

module.exports = mount;