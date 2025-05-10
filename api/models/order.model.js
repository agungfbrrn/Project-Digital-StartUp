import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    gigId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
      index: true, // Menambah index untuk mempercepat pencarian order berdasarkan gigId
    },
    img: {
      type: String,
      default: "https://example.com/default-image.jpg", // Menambahkan default image
    },
    title: {
      type: String,
      required: true,
      trim: true, // Menghapus spasi berlebih
    },
    price: {
      type: Number,
      required: true,
      min: 0, // Validasi harga tidak boleh negatif
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index untuk mempercepat pencarian order berdasarkan seller
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index untuk mempercepat pencarian order berdasarkan buyer
    },
    status: {
      type: String,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },
    payment_intent: {
      type: String,
      required: true,
      unique: true, // Pastikan payment_intent tidak duplikat
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

OrderSchema.index({ gigId: 1, buyerId: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

export default mongoose.model("Order", OrderSchema);
