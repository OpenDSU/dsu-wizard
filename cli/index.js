require('../../../builds/devel/pskruntime');
require('../../../builds/devel/consoleTools');
const pskConsole = require('swarmutils').createPskConsole();
$$.loadLibrary("cmds",require('./libraries/cmds/index'));
$$.loadLibrary("wizard",require("./libraries/swarms/index"));
pskConsole.runCommand();
