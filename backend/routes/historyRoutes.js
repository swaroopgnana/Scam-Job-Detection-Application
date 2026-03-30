import express from "express";
import { getUserHistory } from "../controllers/historyController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserHistory);

export default router;