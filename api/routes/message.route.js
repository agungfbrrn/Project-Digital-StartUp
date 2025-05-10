import express from "express";
import upload from "../middleware/upload.js";
import {
  createMessage,
  getMessages,
  updateReadStatus,
} from "../controllers/message.controller.js";
import { verifyToken } from "../middleware/jwt.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Route untuk membuat pesan baru
router.post("/", upload.single("file"), verifyToken, createMessage);

// Route untuk mengambil pesan berdasarkan conversationId
router.get("/:id", verifyToken, getMessages);

// Route untuk memperbarui status pesan menjadi dibaca

router.put("/read", verifyToken, updateReadStatus);
router.put("/:id/read", verifyToken, updateReadStatus);


// Route untuk download file secara aman
router.get("/files/:fileName", verifyToken, async (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.resolve("uploads", fileName); // Sesuaikan path folder uploads

  try {
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ message: "File tidak ditemukan" });
    }
  } catch (err) {
    res.status(500).json({ message: "Terjadi kesalahan", error: err });
  }
});

export default router;
