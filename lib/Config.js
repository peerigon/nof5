"use strict";

var _ = require("underscore"),
    nconf = require("nconf");

var Config = function () {

    nconf.argv();

    if (nconf.get("help") || nconf.get("h")) {
        console.info("nof5 \n");

        console.info("Options: \n");

        console.info("--help, --h", "\t\t help");
        console.info("--silent, --s", "\t\t no console output");
        console.info("--port, --p", "\t\t server port. defaults to 11234");
        console.info("--tests, --t", "\t\t path to test folder");
        console.info("--lib, --l", "\t\t path to lib folder");
        console.info("--bundler, --b", "\t\t name of bundler that should be used. defaults to 'Webpack'");
        console.info("--hooks", "\t\t path to hooks file");
        console.info("--assets, --a", "\t\t path to folder for assets which should be served as static files");
        console.info("--webpack-hooks", "\t path to webpack hooks file");
        console.info("--browserify-hooks", "\t path to browserify hooks file");

        process.exit(0);
    }

    if (nconf.get("silent") || nconf.get("s")) {
        console.log = function () { /* sound of silence */ };
    }

    this.toJSON = function () {

        var config = {

            "port": nconf.get("port") || nconf.get("p") || 11234,

            "testFolder": nconf.get("tests") || nconf.get("t") || process.cwd(),
            "libFolder": nconf.get("lib") || nconf.get("l"),

            "bundlerFolder": __dirname + "/bundler/",
            "bundlerName": nconf.get("bundler") || nconf.get("b") || "Webpack",

            "hooksFile": nconf.get("hooks"),

            "webpackHooksFile": nconf.get("webpack-hooks"),

            "browserifyHooksFile": nconf.get("browserify-hooks"),

            "clientFolder": __dirname + "/client/",

            "assetsFolder": nconf.get("assets") || nconf.get("a")

        };

        if (!config.libFolder) {
            config.libFolder = config.testFolder.replace("test", "lib");
        }

        if (!config.hooksFile) {
            config.hooksFile = config.testFolder  + "/nof5.hooks.js";
        }

        if (!config.webpackHooksFile) {
            config.webpackHooksFile = config.testFolder + "/nof5.webpack.hooks.js";
        }

        if (!config.browserifyHooksFile) {
            config.browserifyHooksFile = config.testFolder + "/nof5.browserify.hooks.js";
        }

        return config;

    };

};

module.exports = Config;