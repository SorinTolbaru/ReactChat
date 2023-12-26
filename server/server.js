const express = require("express");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();

const server = app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on port http://localhost:5000");

  const io = socketIo(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    console.log("A user connected");


    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
});
