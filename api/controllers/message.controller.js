import createError from "../utils/createError.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";



// Create message
export const createMessage = async (req, res, next) => {
  try {
    const senderImg = req.body.senderImg || "";
    const senderName = req.body.senderName || "";
    const status = req.body.status || "sent";
    const file = req.file ? req.file.path : null;
    
    // Pastikan conversationId valid
    if (!mongoose.Types.ObjectId.isValid(req.body.conversationId)) {
      return next(createError(400, "Invalid conversation ID"));
    }

    // Buat pesan baru
    const newMessage = new Message({
      conversationId: req.body.conversationId,
      userId: req.userId,
      desc: req.body.desc,
      senderImg,
      senderName,
      status,
      file,
    });

    const savedMessage = await newMessage.save();

    // ✅ Perbaiki update Conversation
    const updatedConversation = await Conversation.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.body.conversationId) },
      {
        $set: {
          readBySeller: req.isSeller,
          readByBuyer: !req.isSeller,
          lastMessage: req.body.desc || "File sent", // Pastikan ada lastMessage
        },
      },
      { new: true }
    );

    if (!updatedConversation) {
      console.log("❌ Conversation tidak ditemukan:", req.body.conversationId);
      return next(createError(404, "Conversation not found"));
    }

    res.status(201).send(savedMessage);
  } catch (err) {
    next(err);
  }
};

// Get messages
export const getMessages = async (req, res, next) => {
  try {
    const { id: conversationId } = req.params;

    // Cek apakah conversationId valid
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversationId" });
    }

    // Ambil pesan dari conversationId
    const messages = await Message.find({ conversationId });

    // Jika tidak ada pesan, kirim array kosong agar tidak error
    if (!messages || messages.length === 0) {
      return res.status(200).json([]); // Kirim array kosong tanpa error
    }

    // Tandai pesan sebagai telah dibaca jika bukan milik user sendiri
    const updatedMessages = await Promise.all(
      messages.map(async (message) => {
        if (!message.read && String(message.userId) !== String(req.userId)) {
          return await Message.findByIdAndUpdate(
            message._id,
            { read: true },
            { new: true }
          );
        }
        return message;
      })
    );

    res.status(200).json(updatedMessages); // Kirim pesan yang telah diperbarui
  } catch (err) {
    next(err); // Tangani error
  }
};

// Download file
export const downloadFile = (req, res, next) => {
  const filePath = req.params.filePath;
  const fullPath = path.join(__dirname, "..", "uploads", filePath); // Get the file from uploads folder

  if (fs.existsSync(fullPath)) {
    res.download(fullPath); // Send the file for download
  } else {
    return next(createError(404, "File not found"));
  }
};
// Update read status
export const updateReadStatus = async (req, res, next) => {
  const { id } = req.params; // Ambil ID dari URL parameter
  console.log("📩 Request update read status untuk messageId:", id);

  // Pastikan ID valid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log("❌ Invalid message ID:", id);
    return next(createError(400, "Invalid message ID"));
  }
  const messageId = new mongoose.Types.ObjectId(id);

  try {
    // 🔍 Cari pesan berdasarkan ObjectId
    console.log("🔍 Mencari pesan dengan ID:", messageId);
    const message = await Message.findById(messageId);

    if (!message) {
      console.log("❌ Pesan tidak ditemukan untuk ID:", messageId);
      return next(createError(404, "Message not found"));
    }
    
    console.log("✅ Pesan ditemukan:", message);

    // Cek apakah user menandai pesan sendiri
    if (String(message.userId) === String(req.userId)) {
      console.log("⚠️ User mencoba menandai pesan sendiri sebagai dibaca");
      return next(createError(400, "You cannot mark your own messages as read"));
    }

    // 🔍 Cari semua pesan terkait conversationId
    console.log("🔍 Mencari pesan dalam conversationId:", message.conversationId);
    const unreadMessages = await Message.find({ 
      conversationId: message.conversationId, 
      read: false, 
      userId: { $ne: req.userId }
    });

    console.log("📜 Pesan yang belum dibaca:", unreadMessages.length);

    // 🔄 Update pesan sebagai "read"
    const result = await Message.updateMany(
      { conversationId: message.conversationId, read: false, userId: { $ne: req.userId } },
      { $set: { read: true } }
    );

    console.log("✅ Jumlah pesan yang diperbarui:", result.modifiedCount || 0);
    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    console.error("❌ Error dalam updateReadStatus:", err);
    next(err);
  }
};
