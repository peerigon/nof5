var expect = require("expect.js"),
    startSocketIOServer = require("../lib/startSocketIOServer.js");

describe("#start", function () {
   it("should export a Function start", function () {
        expect(startSocketIOServer.start).to.be.a(Function);
   });
});