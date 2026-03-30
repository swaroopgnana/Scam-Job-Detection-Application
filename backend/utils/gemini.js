const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const stripCodeFence = (text) =>
  text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();

const fallbackAnalysis = (jobText) => {
  const text = jobText.toLowerCase();
  let riskScore = 10;
  const reasons = [];

  const flags = [
    { keyword: "registration fee", score: 20, reason: "Requests a registration fee." },
    { keyword: "pay upfront", score: 20, reason: "Asks for payment before hiring." },
    { keyword: "work from home", score: 10, reason: "Uses vague remote-work language without detail." },
    { keyword: "urgent hiring", score: 10, reason: "Uses pressure-based hiring language." },
    { keyword: "no experience", score: 8, reason: "Promises easy qualification requirements." },
    { keyword: "whatsapp", score: 15, reason: "Moves recruiting communication to WhatsApp." },
    { keyword: "telegram", score: 15, reason: "Moves recruiting communication to Telegram." },
    { keyword: "guaranteed income", score: 18, reason: "Promises unrealistic guaranteed earnings." },
    { keyword: "limited seats", score: 8, reason: "Uses scarcity to rush a decision." },
    { keyword: "investment", score: 15, reason: "Mentions investment or money from the applicant." }
  ];

  for (const item of flags) {
    if (text.includes(item.keyword)) {
      riskScore += item.score;
      reasons.push(item.reason);
    }
  }

  riskScore = Math.min(100, riskScore);

  let verdict = "Low Risk";
  if (riskScore >= 70) verdict = "High Risk";
  else if (riskScore >= 40) verdict = "Medium Risk";

  return {
    riskScore,
    verdict,
    reasons: reasons.length ? reasons : ["No strong scam indicators were found by fallback rules."],
    raw: null,
    source: "fallback"
  };
};

const normalizeAnalysis = (payload) => {
  const riskScore = Number(payload.riskScore);
  const safeScore = Number.isFinite(riskScore)
    ? Math.max(0, Math.min(100, Math.round(riskScore)))
    : null;

  const reasons = Array.isArray(payload.reasons)
    ? payload.reasons.filter((reason) => typeof reason === "string" && reason.trim())
    : [];

  const summary = typeof payload.summary === "string" ? payload.summary.trim() : "";
  if (summary && !reasons.length) {
    reasons.push(summary);
  }

  let verdict = typeof payload.verdict === "string" ? payload.verdict.trim() : "";
  if (!verdict && safeScore !== null) {
    if (safeScore >= 70) verdict = "High Risk";
    else if (safeScore >= 40) verdict = "Medium Risk";
    else verdict = "Low Risk";
  }

  if (safeScore === null || !verdict) {
    throw new Error("Gemini returned an incomplete analysis payload.");
  }

  return {
    riskScore: safeScore,
    verdict,
    reasons: reasons.length ? reasons : ["Gemini did not provide detailed reasons."],
    raw: payload,
    source: "gemini"
  };
};

const analyzeWithGemini = async (jobText) => {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackAnalysis(jobText);
  }

  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const prompt = `
You are analyzing whether a job posting is likely to be a scam.
Return only valid JSON with this exact shape:
{
  "riskScore": number,
  "verdict": "Low Risk" | "Medium Risk" | "High Risk",
  "reasons": ["short bullet reason"],
  "summary": "one short summary sentence"
}

Rules:
- riskScore must be an integer from 0 to 100
- reasons must contain 2 to 5 short strings
- use "High Risk" for likely scam patterns, "Medium Risk" for suspicious uncertainty, "Low Risk" for low concern
- do not include markdown or extra commentary

Job text:
${jobText}
  `.trim();

  const response = await fetch(
    `${GEMINI_API_URL}/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!rawText) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = JSON.parse(stripCodeFence(rawText));
  return normalizeAnalysis(parsed);
};

export default analyzeWithGemini;
