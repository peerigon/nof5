"use strict";

var rewire = require("rewire"),
    expect = require("expect.js"),
    path = require("path");

var commanderMock = require("./mocks/commanderMock.js"),
    Config = rewire("../lib/Config.js");


describe("Config", function () {

    var config,
        argv;

    before(function () {
        //Upgrade eventListener maximum of commander
        Config.__get__("config").setMaxListeners(0);
    });

    beforeEach(function () {
        argv = ["node", process.cwd()];

        Config.__set__("process", {
            "argv": argv,
            "cwd": function () {
                return process.cwd();
            }
        });
    });

    afterEach(function () {
        config = null;
    });

    describe(".construct()", function () {

        it("should return an Object", function () {
            expect(new Config()).to.be.an(Object);
        });

    });

    describe(".", function () {

        describe("port", function () {

            it("should default to 11234 if -p is set", function () {
                config = new Config();

                expect(config.port).to.equal(11234);
            });

            it("should be the value passed with -p", function () {
                argv.push("-p");
                argv.push("12345");

                config = new Config();

                expect(config.port).to.equal(12345);
            });

            it("should be the value passed with --port", function () {
                argv.push("--port");
                argv.push("54321");

                config = new Config();

                expect(config.port).to.equal(54321);
            });

        });

        describe("test", function () {

            it("should default to process.cwd()", function () {
                config = new Config();

                expect(config.test).to.equal(process.cwd());
                expect(config.isTestFolder).to.equal(true);
            });

            it("should be the value passed with -t", function () {
                argv.push("-t");
                argv.push(__dirname);

                config = new Config();

                expect(config.test).to.equal(__dirname);
                expect(config.isTestFolder).to.equal(true);
            });

            it("should be the value passed with --test", function () {
                argv.push("--test");
                argv.push(__dirname);

                config = new Config();

                expect(config.test).to.equal(__dirname);
                expect(config.isTestFolder).to.equal(true);
            });

            it("should throw an error if a non-directory-path was passed", function () {
                argv.push("-t");
                argv.push("/a/not/existing/path/");

                expect(function () {
                    config = new Config();
                }).to.throwError();
            });

        });

        describe("lib", function () {

            it("should default to null", function () {
                config = new Config();

                expect(config.lib).to.equal(null);
                expect(config.isLibFolder).to.equal(false);
            });

            it("should be the value passed with --lib", function () {
                var libFolderPath = path.resolve(__dirname, "../lib/");

                argv.push("--lib");
                argv.push(libFolderPath);

                config = new Config();

                expect(config.lib).to.equal(libFolderPath);
                expect(config.isLibFolder).to.equal(true);
            });

            it("should be the value passed with -l", function () {
                var libFolderPath = path.resolve(__dirname, "../lib/");

                argv.push("-l");
                argv.push(libFolderPath);

                config = new Config();

                expect(config.lib).to.equal(libFolderPath);
                expect(config.isLibFolder).to.equal(true);
            });

            it("should try to assume lib folder path according to test folder path", function () {
                argv.push("-t");
                argv.push(__dirname);

                config = new Config();

                expect(config.lib).to.equal(__dirname.replace("test", "lib"));
                expect(config.isLibFolder).to.equal(true);
            });

            it("should throw an error if a non-directory-path was passed", function () {
                argv.push("-l");
                argv.push("/a/not/existing/path/");

                expect(function () {
                    config = new Config();
                }).to.throwError();
            });

        });

        describe("assets", function () {

            it("should default to null", function () {
                config = new Config();

                expect(config.assets).to.equal(null);
                expect(config.isAssetsFolder).to.equal(false);
            });

            it("should be the value passed with --assets", function () {
                var assetsFolderPath = path.resolve(__dirname, "../example/webpack/assets/");

                argv.push("--assets");
                argv.push(assetsFolderPath);

                config = new Config();

                expect(config.assets).to.equal(assetsFolderPath);
                expect(config.isAssetsFolder).to.equal(true);
            });

            it("should be the value passed with -a", function () {
                var assetsFolderPath = path.resolve(__dirname, "../example/webpack/assets/");

                argv.push("-a");
                argv.push(assetsFolderPath);

                config = new Config();

                expect(config.assets).to.equal(assetsFolderPath);
                expect(config.isAssetsFolder).to.equal(true);
            });

            it("should throw an error if a non-directory-path was passed", function () {
                argv.push("-a");
                argv.push("/a/not/existing/path/");

                expect(function () {
                    config = new Config();
                }).to.throwError();
            });

        });

        describe("bundler", function () {

            it("should default to 'Webpack'", function () {
                config = new Config();

                expect(config.bundler).to.equal("Webpack");
            });

            it("should be the value passed with --bundler", function () {
                var bundlerName = "browserify";

                argv.push("--bundler");
                argv.push(bundlerName);

                config = new Config();

                expect(config.bundler).to.equal(bundlerName);
            });

            it("should be the value passed with -b", function () {
                var bundlerName = "browserify";

                argv.push("-b");
                argv.push(bundlerName);

                config = new Config();

                expect(config.bundler).to.equal(bundlerName);
            });

            it("should throw an error if a non supported bundler was passed", function () {
                argv.push("-b");
                argv.push("harakiri");

                expect(function () {
                    config = new Config();
                }).to.throwError();
            });

        });

        describe("hooks", function () {

            it("should default to null", function () {
               config = new Config();

                expect(config.hooks).to.equal(null);
                expect(config.isHooks).to.equal(false);
            });

            it("should be the value passed with -H", function () {
                var hooksFilePath = path.resolve(__dirname, "../example/browserify/nof5.hooks.js");

                argv.push("-H");
                argv.push(hooksFilePath);

                config = new Config();

                expect(config.hooks).to.equal(hooksFilePath);
                expect(config.isHooks).to.equal(true);
            });

            it("should be the value passed with --hooks", function () {
                var hooksFilePath = path.resolve(__dirname, "../example/browserify/nof5.hooks.js");

                argv.push("--hooks");
                argv.push(hooksFilePath);

                config = new Config();

                expect(config.hooks).to.equal(hooksFilePath);
                expect(config.isHooks).to.equal(true);
            });

            it("should throw an error if on given path is no file", function () {
                var hooksFilePath = path.resolve(__dirname, "../example/browserify/not/existing/nof5.hooks.js");

                argv.push("--hooks");
                argv.push(hooksFilePath);

                expect(function () {
                    config = new Config();
                }).to.throwError();

            });

        });

        describe("wphooks", function () {

            it("should default to null", function () {
                config = new Config();

                expect(config.wphooks).to.equal(null);
                expect(config.isWebpackHooks).to.equal(false);
            });

            it("should be the value passed with -W", function () {
                var wepPackHooksFilePath = path.resolve(__dirname, "../example/webpack/nof5.webpack.hooks.js");

                argv.push("-W");
                argv.push(wepPackHooksFilePath);

                config = new Config();

                expect(config.wphooks).to.equal(wepPackHooksFilePath);
                expect(config.isWebpackHooks).to.equal(true);
            });

            it("should be the value passed with --hooks", function () {
                var wepPackHooksFilePath = path.resolve(__dirname, "../example/webpack/nof5.webpack.hooks.js");

                argv.push("--wphooks");
                argv.push(wepPackHooksFilePath);

                config = new Config();

                expect(config.wphooks).to.equal(wepPackHooksFilePath);
                expect(config.isWebpackHooks).to.equal(true);
            });

            it("should throw an error if on given path is no file", function () {
                var wepPackHooksFilePath = path.resolve(__dirname, "../example/webpack/not/existing/nof5.webpack.hooks.js");

                argv.push("--wphooks");
                argv.push(wepPackHooksFilePath);

                expect(function () {
                    config = new Config();
                }).to.throwError();

            });

        });

        describe("bhooks", function () {

            it("should default to null", function () {
                config = new Config();

                expect(config.bhooks).to.equal(null);
                expect(config.isBrowserifyHooks).to.equal(false);
            });

            it("should be the value passed with -B", function () {
                var browserifyHooksFilePath = path.resolve(__dirname, "../example/browserify/nof5.browserify.hooks.js");

                argv.push("-B");
                argv.push(browserifyHooksFilePath);

                config = new Config();

                expect(config.bhooks).to.equal(browserifyHooksFilePath);
                expect(config.isBrowserifyHooks).to.equal(true);
            });

            it("should be the value passed with --bhooks", function () {
                var browserifyHooksFilePath = path.resolve(__dirname, "../example/browserify/nof5.browserify.hooks.js");

                argv.push("--bhooks");
                argv.push(browserifyHooksFilePath);

                config = new Config();

                expect(config.bhooks).to.equal(browserifyHooksFilePath);
                expect(config.isBrowserifyHooks).to.equal(true);
            });

            it("should throw an error if on given path is no file", function () {
                var browserifyHooksFilePath =
                        path.resolve(__dirname, "../example/browserify/not/existing/nof5.browserify.hooks.js");

                argv.push("--bhooks");
                argv.push(browserifyHooksFilePath);

                expect(function () {
                    config = new Config();
                }).to.throwError();

            });

        });

        describe("clientlib", function () {

            it("should be '../lib/client'", function () {
                config = new Config();

                expect(config.clientlib).to.equal(path.resolve(__dirname, "../lib/client"));
            });

        });

        describe("bundlerlib", function () {

            it("should be '../lib/bundler'", function () {
                config = new Config();

                expect(config.bundlerlib).to.equal(path.resolve(__dirname, "../lib/bundler"));
            });

        });

        describe("supportedBundlers", function () {

            it("should contain all files with postfix Bundler in ..lib/bundler/", function () {

                config = new Config();

                expect(config.supportedBundlers).to.eql([
                    'Browserify',
                    'NOF5',
                    'Webpack'
//                    'Webpack',
//                    'Browserify',
//                    'NOF5'
                ]);

            });

        });

    });

});