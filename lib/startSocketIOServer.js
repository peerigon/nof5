"use strict";

var socketIO = require("socket.io");

/**
 * @param {*} expressServer
 * @param {Function} onConnect
 * @param {Function} onDisconnect
 * @return {*}
 */
function start(expressServer, onConnect, onDisconnect) {

    var socketIOServer;

    socketIOServer = socketIO.listen(expressServer, { log: false });

    socketIOServer.sockets.on("connection", onConnect);

    //@TODO Is there a disconnect event?
    socketIOServer.sockets.on("disconnect", onDisconnect);

    return socketIOServer;
}

exports.start = start;