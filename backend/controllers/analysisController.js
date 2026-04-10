import History from "../models/History.js";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import analyzeWithGemini from "../utils/gemini.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

const normalizeEnvValue = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/^['"]|['"]$/g, "");
};

const getOpenRouterApiKey = () => {
  let apiKey = normalizeEnvValue(process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY);

  if (!apiKey) {
    dotenv.config({ path: envPath });
    apiKey = normalizeEnvValue(process.env.OPENROUTER_API_KEY || process.env.OPEN_ROUTER_API_KEY);
  }

  return apiKey;
};

const createOpenRouterClient = (apiKey) =>
  new OpenAI({
    apiKey,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": process.env.PUBLIC_APP_URL || "https://scam-job-detection-application-by8rvuhba.vercel.app",
      "X-Title": "Job Scam Detector"
    }
  });

function extractJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const objectLikeMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!objectLikeMatch) {
      throw new Error("Model response did not contain valid JSON.");
    }

    return JSON.parse(objectLikeMatch[0]);
  }
}

function clampScore(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeReasons(reasons, summary, signals) {
  const cleaned = Array.isArray(reasons)
    ? reasons.filter((reason) => typeof reason === "string" && reason.trim()).map((reason) => reason.trim())
    : [];

  if (cleaned.length) {
    return cleaned.slice(0, 5);
  }

  const derived = [];

  if (signals.suspiciousLanguage >= 40) {
    derived.push("The wording relies on broad promises or urgency instead of clear job specifics.");
  }

  if (signals.paymentRequest >= 20) {
    derived.push("The posting hints at money, fees, or purchases that applicants may be asked to make.");
  }

  if (signals.contactRisk >= 20) {
    derived.push("The contact details or application flow look less verifiable than a standard hiring process.");
  }

  if (signals.companyTrust <= 40) {
    derived.push("The employer information is too thin to strongly confirm a legitimate company behind the role.");
  }

  if (!derived.length && summary) {
    derived.push(summary);
  }

  return derived.length
    ? derived
    : ["This score reflects mild caution signals, but not enough evidence for a high-risk verdict."];
}

function normalizeEvidence(evidence) {
  if (!Array.isArray(evidence)) {
    return [];
  }

  return evidence
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      title: typeof item.title === "string" ? item.title.trim() : "",
      detail: typeof item.detail === "string" ? item.detail.trim() : "",
      excerpt: typeof item.excerpt === "string" ? item.excerpt.trim() : "",
      impact: typeof item.impact === "string" ? item.impact.trim() : ""
    }))
    .filter((item) => item.title || item.detail || item.excerpt || item.impact)
    .slice(0, 4);
}

function normalizeAnalysisPayload(parsed) {
  const signals = {
    suspiciousLanguage: clampScore(parsed?.signals?.suspiciousLanguage),
    paymentRequest: clampScore(parsed?.signals?.paymentRequest),
    contactRisk: clampScore(parsed?.signals?.contactRisk),
    companyTrust: clampScore(parsed?.signals?.companyTrust)
  };

  const riskScore = clampScore(parsed?.riskScore);
  const safePercent = clampScore(parsed?.safePercent, 100 - riskScore);
  const riskPercent = clampScore(parsed?.riskPercent, 100 - safePercent);
  const summary = typeof parsed?.summary === "string" ? parsed.summary.trim() : "";
  const reasons = normalizeReasons(parsed?.reasons, summary, signals);
  const evidence = normalizeEvidence(parsed?.evidence);

  let verdict = typeof parsed?.verdict === "string" ? parsed.verdict.trim() : "";
  if (!verdict) {
    if (riskScore >= 70) verdict = "High Risk";
    else if (riskScore >= 40) verdict = "Medium Risk";
    else verdict = "Low Risk";
  }

  return {
    riskScore,
    verdict,
    summary,
    reasons,
    safePercent,
    riskPercent,
    signals,
    evidence
  };
}

export const analyzeJob = async (req, res) => {
  try {
    const { jobText } = req.body;
    const apiKey = getOpenRouterApiKey();

    if (!apiKey) {
      return res.status(500).json({
        message: "OPENROUTER_API_KEY is missing in backend/.env"
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
  "summary": "one short user-facing explanation of why this score was assigned",
  "reasons": ["reason1", "reason2"],
  "safePercent": number,
  "riskPercent": number,
  "signals": {
    "suspiciousLanguage": number,
    "paymentRequest": number,
    "contactRisk": number,
    "companyTrust": number
  },
  "evidence": [
    {
      "title": "short label",
      "detail": "plain-language explanation tied to the job text",
      "excerpt": "very short quote or paraphrase from the posting",
      "impact": "why this affected the score"
    }
  ]
}

Rules:
- riskScore must be between 0 and 100
- safePercent + riskPercent must equal 100
- all signal values must be between 0 and 100
- summary must be plain-language and user-facing
- reasons must explain the score in plain language
- evidence must contain 2 to 4 objects whenever possible
- never mention model names, providers, APIs, Hugging Face, prompts, or internal tooling
- base the reasons on concrete clues in the text, and if evidence is weak, say that clearly
- return raw JSON only
- no markdown
- no explanation

Job Description:
${jobText}
`;

    const client = createOpenRouterClient(apiKey);

    let normalized;

    try {
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
      normalized = normalizeAnalysisPayload(parsed);
    } catch (providerError) {
      console.error("OpenRouter response handling failed, using fallback analysis:", providerError.message);
      const fallback = await analyzeWithGemini(jobText);
      normalized = normalizeAnalysisPayload({
        riskScore: fallback.riskScore,
        verdict: fallback.verdict,
        summary: fallback.reasons?.[0] || "",
        reasons: fallback.reasons,
        safePercent: 100 - clampScore(fallback.riskScore),
        riskPercent: clampScore(fallback.riskScore),
        signals: {
          suspiciousLanguage: clampScore(fallback.riskScore),
          paymentRequest: clampScore(Math.round(fallback.riskScore * 0.7)),
          contactRisk: clampScore(Math.round(fallback.riskScore * 0.6)),
          companyTrust: clampScore(100 - fallback.riskScore)
        },
        evidence: []
      });
    }

    let history;
    try {
      history = await History.create({
      user: req.user.id,
      jobText,
      ...normalized
    });
    } catch (historyError) {
      console.error("History save failed:", historyError.message);
      history = {
        ...normalized,
        _id: null,
        user: req.user.id,
        jobText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

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
