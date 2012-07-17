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

        socketIOServer.on("connection", function onConnection (newSocket) {

            var oldSocket = __findSocketById(newSocket.id);

            if(!oldSocket) {
                socketCollection.push(newSocket);
                self.emit("connect", newSocket);
            } else {
                self.emit("reconnect", oldSocket);
            }
        });

        socketIOServer.on("disconnect", function onDisconnect(disonnectedSocket) {
            socketCollection = _(socketCollection).filter(function filterSockets(socket) {
                return disonnectedSocket.id !== socket.id;
            });
            self.emit("disconnect", disonnectedSocket);
        });

        return socketIOServer;
    };

    /**
     * @param {string} socketId
     * @return {object}
     * @private
     */
    function __findSocketById(socketId) {
        return _(socketCollection).find(function socketCollectionFinder(socket) {
            return socket.id === socketId;
        });
    }

};

util.inherits(SimpleSocketIOServer, EventEmitter);

module.exports = SimpleSocketIOServer;