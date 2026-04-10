import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const openRouterKey = (process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY || "").trim();
console.log(`OpenRouter key loaded: ${openRouterKey ? "yes" : "no"}`);

const app = express();
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://scam-job-detection-application-5lc2.vercel.app",
  "https://scam-job-detection-application-by8rvuhba.vercel.app"
];
const envAllowedOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];
const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];
const localNetworkOriginPatterns = [
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
  /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/
];
const allowedOriginPatterns = [
  /^https:\/\/scam-job-detection-application(?:-[a-z0-9]+)?\.vercel\.app$/
];

app.use(
  cors({
    origin: (origin, callback) => {
      const isAllowedLocalNetworkOrigin = localNetworkOriginPatterns.some((pattern) => pattern.test(origin || ""));
      const matchesAllowedOriginPattern = allowedOriginPatterns.some((pattern) => pattern.test(origin || ""));

      if (!origin || allowedOrigins.includes(origin) || isAllowedLocalNetworkOrigin || matchesAllowedOriginPattern) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed for this origin"));
    },
    credentials: true
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/analyze", analysisRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use. Update PORT in backend/.env or stop the other process.`);
        process.exit(1);
      }

      console.error("Server startup failed:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
