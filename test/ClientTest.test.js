"use strict";

var expect = require("expect.js");

var EventEmitter = require("events").EventEmitter,
    useragent = require("useragent");

var ClientTest = require("../lib/ClientTest.js");

describe("ClientTest", function () {

    var userAgentString = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/536.11 (KHTML, like Gecko) Chrome/20.0.1132.47 Safari/536.11",
        userAgent = useragent.parse(userAgentString),
        clientName = userAgent.family + "/" + userAgent.major + "." + userAgent.minor + "." + userAgent.patch + "/" + userAgent.os,
        error1 = {
            "client": clientName,
            "suite": ["Suite", "Suite2"].toString(),
            "test": "anytest",
            "type": "anytype",
            "stack": "Error: expected 2 to equal 1\n    at Assertion.assert (http://localhost:11234/tests.js:152:13)\n    at Assertion.<anonymous> (http://localhost:11234/tests.js:253:10)\n    at Function.equal (http://localhost:11234/tests.js:522:17)\n    at Context.<anonymous> (http://localhost:11234/tests.js:1306:41)\n    at Test.run (http://localhost:11234/assets/mocha-1.3.0.js:3320:44)\n    at Runner.runTest (http://localhost:11234/assets/mocha-1.3.0.js:3632:22)\n    at http://localhost:11234/assets/mocha-1.3.0.js:3678:26\n    at next (http://localhost:11234/assets/mocha-1.3.0.js:3560:28)\n    at http://localhost:11234/assets/mocha-1.3.0.js:3569:21\n    at next (http://localhost:11234/assets/mocha-1.3.0.js:3517:35)",
            "state": "failed"
        },
        error2 = {
            "client": clientName,
            "suite": ["Suite", "Suite2"].toString(),
            "test": "sometest",
            "type": "sometype",
            "stack": "Error: expected 2 to equal 1\n    at Assertion.assert (http://localhost:11234/tests.js:152:13)\n    at Assertion.<anonymous> (http://localhost:11234/tests.js:253:10)\n    at Function.equal (http://localhost:11234/tests.js:522:17)\n    at Context.<anonymous> (http://localhost:11234/tests.js:1306:41)\n    at Test.run (http://localhost:11234/assets/mocha-1.3.0.js:3320:44)\n    at Runner.runTest (http://localhost:11234/assets/mocha-1.3.0.js:3632:22)\n    at http://localhost:11234/assets/mocha-1.3.0.js:3678:26\n    at next (http://localhost:11234/assets/mocha-1.3.0.js:3560:28)\n    at http://localhost:11234/assets/mocha-1.3.0.js:3569:21\n    at next (http://localhost:11234/assets/mocha-1.3.0.js:3517:35)",
            "state": "failed"
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
                clientTest = new ClientTest(undefined, socketMock);
            }).to.throwError();
        });

        it("should throw an Error if you don't pass a some kind of socket as second argument", function () {
            expect(function () {
                clientTest = new ClientTest(userAgent);
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
           expect(clientTest.getTestState()).to.be.equal('\u001b[32msucceeded\u001b[0m');
        });

        it("should be 'failed' if a test failed", function () {
            socketMock.emit("fail");
            expect(clientTest.getTestState()).to.be.equal('\u001b[31mfailed\u001b[0m');
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

            var errors = [error1, error2];
            
            expect(clientTest.getErrors()).to.be.eql(errors);
        });

    });
});