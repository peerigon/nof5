"use strict";

var EventEmitter = require("events").EventEmitter,
    util = require("util"),
    _ = require("underscore"),
    socketIO = require("socket.io");

/**
 * @param {object} expressServerInstance
 * @constructor
 */
var SimpleSocketIOServer = function (expressServerInstance) {

    if (!expressServerInstance) {
        throw new Error("(nof5) No instance of an express-server was passed.");
    }

    EventEmitter.call(this);

    var self = this,
        socketIOServerConfig = {
            log: false
        },
        socketIOServer,
        socketCollection = [];

    /**
     * @return {object}
     */
    this.start = function () {
        socketIOServer = socketIO.listen(expressServerInstance, socketIOServerConfig);

        socketIOServer.on("connection", function onConnection (socket) {
            if(!__isInCollection(socket)) {
                this.emit("connect", socket);
            } else {
                socketCollection.push(socket);
                self.emit("reconnect", socket);
            }
        });

        socketIOServer.on("disconnect", function onDisconnect(disonnectedSocket) {
            socketCollection = _(socketCollection).filter(function filterSockets(socket) {
                return disonnectedSocket !== socket;
            });
            self.emit("disconnect", disonnectedSocket);
        });

        return socketIOServer;
    };

    /**
     * @param {object} socket
     * @return {boolean}
     * @private
     */
    function __isInCollection(socket) {
        return _(socketCollection).indexOf(socket) !== -1;
    }

};

util.inherits(SimpleSocketIOServer, EventEmitter);

module.exports = SimpleSocketIOServer;