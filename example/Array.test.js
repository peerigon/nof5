"use strict";

var expect = require("expect.js");

describe("Array", function () {

    it("should be an Array", function () {
        expect([]).to.be.an(Array);
    });

    it("should also be an Array", function () {
        expect(new Array()).to.be.an(Array);
    });

});