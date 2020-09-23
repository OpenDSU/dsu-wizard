if (!process.env.PSK_ROOT_INSTALATION_FOLDER) {
    process.env.PSK_ROOT_INSTALATION_FOLDER = require("path").resolve("." + __dirname + "/../..");
}
module.exports = require("./DossierWizardMiddleware");

