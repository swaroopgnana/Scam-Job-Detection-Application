import dotenv from "dotenv";
dotenv.config();

import History from "../models/History.js";
import OpenAI from "openai";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  console.error("OPENROUTER_API_KEY is missing. Check your backend .env file.");
}

const client = new OpenAI({
  apiKey,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5000",
    "X-Title": "Job Scam Detector"
  }
});

function extractJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

export const analyzeJob = async (req, res) => {
  try {
    const { jobText } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        message: "OPENROUTER_API_KEY is missing in backend .env"
      });
    }

    if (!jobText || !jobText.trim()) {
      return res.status(400).json({
        message: "Job description is required"
      });
    }

    const prompt = `
You are a job scam detection assistant.

Analyze the following job description and return ONLY valid JSON in this exact format:
{
  "riskScore": number,
  "verdict": "Low Risk" | "Medium Risk" | "High Risk",
  "reasons": ["reason1", "reason2"],
  "safePercent": number,
  "riskPercent": number,
  "signals": {
    "suspiciousLanguage": number,
    "paymentRequest": number,
    "contactRisk": number,
    "companyTrust": number
  }
}

Rules:
- riskScore must be between 0 and 100
- safePercent + riskPercent must equal 100
- all signal values must be between 0 and 100
- return raw JSON only
- no markdown
- no explanation

Job Description:
${jobText}
`;

    const completion = await client.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a job scam detection assistant. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2
    });

    const text = completion.choices?.[0]?.message?.content || "";
    const parsed = extractJson(text);

    const history = await History.create({
      user: req.user.id,
      jobText,
      riskScore: parsed.riskScore,
      verdict: parsed.verdict,
      reasons: parsed.reasons || [],
      safePercent: parsed.safePercent || 0,
      riskPercent: parsed.riskPercent || 0,
      signals: {
        suspiciousLanguage: parsed.signals?.suspiciousLanguage || 0,
        paymentRequest: parsed.signals?.paymentRequest || 0,
        contactRisk: parsed.signals?.contactRisk || 0,
        companyTrust: parsed.signals?.companyTrust || 0
      }
    });

    return res.status(200).json({
      message: "Analysis completed",
      analysis: history
    });
  } catch (error) {
    console.error("OpenRouter analysis error:", error);
    return res.status(500).json({
      message: "Failed to analyze with OpenRouter",
      error: error.message
    });
  }
};