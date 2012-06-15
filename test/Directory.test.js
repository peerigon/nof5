var expect = require("expect.js"),
    DirectoryWatcher = require("../lib/DirectoryWatcher.js");

describe("#Directory", function () {

    describe("#construct", function() {
        it("should be a Function", function () {
            expect(DirectoryWatcher).to.be.a(Function);
        });

        it("should be an instance of Directory", function () {
           expect(new DirectoryWatcher()).to.be.an(DirectoryWatcher);
        });
    });

});