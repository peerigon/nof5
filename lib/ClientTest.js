"use strict";

var userAgentParser = require("useragent"),
    EventEmitter = require("events").EventEmitter,
    util = require("util"),
    _ = require("underscore");
       
/**
 * @param {string} userAgent
 * @param {object} socket
 * @constructor
 */
function ClientTest(userAgent, socket) {

    EventEmitter.call(this);

    var self = this,
        startTime,
        endTime,
        success,
        errorCollection = [],
        red = "\u001b[31m",
        green = "\u001b[32m",
        resetColor = "\u001b[0m";

    if (typeof userAgent !== "string") {
        throw new Error("(nof5) First argument must be a user-agent(string), but " + typeof  userAgent + " given.");
    }

    userAgent = userAgentParser.parse(userAgent);

    var versionNumber = userAgent.major + "." + userAgent.minor + "." + userAgent.patch,
        os = userAgent.os,
        name = userAgent.family + "/" + versionNumber + "/" + os;

    if (socket) {

        socket.on("start", function onStart(newStartTime) {
            //console.log("start", newStartTime);
            startTime = new Date(newStartTime);
            success = true;
            errorCollection = [];
        });

        socket.on("fail", function onFail(error) {
            success = false;
            errorCollection.push(error);
        });

        socket.on("end", function onEnd(newEndTime) {
            //console.log("end", newEndTime);
            endTime = new Date(newEndTime);
            self.emit("end");
        });

    }

    /**
     * @param {object} error
     * @return {ClientTest}
     */
    this.addError = function (error) {

        success = false;

        errorCollection.push(error);

        return this;

    };

    /**
     * @return {string}
     */
    this.getName = function () {
        return name;
    };

    /**
     * @return {Number}
     */
    this.getTestTime = function() {

        if (endTime && startTime) {

            return (endTime.getTime() - startTime.getTime()) / 1000;

        }

        return 0;

    };

    /**
     * @return {string|undefined}
     */
    this.getTestState = function() {
        if (success) {
            return green + "succeeded" + resetColor;
        }

        if (success === undefined) {
            return undefined;
        }

        if (!success) {
            return red + "failed" + resetColor;
        }
    };

    /**
     * @return {string}
     */
    this.toString = function () {
        return self.getName() + " has " + self.getTestState() + ". " + "Tests took " + self.getTestTime() + " seconds";
    };

    /**
     * @return {object}
     */
    this.getErrors = function () {
        if (success || success === undefined) {
            return null;
        }
        
        if (!success) {
            var errors = [];
            var singleError = {};

            _(errorCollection).each(function errorCollectionIterator(error) {
                singleError = {
                    "client": self.getName(),
                    "suite": error.suite,
                    "test": error.test,
                    "type": error.type,
                    "stack": error.stack,
                    "state": error.state                    
                };
                errors.push(singleError);    
            });
            
            return errors;
        }
    };
    
    this.getErrorsXUnit = function () {
        var jade = require('jade'),
            path = require("path"),
            jadePath = path.resolve(__dirname, '../xunit.jade'),
            str = require('fs').readFileSync(jadePath, 'utf8'),
            fn = jade.compile(str, {filename: jadePath, pretty: true}),
            errs = this.getErrors();
            
        if (errs === null) {
            return null
        }
        
        return fn({ errs: errs });
    };
    
}

util.inherits(ClientTest, EventEmitter);

module.exports = ClientTest;
