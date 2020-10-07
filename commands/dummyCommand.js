module.exports = {
	execute : function(context, callback){
		//this kind of command isn't to operate on dsu rather on transaction object.
		return callback();
	}
}