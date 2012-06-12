var socket = io.connect("http://localhost");

socket.on("f5", location.reload);