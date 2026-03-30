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
    }
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);
export default History;