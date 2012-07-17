"use strict";

var EventEmitter = require("events").EventEmitter,
    util = require("util");

function SocketIOMock() {

    var self = this

    EventEmitter.call(this);

    this.listen = function () {
        return self;
    };

}

util.inherits(SocketIOMock, EventEmitter);

module.exports = SocketIOMock;