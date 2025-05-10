import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import mongoose from "mongoose";
import { 
  getOrders, 
  intent, 
  getEarnings, 
  deleteOrder, 
  completeOrder,
  getOrderReceipt,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/payment-intent/:id", verifyToken, intent);
router.get("/earnings/:userId", verifyToken, getEarnings); 

// ✅ Route khusus untuk mendapatkan struk order
router.get("/:id/receipt", verifyToken, getOrderReceipt);

router.put("/:id/complete", verifyToken, completeOrder); 
router.get("/", verifyToken, getOrders);
router.delete("/:id", verifyToken, deleteOrder);

// ❗️ Pindahkan ini ke bawah supaya tidak mengganggu "/:id/receipt"
router.get("/:id", verifyToken, getOrders);

export default router;
