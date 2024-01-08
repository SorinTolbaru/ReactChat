const mongoose = require("mongoose")
const Schema = mongoose.Schema

const chatSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

const Chat = mongoose.model("Message", chatSchema)

module.exports = Chat
