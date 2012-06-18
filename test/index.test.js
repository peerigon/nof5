var expect = require("expect.js"),
    index = require("../lib/index.js");

describe("#start", function () {
    it("should export a Function called start", function () {
        expect(index.start).to.be.a(Function);
    });
});