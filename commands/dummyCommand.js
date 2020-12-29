module.exports.create = function(name){
	function createExecutableCommand(){
		const command = {
			execute : function(context, callback){
				return callback();
			}
		}
		return command;
	}

	let cmd = {
		args: [],
		type: name,
		method: createExecutableCommand
	}
	return cmd;
}