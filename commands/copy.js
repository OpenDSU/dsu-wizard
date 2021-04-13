function Copy(server) {
    const pathName = "path";
    const path = require(pathName);
    const fsName = "fs";
    const fs = require(fsName);
    const osName = "os";
    const os = require(osName);

    const utils = require("../utils");

    function createCopyCommand(src, dest) {
        const command = {
            execute: function (context, callback) {
                context.dsu.cloneFolder(src, dest, callback);
            }
        }

        return command;
    }

    const commandRegistry = require("../CommandRegistry").getRegistry(server);
    commandRegistry.register("/copy", "post", (req, callback) => {
        const src = req.headers["x-src-path"];
        const dest = req.headers["x-dest-path"];

        let cmd = {
            args: [src, dest],
            type: "copy",
            method: createCopyCommand
        }

        return callback(undefined, cmd);
    });
}

module.exports = Copy;