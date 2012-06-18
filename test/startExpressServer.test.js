var expect = require("expect.js"),
    startExpressServer = require("../lib/startExpressServer.js");

describe("#start", function () {
   it("should export a Function called start", function () {
       expect(startExpressServer.start).to.be.a(Function);
   });
});
