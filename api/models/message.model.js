import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
    },
    userId: {
      type: String,
      required: true, // Ensure senderName is mandatory
    },
    senderName: {
      type: String,
      required: true, // Tambahkan field senderName
    },
    senderImg: {
      type: String,
      default: "/img/noavatar.jpg", // Provide a default image for the sender
    },
    desc: {
      type: String,
      required: true, // Message text must be included
    },
    file: {
      type: String, // Optional file URL (if there’s any attachment)
    },
    status: {
      type: String,
      enum: ["sent", "read"],
      default: "sent", // Default to 'sent' status
    },
    read: {
      type: Boolean,
      default: false, // New messages are unread by default
    },
  },
  { timestamps: true } // Automatically handles createdAt and updatedAt
);

export default mongoose.model("Message", MessageSchema);
