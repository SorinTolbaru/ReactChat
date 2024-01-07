const express = require("express")
const cors = require("cors")
const socketIo = require("socket.io")
const mongoose = require("mongoose")
const Chat = require("./models/messageSchema.js")
const Account = require("./models/accountsSchema.js")

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

    app.post("/register", async (req, res) => {
      const { user, password } = req.body
      try {
        let found = await Account.findOne({ account: user })
        if (found) {
          res
            .status(206)
            .json({ success: false, message: "User already exists" })
        } else {
          let newUser = new Account({
            account: user,
            password: password,
          })
          newUser.save()
          res
            .status(200)
            .json({ success: true, message: "Registered and connected" })
        }
      } catch (error) {
        console.error("Error registering user:", error)
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" })
      }
    })

    app.post("/login", async (req, res) => {
      const { user, password } = req.body
      try {
        const account = await Account.findOne({ account: user })
        if (account?.password === password) {
          res.status(200).json({ success: true, message: "Login successful" })
        } else {
          res.status(206).json({ success: false, message: "Wrong password" })
        }
      } catch (error) {
        res.status(206).json({ success: false, message: "No user found" })
      }
    })

    io.on("connection", (socket) => {
      socket.on("enter", async (username) => {
        socket.user = username
        onlineUsers.set(socket.id, socket.user)
        const usersMessages = await Chat.find({})
        usersMessages.forEach((e) => {
          socket.emit("receive-message", `${e.from}: ${e.message}`)
        })
        io.emit("receive-message", `${socket.user} connected`)
        console.log(`${socket.user} connected`)
        console.log(onlineUsers)
      })

      socket.on("send-message", (message) => {
        if (message.includes("/pm ")) {
          messageAndTo = splitMessage(message, socket.user)
          let id = getUserId(messageAndTo.to)
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

    function getUserId(fromUser) {
      return Array.from(onlineUsers).find((user) => user.includes(fromUser))
    }
  })
})
