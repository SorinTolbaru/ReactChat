const cors = require("cors")
const socket = require("socket.io")
const mongoose = require("mongoose")
const express = require("express")
const Chat = require("./models/messageSchema.js")
const Account = require("./models/accountsSchema.js")
const path = require("path")
require("dotenv").config()

const app = express()
app.use(cors())
app.use(express.json())

const mongoURL = process.env.MONGO_DATABASE_URL

// if (process.env.npm_lifecycle_event !== "server") {
//   app.use(express.static(path.join(__dirname, "..", "client", "build")))
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"))
//   })
// }

mongoose.connect(mongoURL)

const dbConnection = mongoose.connection

dbConnection.on("error", (error) => {
  console.error("MongoDB connection error:", error)
})

dbConnection.once("open", () => {
  console.log("Connected to MongoDB")

  const server = app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port http://localhost:5000")

    const io = socket(server, {
      cors: {
        origin: "*",
        credential: true,
      },
    })

    let onlineUsersList = new Map()

    io.on("connection", async (socket) => {
      socket.on("enter", async (user, password) => {
        socket.user = user
        onlineUsersList.set(user, socket.id)
        console.log(user + " connected")
        try {
          const account = await Account.find({ account: socket.user })
          const accounts = await Account.find({})
          let validPassword = account[0].password === password ? true : false
          socket.emit(
            "update-user-list",
            account[0].contacts,
            accounts.map((u) => u.account),
            validPassword
          )
        } catch (error) {
          console.error("Error getting accounts:", error)
        }
        io.emit("update-status", Array.from(onlineUsersList.keys()))
        console.log(Array.from(onlineUsersList.keys()))
      })

      socket.on("send-message", async (msg) => {
        const messageElement = new Chat({
          message: msg.message,
          from: msg.from,
          to: msg.to,
        })
        messageElement.save()

        //check if a new contact send message and add to contacts
        const account = await Account.find({ account: msg.to })
        if (!account[0].contacts.includes(msg.from)) {
          account[0].contacts.push(msg.from)
          await Account.findOneAndUpdate(
            { _id: account[0].id },
            { $set: { contacts: account[0].contacts } },
            { new: true, runValidators: true }
          )
          socket
            .to(onlineUsersList.get(msg.to))
            .emit("update-user-list", account[0].contacts, null, true)
        }
        socket.to(onlineUsersList.get(msg.to)).emit("recive-message", msg)
      })

      socket.on("get-messages", async (to) => {
        const messages = await Chat.find({})
        socket.emit(
          "get-messages",
          messages.filter(
            (e) =>
              (e.from == socket.user && e.to == to) ||
              (e.from == to && e.to == socket.user)
          )
        )
        const user = await Account.findOne({ account: socket.user })
        if (user && !user.contacts.includes(to)) {
          const id = user.id
          user.contacts.push(to)
          await Account.findOneAndUpdate(
            { _id: id },
            { $set: { contacts: user.contacts } },
            { new: true, runValidators: true }
          )
        }
        io.emit("update-status", Array.from(onlineUsersList.keys()))
      })

      socket.on("user-typing", (typingObj) => {
        if (Array.from(onlineUsersList.keys()).includes(typingObj.to)) {
          io.to(onlineUsersList.get(typingObj.to)).emit(
            "user-typing",
            typingObj.isTyping
          )
        }
      })

      socket.on("disconnect", () => {
        if (socket.user != undefined) {
          console.log(socket.user + " disconnected")
          onlineUsersList.delete(socket.user)
          io.emit("update-status", Array.from(onlineUsersList.keys()))
          console.log(Array.from(onlineUsersList.keys()))
        }
      })
    })
  })
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

app.post("/register", async (req, res) => {
  const { user, password } = req.body
  try {
    let found = await Account.findOne({ account: user })
    if (found) {
      res.status(206).json({ success: false, message: "User already exists" })
    } else {
      let newUser = new Account({
        account: user,
        contacts: [],
        password: password,
      })
      newUser.save()
      res
        .status(200)
        .json({ success: true, message: "Registered and connected" })
    }
  } catch (error) {
    console.error("Error registering user:", error)
    res.status(500).json({ success: false, message: "Internal Server Error" })
  }
})
