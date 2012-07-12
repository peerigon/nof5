"use strict";

var path = require("path"),
    expect = require("expect.js");

var socketIO = require("socket.io"),
    EventEmitter = require("events").EventEmitter,
    SimpleExpressServer = require("../lib/SimpleExpressServer.js"),
    SimpleSocketIOServer = require("../lib/SimpleSocketIOServer.js");

describe("SimpleSocketIOServer", function () {

    var testFolderPath = path.resolve(__dirname + "./../example/"),
        socketIOserver,
        expressServer = new SimpleExpressServer(testFolderPath, 11234).start();

    beforeEach(function () {
        socketIOserver = new SimpleSocketIOServer(expressServer);
    });

    describe(".construct()", function () {

        it("should throw an error if no instance of a express-server was passed", function () {
            expect(function () {
            socketIOserver = new SimpleSocketIOServer();
            }).to.throwError();
        });

        it("should inherit from EventEmitter", function () {
           expect(socketIOserver).to.be.an(EventEmitter);
        });

    });

    describe(".start()", function () {

        it("should return a socket.io-server (tested via duck-typing)", function () {
            var startReturn = socketIOserver.start(),
                otherSocketIOServer = socketIO.listen(expressServer);

            expect(typeof startReturn.on).to.be.equal(typeof otherSocketIOServer.on);
        });
    });

});