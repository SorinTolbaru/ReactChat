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

  const onlineUsers = new Set()

  app.get("/getUsersList", (req, res) => {
    res.send(Array.from(onlineUsers))
  })

  io.on("connection", async (socket) => {
    socket.on("enter", (username) => {
      socket.user = username
      onlineUsers.add(socket.user, socket.id)
      console.log(`${socket.user} connected`)
      console.log(onlineUsers)
    })

    socket.on("send-message", (message) => {
      io.emit("receive-message", `${socket.user}: ${message}`)
    })

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.user)
      console.log(`${socket.user} disconnected`)
      console.log(onlineUsers)
    })
  })
})
