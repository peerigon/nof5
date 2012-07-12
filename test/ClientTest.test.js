"use strict";

var expect = require("expect.js");

var EventEmitter = require("events").EventEmitter,
    useragent = require("useragent");

var ClientTest = require("../lib/ClientTest.js");

describe("ClientTest", function () {

    var userAgentString = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.47 Safari/536.11",
        userAgent = useragent.parse(userAgentString),
        error1 = {
            "suite": "anysuite",
            "test": "anytest",
            "type": "anytype"
        },
        error2 = {
            "suite": "somesuite",
            "test": "sometest",
            "type": "sometype"
        },
        clientTest,
        socketMock,

        startTime = new Date().getTime(),
        endTime = startTime + 30000;

    beforeEach(function () {
        socketMock = new EventEmitter();
        clientTest = new ClientTest(userAgentString, socketMock);

        socketMock.emit("start", startTime);
        socketMock.emit("end", endTime);
    });

    describe(".construct()", function () {

        it("should throw an Error if you don't pass a user-agent-string as first argument", function () {
            expect(function () {
                clientTest = new Client(undefined, socketMock);
            }).to.throwError();
        });

        it("should throw an Error if you don't pass a some kind of socket as second argument", function () {
            expect(function () {
                clientTest = new Client(userAgent);
            }).to.throwError();
        });

        it("should be an instance of EventEmitter", function () {
            expect(clientTest).to.be.an(EventEmitter);
        });

    });

    describe(".getName()", function () {

        it("should contain the client family", function () {
            expect(clientTest.getName()).to.match(new RegExp(userAgent.family));
        });

        it("should contain the client version", function () {
            expect(clientTest.getName()).to.match(new RegExp(userAgent.major + "." + userAgent.minor + "." + userAgent.patch));
        });

        it("should contain the os", function () {
            expect(clientTest.getName()).to.match(new RegExp(userAgent.os));
        });

    });

    describe(".getTestTime()", function () {

        it("should return the difference between end- and start-time in seconds", function () {
            expect(clientTest.getTestTime()).to.be.equal((endTime - startTime) / 1000);
        });

    });

    describe(".getTestState()", function () {

        it("should be undefined by default", function () {
            clientTest = new ClientTest(userAgentString, socketMock);
            expect(clientTest.getTestState()).to.be.equal(undefined);
        });

        it("should be 'succeeded' if a test ends without failing", function () {
           expect(clientTest.getTestState()).to.be.equal('succeeded');
        });

        it("should be 'failed' if a test failed", function () {
            socketMock.emit("fail");
            expect(clientTest.getTestState()).to.be.equal('failed');
        });
    });

    describe(".toString()", function () {

        it("should return a string", function () {
            expect(typeof clientTest.toString()).to.be.equal("string");
        });
    });

    describe(".getErrors()", function () {

        it("should return null if no errors where given", function () {
            expect(clientTest.getErrors()).to.be.equal(null);
        });

        it("should return all given errors", function () {
            socketMock.emit("fail", error1);
            socketMock.emit("fail", error2);

            var errors = {};
            errors[error1.suite] = {
                "test": error1.test,
                "type": error1.type
            };
            errors[error2.suite] = {
                "test": error2.test,
                "type": error2.type
            };

            expect(clientTest.getErrors()).to.be.eql(errors);
        });

    });
});