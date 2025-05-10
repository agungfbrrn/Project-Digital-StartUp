import createError from "../utils/createError.js";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import mongoose from "mongoose";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const IDR_TO_USD_CONVERSION_RATE = parseFloat(process.env.IDR_TO_USD_CONVERSION_RATE) || 15885;
const stripe = new Stripe(process.env.STRIPE);

/**
 * ✅ Membuat Payment Intent untuk order baru
 */
// Controller intent untuk pengecekan status order
export const intent = async (req, res, next) => {
  try {
    const { gigId } = req.body;
    if (!gigId) return res.status(400).json({ message: "gigId diperlukan" });

    // Cek apakah user memiliki order yang masih pending atau gagal
    let existingOrder = await Order.findOne({
      gigId,
      buyerId: req.userId,
      status: { $in: ["pending", "failed"] },
    });

    if (existingOrder) {
      // Jika sudah ada order pending, kembalikan pesan error dengan status 409
      if (existingOrder.status === "pending") {
        return res.status(409).json({ message: "Pesanan anda masih tersimpan." });
      }

      // Jika status order "failed", hapus order lama dan buat yang baru
      if (existingOrder.status === "failed" && existingOrder.paymentIntentId) {
        await stripe.paymentIntents.cancel(existingOrder.paymentIntentId);
        await Order.findByIdAndDelete(existingOrder._id);
      }
    }

    // Ambil data gig
    const gig = await Gig.findById(gigId).lean();
    if (!gig) return res.status(404).json({ message: "Gig tidak ditemukan" });

    if (gig.price <= 0) {
      return res.status(400).json({ message: "Harga gig tidak valid" });
    }

    // Konversi harga ke USD
    const priceInUSD = gig.price / IDR_TO_USD_CONVERSION_RATE;

    // Buat payment intent baru
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(priceInUSD * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    // Perbarui order jika sudah ada, atau buat baru
    const updatedOrder = await Order.findOneAndUpdate(
      { gigId, buyerId: req.userId },
      {
        gigId,
        title: gig.title,
        img: gig.cover || "https://example.com/default-image.jpg",
        price: gig.price,
        sellerId: gig.userId,
        buyerId: req.userId,
        paymentIntentId: paymentIntent.id, // Simpan ID payment intent
        payment_intent: paymentIntent.client_secret, // Simpan clientSecret untuk checkout
        status: "pending",
      },
      { upsert: true, new: true } // Jika tidak ada, buat baru
    );

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    next(err);
  }
};



/**
 * ✅ Menghapus order berdasarkan ID
 */
export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError(400, "Format Order ID tidak valid"));

    const order = await Order.findByIdAndDelete(id);
    if (!order) return next(createError(404, "Pesanan tidak ditemukan"));

    res.status(200).json({ message: "Pesanan berhasil dihapus" });
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ Mengambil daftar order berdasarkan user (buyer/seller)
 */
export const getOrders = async (req, res, next) => {
  try {
    const filter = req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId };
    const orders = await Order.find(filter)
      .populate("gigId", "title userId")
      .populate("buyerId", "username")
      .populate("sellerId", "username");

    res.status(200).json(orders);
  } catch (err) {
    next(err);
  }
};
export const getOrderReceipt = async (req, res) => {
  try {
      const order = await Order.findById(req.params.id)
          .populate("sellerId", "username")
          .populate("buyerId", "username");

      if (!order) {
          return res.status(404).json({ message: "Order tidak ditemukan" });
      }

      res.status(200).json({
          message: "Struk order berhasil diambil",
          order,
      });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Gagal mengambil data struk order" });
  }
};

/**
 * ✅ Mengambil earnings dari penjual berdasarkan ID
 */
export const getEarnings = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return next(createError(400, "Format User ID tidak valid"));

    const earnings = await Order.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(id), status: "completed" } },
      { $group: { _id: null, totalEarnings: { $sum: "$price" } } }
    ]);

    res.status(200).json({ userId: id, earnings: earnings[0]?.totalEarnings || 0 });
  } catch (err) {
    next(err);
  }
};

/**
 * ✅ Menandai order sebagai "completed"
 */
export const completeOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createError(400, "Format Order ID tidak valid"));
    }

    const order = await Order.findById(id);

    if (!order) {
      return next(createError(404, "Order tidak ditemukan"));
    }

    if (order.sellerId.toString() !== req.userId) {
      return next(createError(403, "Unauthorized to complete this order"));
    }

    order.status = "completed";
    const updatedOrder = await order.save();

    res.status(200).json({ message: "Order berhasil diselesaikan", updatedOrder });
  } catch (err) {
    next(err);
  }
};


