import { useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Analyze = () => {
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    riskScore: 0,
    verdict: "Not analyzed",
    reasons: [],
    safePercent: 100,
    riskPercent: 0,
    signals: {
      suspiciousLanguage: 0,
      paymentRequest: 0,
      contactRisk: 0,
      companyTrust: 0
    }
  });

  const handleAnalyze = async () => {
    if (!jobText.trim()) {
      alert("Please paste a job description first.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/analyze", { jobText });
      setResult(data.analysis);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const doughnutData = {
    labels: ["Safe", "Risk"],
    datasets: [
      {
        data: [result.safePercent || 0, result.riskPercent || 0],
        backgroundColor: ["#52d017", "#ff4d4d"],
        borderWidth: 1
      }
    ]
  };

  const barData = {
    labels: ["Suspicious Language", "Payment Request", "Contact Risk", "Company Trust"],
    datasets: [
      {
        label: "Signal Score",
        data: [
          result.signals?.suspiciousLanguage || 0,
          result.signals?.paymentRequest || 0,
          result.signals?.contactRisk || 0,
          result.signals?.companyTrust || 0
        ],
        backgroundColor: ["#8b5cf6", "#ef4444", "#f59e0b", "#22c55e"]
      }
    ]
  };

  return (
    <Layout>
      <h1 className="main-title">AI Scam Job Detector</h1>

      <div className="analyze-box">
        <textarea
          placeholder="Paste job description..."
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
        />
        <button className="gradient-btn small-btn" onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze with AI"}
        </button>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h2>Risk Analysis</h2>
          <div className="chart-wrap">
            <Doughnut data={doughnutData} />
          </div>
          <h3>{result.riskScore}% Risk</h3>
          <p>{result.verdict}</p>

          {result.reasons?.length > 0 && (
            <ul className="reason-list">
              {result.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="chart-card">
          <h2>AI Signal Breakdown</h2>
          <div className="chart-wrap">
            <Bar data={barData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analyze;