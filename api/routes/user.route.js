import express from "express";
import { deleteUser, getSellerScores, getUser, saveUserImages, getUserImages, getUserProfile, getUserRank } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/:id", getUser);
router.delete("/:id", verifyToken, deleteUser);
router.get("/:id/rank", getUserRank);
router.get("/:id/score", getSellerScores);
router.put("/:id/images", saveUserImages);
router.get("/:id/images", getUserImages);
router.get("/userProfile/:id", getUserProfile); 
router.get("/:id", getUser);



export default router;
