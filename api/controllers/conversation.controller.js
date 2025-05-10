import mongoose from "mongoose";
import createError from "../utils/createError.js";
import Conversation from "../models/conversation.model.js";

// Create a new conversation
export const createConversation = async (req, res, next) => {
  try {
    const sellerId = new mongoose.Types.ObjectId(req.isSeller ? req.userId : req.body.to);
    const buyerId = new mongoose.Types.ObjectId(req.isSeller ? req.body.to : req.userId);

    const newConversation = new Conversation({
      sellerId,
      buyerId,
      readBySeller: req.isSeller,
      readByBuyer: !req.isSeller,
    });

    const savedConversation = await newConversation.save();
    res.status(201).send(savedConversation);
  } catch (err) {
    if (err.code === 11000) {
      return next(createError(400, "Conversation already exists!"));
    }
    next(err);
  }
};

// Update conversation (mark as read automatically)
export const updateConversation = async (req, res, next) => {
  try {
    const updatedConversation = await Conversation.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(req.isSeller ? { readBySeller: true } : { readByBuyer: true }),
        },
      },
      { new: true }
    )
      .populate("sellerId", "username _id")
      .populate("buyerId", "username _id");

    if (!updatedConversation) return next(createError(404, "Conversation not found!"));

    req.io?.emit("conversation_updated", updatedConversation);

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

// Get a single conversation based on sellerId & buyerId
export const getSingleConversation = async (req, res, next) => {
  try {
    const { sellerId, buyerId } = req.query;

    if (!sellerId || !buyerId) {
      return next(createError(400, "sellerId and buyerId are required"));
    }

    if (!mongoose.Types.ObjectId.isValid(sellerId) || !mongoose.Types.ObjectId.isValid(buyerId)) {
      return next(createError(400, "Invalid sellerId or buyerId"));
    }

    let conversation = await Conversation.findOne({
      sellerId: new mongoose.Types.ObjectId(sellerId),
      buyerId: new mongoose.Types.ObjectId(buyerId),
    })
      .populate("sellerId", "username _id")
      .populate("buyerId", "username _id");

    // Jika percakapan belum ada, buat percakapan baru
    if (!conversation) {
      conversation = new Conversation({
        sellerId: new mongoose.Types.ObjectId(sellerId),
        buyerId: new mongoose.Types.ObjectId(buyerId),
        readBySeller: false,
        readByBuyer: false,
      });

      await conversation.save();
    }

    res.status(200).json({
      id: conversation._id,
      sellerId: conversation.sellerId?._id || sellerId,
      sellerUsername: conversation.sellerId?.username || "Seller",
      buyerId: conversation.buyerId?._id || buyerId,
      buyerUsername: conversation.buyerId?.username || "Buyer",
      lastMessage: conversation.lastMessage || "",
      readBySeller: conversation.readBySeller,
      readByBuyer: conversation.readByBuyer,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

// Get all conversations for a user
export const getConversation = async (req, res, next) => {
  try {
    const conversations = await Conversation.find(
      req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }
    )
      .sort({ updatedAt: -1 })
      .populate("sellerId", "username _id")
      .populate("buyerId", "username _id");

    const formattedConversations = conversations
      .filter((conv) => conv.sellerId && conv.buyerId)
      .map((conv) => ({
        id: conv._id,
        sellerId: conv.sellerId._id,
        sellerUsername: conv.sellerId.username,
        buyerId: conv.buyerId._id,
        buyerUsername: conv.buyerId.username,
        lastMessage: conv.lastMessage,
        readBySeller: conv.readBySeller,
        readByBuyer: conv.readByBuyer,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        unread: req.isSeller ? !conv.readBySeller : !conv.readByBuyer,
      }));

    res.status(200).send(formattedConversations);
  } catch (err) {
    next(err);
  }
};

// Delete a conversation
export const deleteConversation = async (req, res, next) => {
  try {
    const deletedConversation = await Conversation.findByIdAndDelete(req.params.id);

    if (!deletedConversation) return next(createError(404, "Conversation not found!"));

    res.status(200).send({ message: "Conversation deleted successfully!" });
  } catch (err) {
    next(err);
  }
};
