const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    sender: {
      type: String,
    },
    text: {
      type: String,
    },
      isSeen: {
        type: Number,
        default: 0,
      }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", MessageSchema);
