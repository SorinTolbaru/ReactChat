const express = require("express")
const cors = require("cors")
const socketIo = require("socket.io")

const app = express()
app.use(cors())
app.use(express.json())
require("dotenv").config()

const server = app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port http://localhost:5000")

  const io = socketIo(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  })

  io.on("connection", async (socket) => {
    socket.on("enter", () => {
      console.log("A user connected")
    })

    socket.on("send-message", (message) => {
      io.emit("receive-message", message)
    })

    socket.on("disconnect", () => {
      console.log("A user disconnected")
    })
  })
})
