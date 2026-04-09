import crypto from "crypto";
import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getSubscriptionPlan } from "../config/subscriptionPlans.js";

const buildReceipt = (userId, planId) => `sub_${planId.toLowerCase()}_${String(userId).slice(-8)}_${Date.now()}`;

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = getSubscriptionPlan(planId);

    if (!plan) {
      return res.status(400).json({ message: "Invalid subscription plan selected." });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay is not configured on the server." });
    }

    const response = await axios.post(
      "https://api.razorpay.com/v1/orders",
      {
        amount: plan.amount,
        currency: plan.currency,
        receipt: buildReceipt(req.user.id, plan.id),
        notes: {
          userId: req.user.id,
          planId: plan.id,
          planName: plan.name
        }
      },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET
        }
      }
    );

    res.status(201).json({
      key: process.env.RAZORPAY_KEY_ID,
      order: response.data,
      plan
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to create Razorpay order.",
      error: error.response?.data?.error?.description || error.message
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { planId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const plan = getSubscriptionPlan(planId);

    if (!plan) {
      return res.status(400).json({ message: "Invalid subscription plan selected." });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing Razorpay payment details." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature verification failed." });
    }

    const user = await User.findByIdAndUpdate(req.user.id, { plan: plan.id }, { new: true }).select("-password");

    res.status(200).json({
      message: `${plan.name} subscription activated successfully.`,
      token: jwt.sign({ id: user._id, name: user.name, email: user.email, plan: user.plan }, process.env.JWT_SECRET, {
        expiresIn: "7d"
      }),
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed.", error: error.message });
  }
};
