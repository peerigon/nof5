"use strict";

var path = require("path"),
    expect = require("expect.js"),
    rewire = require("rewire");

var socketIO = require("socket.io"),
    SocketIOMock = require("./mocks/socketIOMock.js"),
    EventEmitter = require("events").EventEmitter,
    SimpleExpressServer = require("../lib/SimpleExpressServer.js"),
    SimpleSocketIOServer = rewire("../lib/SimpleSocketIOServer.js");

describe("SimpleSocketIOServer", function () {

    var testFolderPath = path.resolve(__dirname + "./../example/"),
        socketIOServer,
        expressServer;

    beforeEach(function () {
        expressServer = new SimpleExpressServer(testFolderPath, 11234).start();
        socketIOServer = new SimpleSocketIOServer(expressServer);
    });

    afterEach(function () {
        expressServer.close();
    });

    describe(".construct()", function () {

        it("should throw an error if no instance of a express-server was passed", function () {
            expect(function () {
            socketIOServer = new SimpleSocketIOServer();
            }).to.throwError();
        });

        it("should inherit from EventEmitter", function () {
           expect(socketIOServer).to.be.an(EventEmitter);
        });

    });

    describe(".start()", function () {

        it("should return a socket.io-server (tested via duck-typing)", function () {
            var startReturn = socketIOServer.start(),
                otherSocketIOServer = socketIO.listen(expressServer, { log: false });

            expect(typeof startReturn.on).to.be.equal(typeof otherSocketIOServer.on);
        });
    });

    describe("'connect'-Event", function () {

        var socketIOMock,
            sockets;

        beforeEach(function () {

            socketIOMock = new SocketIOMock();
            sockets = [{
                "id": 1
            }, {
                "id": "2"
            }, {
                "id": "id1"
            }];

            SimpleSocketIOServer.__set__({
                "socketIO": socketIOMock
            });

            socketIOServer = new SimpleSocketIOServer(expressServer);
            socketIOServer.start();

        });

        it("should emit an event called 'connect' if a new socket-connection has been established", function (done) {
            socketIOServer.on("connect", function () {
                done();
            });
            socketIOMock.emit("connection", sockets[0]);
        });

        it("should pass the new socket as argument to 'connect'-listener's callback", function (done) {
            socketIOServer.on("connect", function (socket) {
                expect(socket.id).to.be.equal(sockets[0].id);
                done();
            });

            socketIOMock.emit("connection", sockets[0]);
        });

        it("should emit an event called 'reconnect' if a old socket-connection has been established", function (done) {
            socketIOServer.on("reconnect", function () {
                done();
            });

            socketIOMock.emit("connection", sockets[0]);
            socketIOMock.emit("connection", sockets[0]);
        });

        it("should pass old socket as argument to 'reconnect'-listener's callback", function (done) {
            socketIOServer.on("reconnect", function () {
                done();
            });

            socketIOMock.emit("connection", sockets[0]);
            socketIOMock.emit("connection", sockets[0]);
        });

        it("should emit an event 'disconnect' if a socket-connection has been closed", function (done) {
            socketIOServer.on("disconnect", function () {
                done();
            });

            socketIOMock.emit("disconnect");
        });

        it("should pass the closed socket as argument to 'disconnect'-listener's callback", function () {
            socketIOServer.on("disconnect", function (socket) {
                expect(socket.id).to.be.equal(sockets[2].id);
            });

            socketIOMock.emit("connection", sockets[0]);
            socketIOMock.emit("connection", sockets[1]);
            socketIOMock.emit("connection", sockets[2]);

            socketIOMock.emit("disconnect", sockets[2]);
        });

    });

});