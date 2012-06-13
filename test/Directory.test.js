var expect = require("expect.js"),
    Directory = require("../lib/Directory.js");

describe("#Directory", function () {

    describe("#construct", function() {
        it("should be a Function", function () {
            expect(Directory).to.be.a(Function);
        });

        it("should be an instance of Directory", function () {
           expect(new Directory()).to.be.an(Directory);
        });
    });

});