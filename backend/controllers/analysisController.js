import History from "../models/History.js";

const detectRisk = (jobText) => {
  const text = jobText.toLowerCase();
  let score = 10;
  const reasons = [];

  const flags = [
    { keyword: "registration fee", score: 20, reason: "Asks for registration fee" },
    { keyword: "pay upfront", score: 20, reason: "Requests upfront payment" },
    { keyword: "work from home", score: 10, reason: "Suspicious generic remote offer" },
    { keyword: "urgent hiring", score: 10, reason: "Pressure-based language used" },
    { keyword: "no experience", score: 8, reason: "Too-good-to-be-true low qualification claim" },
    { keyword: "whatsapp only", score: 15, reason: "Unprofessional recruiter communication" },
    { keyword: "telegram", score: 15, reason: "Recruitment shifted to messaging apps" },
    { keyword: "guaranteed income", score: 18, reason: "Unrealistic earnings claim" },
    { keyword: "limited seats", score: 8, reason: "Scarcity pressure tactic" },
    { keyword: "investment", score: 15, reason: "Mentions money investment for job" }
  ];

  flags.forEach((item) => {
    if (text.includes(item.keyword)) {
      score += item.score;
      reasons.push(item.reason);
    }
  });

  if (score > 100) score = 100;

  let verdict = "Low Risk";
  if (score >= 70) verdict = "High Risk";
  else if (score >= 40) verdict = "Medium Risk";

  return { score, verdict, reasons };
};

export const analyzeJob = async (req, res) => {
  try {
    const { jobText } = req.body;

    if (!jobText) {
      return res.status(400).json({ message: "Job description is required" });
    }

    const result = detectRisk(jobText);

    const history = await History.create({
      user: req.user.id,
      jobText,
      riskScore: result.score,
      verdict: result.verdict,
      reasons: result.reasons
    });

    res.status(200).json({
      message: "Analysis completed",
      analysis: history
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};