const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const UsersService = require("./UsersService");
const userService = new UsersService();

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  socket.on("join", function(name) {
    userService.addUser({
      id: socket.id,
      name
    });

    io.emit("update", {
      users: userService.getAllUsers()
    });
  });
  socket.on("disconnect", () => {
    userService.removeUser(socket.id);
    socket.broadcast.emit("update", {
      users: userService.getAllUsers()
    });
  });
  socket.on("message", function(message) {
    var { name } = userService.getUserById(socket.id) || "server";
    socket.broadcast.emit("message", {
      text: message.text,
      from: name
    });
  });
});

server.listen(3003, function() {
  console.log("listening on *:3003");
});
