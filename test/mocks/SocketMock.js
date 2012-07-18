"use strict";

var EventEmitter = require("events").EventEmitter,
    util = require("util");

function SocketMock(id) {

    EventEmitter.call(this);

    this.id = id;

}

util.inherits(SocketMock, EventEmitter);

module.exports = SocketMock;