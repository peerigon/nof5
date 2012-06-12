"use strict";

var express = require("express"),
    Directory = require("./Directory.js"),
    routes = require("./."),
    socketIO = require("socket.io");

function startServer(nconf) {
    var dir,
        server = express.createServer(),
        modulePath = nconf.get("modulePath");

    // Enable sockets
    socketIO.listen(server);

    // Configure express app
    server.configure(function(){
        //Setup view rendering
        server.set("views", modulePath + "/views");
        server.set("view engine", "jade");
        server.set('view options', {
            layout: false
        });

        //Setup middleware
        server.use(express.bodyParser()); //@TODO Does server need bodyParser?
        server.use(express.methodOverride()); //@TODO Does server need methodOverride?
        server.use(server.router); //@TODO Does server need router?

        //Setup static files
        server.use(express.static(modulePath + "/public"));
    });

    dir = new Directory(nconf.get("modulePath"));

    //Define route-handler
    //server.get("/", routes.mochaTestRunner);
    //server.get("/mocha", routes.mochaTestRunner);

    //Start express-server
    server.listen(nconf.get("port"), function(){
        console.log("run tests at http://localhost:%d/", server.address().port);
    });

    //Start socket.io-sever
    socketIO.sockets.on("connection", function (socket) {

        dir.on("testDirChange", function () {

            socket.emit("f5");
        });

    });

    socketIO.sockets.on("disconnect", function (socket) {
        console.log("disconnect");
    });
}

exports.startServer = startServer;

