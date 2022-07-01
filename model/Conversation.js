const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
      }],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversations", ConversationSchema);
