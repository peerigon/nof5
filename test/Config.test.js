"use strict";

var expect = require("expect.js");

var Config = require("../lib/Config.js");

describe("Config", function () {

    var config;

    beforeEach(function () {

        config = new Config().toJSON();
    });

    describe (".toJSON()", function () {

        it("should return an Object", function () {
            expect(config).to.be.an(Object);
        });

        it("should use process.cwd() as default for 'testFolder'", function () {
           expect(config.testFolder).to.equal(process.cwd());
        });

        it("should use config.testFolder('test', 'lib') as default for 'libFolder", function () {
           expect(config.libFolder).to.equal(config.testFolder.replace("test", "lib"));
        });

        it("should use config.testFolder + '/nof5.hooks.js' as default for 'hooksFile'", function () {
            expect(config.hooksFile).to.equal(config.testFolder + "/nof5.hooks.js");
        });

        it("should use config.testFolder + '/webpack.hooks.js' as default for 'webpackHooksFile'", function () {
            expect(config.webpackHooksFile).to.equal(config.testFolder + '/webpack.hooks.js');
        });

        it("should use config.testFolder + '/browserify.hooks.js' as default for 'browserifyHooksFile'", function () {
            expect(config.browserifyHooksFile).to.equal(config.testFolder + '/browserify.hooks.js');
        });

    });

});