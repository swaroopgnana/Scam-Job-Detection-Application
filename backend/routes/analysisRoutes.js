import express from "express";
import { analyzeJob } from "../controllers/analysisController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, analyzeJob);

export default router;