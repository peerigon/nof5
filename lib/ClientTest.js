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
        errorCollection = [];

    if (typeof userAgent !== "string") {
        throw new Error("(nof5) First argument must be a user-agent(string), but " + typeof  userAgent + " given.");
    }

    userAgent = userAgentParser.parse(userAgent);

    var versionNumber = userAgent.major + "." + userAgent.minor + "." + userAgent.patch,
        os = userAgent.os,
        name = userAgent.family + "/" + versionNumber + "/" + os;

    socket.on("start", function onStart(newStartTime) {
        startTime = new Date(newStartTime);
        success = true;
        errorCollection = [];
    });

    socket.on("fail", function onFail(error) {
        success = false;
        errorCollection.push(error);
    });

    socket.on("end", function onEnd(newEndTime) {
        endTime = new Date(newEndTime);
        self.emit("end");
    });

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
        return (endTime.getTime() - startTime.getTime()) / 1000;
    };

    /**
     * @return {string|undefined}
     */
    this.getTestState = function() {
        if (success) {
            return "succeeded";
        }

        if (success === undefined) {
            return undefined;
        }

        if (!success) {
            return "failed";
        }
    };

    /**
     * @return {string}
     */
    this.toString = function () {
        var string = [self.getName() + ":"];

        string.push(self.getTestState());
        string.push("Tests took " + self.getTestTime() + " seconds");

        return string.join(". ");
    };

    /**
     * @return {object}
     */
    this.getErrors = function () {
        if (success || success === undefined) {
            return null;
        }

        if (!success) {
            var errors = {};

            _(errorCollection).each(function errorCollectionIterator(error) {
                errors[error.suite] = {
                    "test": error.test,
                    "type": error.type
                };
            });

            return errors;
        }
    };
}

util.inherits(ClientTest, EventEmitter);

module.exports = ClientTest;