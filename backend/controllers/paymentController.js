import crypto from "crypto";
import { createRequire } from "module";
import User from "../models/User.js";

const require = createRequire(import.meta.url);

const planCatalog = {
  Pro: {
    amount: 1200,
    currency: "INR",
    description: "Unlimited personal usage with a faster review flow."
  },
  Enterprise: {
    amount: 3900,
    currency: "INR",
    description: "Shared workflows for teams supporting many applicants."
  }
};

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  let Razorpay;

  try {
    Razorpay = require("razorpay");
  } catch (error) {
    console.error("Razorpay SDK is not available:", error.message);
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = planCatalog[planId];

    if (!plan) {
      return res.status(400).json({ message: "Invalid subscription plan selected." });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({ message: "Payments are not configured on the backend yet." });
    }

    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: plan.currency,
      receipt: `receipt_${req.user.id}_${Date.now()}`
    });

    return res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      order,
      plan: {
        id: planId,
        description: plan.description
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create payment order.",
      error: error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const plan = planCatalog[planId];

    if (!plan) {
      return res.status(400).json({ message: "Invalid subscription plan selected." });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification details." });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: "Payments are not configured on the backend yet." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature." });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { plan: planId },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      message: `${planId === "Enterprise" ? "Team" : planId} plan activated successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan
      },
      token: req.headers.authorization?.split(" ")[1] || ""
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify payment.",
      error: error.message
    });
  }
};
