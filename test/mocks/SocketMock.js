"use strict";

var EventEmitter = require("events").EventEmitter(),
    util = require("util");


function SocketMock() {

    EventEmitter.call(this);



}

util.inherits(SocketMock, EventEmitter);

module.exports = SocketMock;