var expect = require("expect.js");

describe("Object", function () {

    it("should be an Object", function () {
        expect({}).to.be.an(Object);
    });
});