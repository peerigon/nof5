"use strict";

var expect = require("expect.js");

describe("Array", function () {

    it("should be an Array", function () {
        expect([]).to.be.an(Array);
    });

    it("should also be an Array", function () {
        expect(new Array()).to.be.an(Array);
    });

    it("should be an Array with length of 0 ", function () {
       expect([].length).to.be.equal(0);
    });

    it("should be an Array with length of 0 ", function () {
        expect([1].length).to.be.equal(1);
    });

    it("should be an Array with length of 0 ", function () {
        expect([1, 2].length).to.be.equal(1);
    });

});