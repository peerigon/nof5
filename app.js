"use_strict";

var express = require("express"),
    routes = require("./routes"),
    nof5 = module.exports = express.createServer(),
    socketIO = require("socket.io").listen(nof5);

nof5.configure(function(){
    //Setup view rendering
    nof5.set("views", __dirname + "/views");
    nof5.set("view engine", "jade");
    nof5.set('view options', {
        layout: false
    });

    //Setup middleware
    nof5.use(express.bodyParser()); //@TODO Does nof5 need bodyParser?
    nof5.use(express.methodOverride()); //@TODO Does nof5 need methodOverride?
    nof5.use(nof5.router); //@TODO Does nof5 need router?

        //Setup static files
    nof5.use(express.static(__dirname + "/public"));
});

//Define route-handler
nof5.get("/", routes.mochaTestRunner);
nof5.get("/mocha", routes.mochaTestRunner);

//Start express-server
nof5.listen(11234, function(){
  console.log("nof5 listening on port %d", nof5.address().port);
});

//Start socket.io-sever
socketIO.sockets.on("connection", function (socket) {

    //socket.emit("f5");

});