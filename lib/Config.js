"use strict";

var fs = require("fs"),
    path = require("path");

var _ = require("underscore"),
    config = require("commander");

var packageJSON = require("../package.json");

var Config = function () {

    var self = this;

    config.isTestFolder = true; //There is always a test folder
    config.isLibFolder = false;
    config.isAssetsFolder = false;
    config.isHooks = false;
    config.isWebpackHooks = false;
    config.isBrowserifyHooks = false;
    config.supportedBundlers = [];
    config.writeXUnitFile = false;

    _(fs.readdirSync(path.resolve(__dirname, "bundler"))).each(function parseBundlerName(bundlerName) {
        if (bundlerName.search(/bundler/i) > -1) {
            config.supportedBundlers.push(
                bundlerName
                    .replace(/bundler/i, "")
                    .replace(/\.js/i, "")
            );
        }
    });

    config
        
        .version(packageJSON.version)
        
        .option(
            "-d, --debug", //flags
            "outputs some additional debug output, such as a list of watched folders" //description
        )
        
        .option(
            "-s, --silent", //flags
            "run without console logging" //description
        )

        .option(
            "--list", //flags
            "lists all bundler names" //description
        )
        
        .option(
            "-p, --port <n>", //flags
            "server port. Default: 11234", //description
            parseInt, //action
            11234 //default
        )
        
        .option(
            "-t, --test <dir>", //flags
            "path to test folder. Default: process.cwd()", //description
            function onTest(testFolderPath) { //action
                testFolderPath = path.resolve(testFolderPath);

                if (fs.statSync(testFolderPath).isDirectory() === false) {
                    throw new Error("(nof5) Cannot resolve path to test folder. Given path: " + testFolderPath);
                }

                return testFolderPath;
            },
            process.cwd()
        )
        
        .option(
            "-l, --lib <dir>", //flags
            "path to lib folder", //description
            function onLib(libFolderPath) { //action
                libFolderPath = path.resolve(libFolderPath);

                if (fs.statSync(libFolderPath).isDirectory() === false) {
                    throw new Error("(nof5) Cannot resolve path to lib folder. Given path: " + libFolderPath);
                }

                config.isLibFolder = true;
                
                return libFolderPath;
            },
            null
        )

        .option(
            "-a, --assets <dir>", //flags
            "path to folder where additionally files should be also served as statics", //description
            function onAssets(assets) { //action
                if (fs.statSync(assets).isDirectory() === false) {
                    throw new Error("(nof5) Cannot resolve path to assets folder. Given path: " + assets);
                }

                config.isAssetsFolder = true;

                return assets;
            },
            null //default
        )
        
        .option(
            "-b, --bundler <name>", //flags
            "defines the bundler which should be used. Default: 'Webpack'", //description
            function onBundler(bundler) { //action
                var isSupportedBundler = false;

                _(config.supportedBundlers).find(function findBundler(bundlerName) {
                    isSupportedBundler = bundlerName.search(new RegExp(bundler, "i")) !== -1;
                    return isSupportedBundler;
                });

                if (isSupportedBundler === false) {
                    throw new Error("(nof5) Unsupported bundler: " + bundler);
                }

                return bundler;

            },
            "Webpack" //defaults
        )

        .option(
            "-H, --hooks <file>", //flags
            "path to file with hooks", //description
            function onHooks(hooks) { //action
                if (fs.statSync(hooks).isFile() === false) {
                    throw new Error("(nof5) Cannot resolve path to hooks file. Given path: " + hooks);
                }

                config.isHooks = true;

                return hooks;
            },
            function findHooks() { //default
                var hookPath = process.cwd() + "/nof5.hooks.js";

                try {
                    fs.statSync(hookPath);
                    config.isHooks = true;
                    return hookPath;
                } catch (err) {
                    //Do nothing as this try just based on an assumption
                    return null;
                }
            }()
        )
        
        .option(
            "-W, --wphooks <file>", //flags
            "path to file with hooks for webpack-bundler", //description
            function onWebpackHooks(webpackHooks) { //action
                if (fs.statSync(webpackHooks).isFile() === false) {
                    throw new Error("(nof5) Cannot resolve path to webpack hooks file. Given path: " + webpackHooks);
                }

                config.isWebpackHooks = true;
            
                return webpackHooks;
            },
            function findWebpackHooks() { //default
                var webpackHookPath = process.cwd() + "/nof5.webpack.hooks.js";

                try {
                    fs.statSync(webpackHookPath);
                    config.isWebpackHooks = true;
                    return webpackHookPath;
                } catch (err) {
                    //Do nothing as this try just based on an assumption
                    return null;
                }
            }()
        )
        
        .option(
            "-B, --bhooks <file>", //flag
            "path to file with hooks for browserify-bundler", //description
            function onBrowserifyHooks(browserifyHooks) { //action
                if (fs.statSync(browserifyHooks).isFile() === false) {
                    throw new Error(
                        "(nof5) Cannot resolve path to browserify hooks file. Given path: " + browserifyHooks
                    );
                }

                config.isBrowserifyHooks = true;

                return browserifyHooks;
            },
            function findBrowserifyHooks() { //default
                var browserifyHooksPath = process.cwd() + "/nof5.browserify.hooks.js";
                try {
                    fs.statSync(browserifyHooksPath);
                    config.isBrowserifyHooks = true;
                    return browserifyHooksPath;
                } catch (err) {
                    //Do nothing as this try just based on an assumption
                    return null;
                }
            }()
        )
            
        .option(
            "-x, --xunit <dir>", //flag
            "path to store xunit.xml file.",
            function onXUnitFilePath(XUnitFilePath) {
                XUnitFilePath = path.resolve(XUnitFilePath);
                if (fs.statSync(XUnitFilePath).isDirectory() === false) {
                    throw new Error("(nof5) Cannot resolve path to for xunit file. Given path: " + XUnitFilePath);
                }
                config.writeXUnitFile = true

                return XUnitFilePath;
            },
            null
        )

        .parse(process.argv);

    if (config.test.search("test") > 1 && config.lib === null) {
        try {
            fs.statSync(config.test.replace("test", "lib"));
            config.isLibFolder = true;
            config.lib = config.test.replace("test", "lib");
        } catch (err) {
            //Do nothing as this try just based on an assumption
        }
    }

    //Attach some extras
    config.clientlib = path.resolve(__dirname, "client");
    config.bundlerlib = path.resolve(__dirname, "bundler");

    return config;
};


module.exports = Config;