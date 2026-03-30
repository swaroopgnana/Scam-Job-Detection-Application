import { useState } from "react";
import API from "../services/api";

export default function JobAnalyzer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🎨 Color based on scam score
  const getColor = (score) => {
    if (score > 70) return "text-red-500";
    if (score > 40) return "text-yellow-400";
    return "text-green-400";
  };

  // 🔥 MAIN ANALYZE FUNCTION (Gemini)
  const analyze = async () => {
    setError("");

    if (!text.trim()) {
      setError("Please enter a job description");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/analyze", {
        jobText: text,
      });

      setResult(res.data.analysis);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">

      {/* ❌ ERROR */}
      {error && (
        <div className="bg-red-500 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 📝 TEXT INPUT */}
      <div className="glass p-6 rounded-2xl mb-6">
        <h2 className="text-xl mb-3">Paste Job Description</h2>

        <textarea
          rows="5"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste job description..."
          className="w-full p-4 bg-gray-900 border border-gray-700 rounded-xl"
        />
      </div>

      {/* 🚀 BUTTON */}
      <button
        onClick={analyze}
        className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 rounded-xl"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {/* 📊 RESULT */}
      {result && (
        <div className="glass p-6 rounded-2xl mt-6">

          <h2 className="text-xl mb-3">AI Analysis</h2>

          {/* ✅ Verdict */}
          <p>
            Verdict:{" "}
            <b className={result.verdict === "High Risk" ? "text-red-500" : "text-green-400"}>
              {result.verdict}
            </b>
          </p>

          {/* ✅ Scam Score */}
          <p className={getColor(result.riskScore)}>
            Scam Score: <b>{result.riskScore}%</b>
          </p>

          {/* 🧠 Reasons */}
          {result.reasons?.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2">Why risky:</h3>
              {result.reasons.map((r, i) => (
                <p key={i} className="text-red-300">• {r}</p>
              ))}
            </div>
          )}

          {/* 📄 TEXT PREVIEW */}
          <div className="mt-4">
            <h3 className="mb-2">Analyzed Text</h3>

            <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded">
              {text}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
