var expect = require("expect.js"),
    getConfig = require("../lib/getConfig.js"),
    defaultConfig = require("../defaultConfig.json");

describe("#getConfig", function () {

    var config = getConfig();

    before(function () {
        config.modulePath = process.cwd();
    });

    it("should return an Object", function () {
        expect(config).to.be.an(Object);
    });

    it("should return an Object eql to defaultConfig.json", function () {
        expect(config).to.be.eql(defaultConfig);
    });
});