import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    jobText: {
      type: String,
      required: true
    },
    riskScore: {
      type: Number,
      required: true
    },
    verdict: {
      type: String,
      required: true
    },
    reasons: {
      type: [String],
      default: []
    },
    safePercent: {
      type: Number,
      default: 0
    },
    riskPercent: {
      type: Number,
      default: 0
    },
    signals: {
      suspiciousLanguage: { type: Number, default: 0 },
      paymentRequest: { type: Number, default: 0 },
      contactRisk: { type: Number, default: 0 },
      companyTrust: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);
export default History;