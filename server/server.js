const express = require("express")
const cors = require("cors")
const socketIo = require("socket.io")
const mongoose = require("mongoose")
const Chat = require("./models/messageSchema.js")

const app = express()
app.use(cors())
app.use(express.json())
require("dotenv").config()

const mongoURL = process.env.MONGO_URL
mongoose.connect(mongoURL)

const dbConnection = mongoose.connection

dbConnection.on("error", (error) => {
  console.error("MongoDB connection error:", error)
})

dbConnection.once("open", () => {
  console.log("Connected to MongoDB")

  const server = app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port http://localhost:5000")

    const io = socketIo(server, {
      cors: {
        origin: "*",
        credentials: true,
      },
    })

    const onlineUsers = new Map()

    app.get("/getUsersList", (req, res) => {
      res.send(Array.from(onlineUsers.values()))
    })

    io.on("connection", async (socket) => {
      socket.on("enter", (username) => {
        socket.user = username
        onlineUsers.set(socket.id, socket.user)
        io.emit("receive-message", `${socket.user} connected`)
        console.log(`${socket.user} connected`)
        console.log(onlineUsers)
      })

      socket.on("send-message", (message) => {
        if (message.includes("/pm ")) {
          messageAndTo = splitMessage(message, socket.user)
          let id = Array.from(onlineUsers).find((user) =>
            user.includes(messageAndTo.to)
          )
          if (id && id[0] !== undefined) {
            socket.to(id[0]).emit("receive-message", messageAndTo.msg)
            socket.emit("receive-message", messageAndTo.msg)
          } else {
            socket.emit("receive-message", "Server: User can't be found")
          }
        } else {
          const messageElement = new Chat({
            username: socket.user,
            message: message,
          })
          messageElement.save()
          socket.broadcast.emit("receive-message", `${socket.user}: ${message}`)
          console.log(`${socket.user}: ${message}`)
        }
      })

      socket.on("user-typing", (msg) => {
        io.emit("user-typing", msg)
      })

      socket.on("disconnect", () => {
        onlineUsers.delete(socket.id)
        console.log(`${socket.user} disconnected`)
        io.emit("receive-message", `${socket.user} disconnected`)
        console.log(onlineUsers)
      })
    })

    function splitMessage(msg, su) {
      let u
      let c = msg.slice(0, msg.indexOf(" "))
      let um = msg.slice(c.length + 1, msg.length)
      u = um.slice(0, um.indexOf(" "))
      let m = um.slice(um.indexOf(" "))
      let M = `${su} > ${u}:${m}`
      if (u.length == 0 || um.includes(" ") == false) {
        M = `Invalid pm`
      }

      return { msg: M, to: u }
    }
  })
})
