"use strict";

var _ = require("underscore"),
    nconf = require("nconf");

var Config = function () {

    if (nconf.get("help") || nconf.get("h")) {
        console.info("--help, --h", "help");
        console.info("--silent, --s", "no console output");
        console.info("--tests, --t", "path to test folder");
        console.info("--lib, --l", "path to lib folder");
        console.info("--bundler, --b", "name of bundler that should be used. defaults to 'Webpack'");
        console.info("--hooks", "path to hooks file");
        console.info("--webpack-hooks", "path to webpack hooks file");
        console.info("--browserify-hooks", "path to browserify hooks file");

        process.exit(0);
    }

    if (nconf.get("silent") || nconf.get("s")) {
        console.log = function () { /* sound of silence */ };
    }

    this.toJSON = function () {

        var config = {


            "testFolder": nconf.get("tests") || nconf.get("t") || process.cwd(),
            "libFolder": nconf.get("lib") || nconf.get("l"),

            "bundlerFolder": __dirname + "/bundler/",
            "bundlerName": nconf.get("bundler") || nconf.get("b") || "Webpack",

            "hooksFile": nconf.get("hooks"),

            "webpackHooksFile": nconf.get("webpack-hooks"),

            "browserifyHooksFile": nconf.get("browserify-hooks")

        };

        if (!config.libFolder) {
            config.libFolder = config.testFolder.replace("test", "lib");
        }

        if (!config.hooksFile) {
            config.hooksFile = config.testFolder  + "/nof5.hooks.js";
        }

        if (!config.webpackHooksFile) {
            config.webpackHooksFile = config.testFolder + "/webpack.hooks.js";
        }

        if (!config.browserifyHooksFile) {
            config.browserifyHooksFile = config.testFolder + "/browserify.hooks.js";
        }

        return config;

    };

};

module.exports = Config;