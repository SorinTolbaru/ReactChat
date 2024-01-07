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
      required: false,
    },
  },
  { timestamps: true }
)

const Chat = mongoose.model("Message", chatSchema)

module.exports = Chat
