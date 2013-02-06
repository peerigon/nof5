"use strict";

var EventEmitter = require("events").EventEmitter,
    fs = require("fs"),
    util = require("util"),
    watch = require("watch"),
    _ = require("underscore");

function Watcher(rootFolder) {
    var self = this,
        ready = false;

    EventEmitter.call(this);

    if (fs.existsSync(rootFolder) === false) {
        throw new Error("(nof5) Cannot watch path '" + rootFolder + "': Path doesn't exist");
    }

    watch.watchTree(rootFolder, function (f, curr, prev) {
        if (typeof f === "object" && prev === null && curr === null) {
            self.emit("ready");
        } else {
            self.emit("change");
        }
    });
}

util.inherits(Watcher, EventEmitter);

module.exports = Watcher;