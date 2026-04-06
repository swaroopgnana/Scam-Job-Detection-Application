import express from "express";
import { getUserHistory, deleteHistoryItem } from "../controllers/historyController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserHistory);
router.delete("/:id", protect, deleteHistoryItem);

export default router;