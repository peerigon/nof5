"use strict";

var express = require("express");

/**
 *
 * @param {String} modulePath
 * @param {Function} testRunner
 * @param port
 * @return {*}
 */
function start(modulePath, testRunner, port) {
    var server,
        socketIOServer;

    server = express.createServer();
    
    // Configure express app
    server.configure(function(){
        //Setup view rendering
        server.set("views", __dirname + "/views");
        server.set("view engine", "jade");
        server.set('view options', {
            layout: false
        });

        //Setup middleware
        server.use(express.bodyParser()); //@TODO Does server need bodyParser?
        server.use(express.methodOverride()); //@TODO Does server need methodOverride?
        server.use(server.router); //@TODO Does server need router?

        //Setup static files
        server.use(express.static(__dirname + "/public"));
        server.use("/test", express.static(modulePath + "/test"));
    });

    //Define route-handler
    server.get("/", testRunner);

    //Start express-server
    server.listen(port, function(){
        console.log("Tests will run at http://localhost:%d/", server.address().port);
    });

    return server;
}

exports.start = start;