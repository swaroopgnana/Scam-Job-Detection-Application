import { useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";
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
  const { isDark } = useTheme();
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState({
    riskScore: 0,
    verdict: "Not analyzed",
    summary: "",
    reasons: [],
    evidence: [],
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

  const axisColor = isDark ? "rgba(199, 210, 254, 0.72)" : "rgba(49, 71, 101, 0.88)";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(25, 45, 80, 0.08)";
  const chartBorder = isDark ? "#20293a" : "#ffffff";

  const doughnutData = {
    labels: ["Safe", "Risk"],
    datasets: [
      {
        data: [result.safePercent || 0, result.riskPercent || 0],
        backgroundColor: ["#52d017", "#ff4d4d"],
        borderColor: chartBorder,
        borderWidth: 2
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: axisColor
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: axisColor
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: axisColor
        },
        grid: {
          color: gridColor
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: axisColor
        },
        grid: {
          color: gridColor
        }
      }
    }
  };

  return (
    <Layout>
      <div className="analyze-page">
      <section className="page-hero">
        <p className="eyebrow">Analyze Listings</p>
        <h1 className="main-title">Review a job post before you trust it.</h1>
        <p className="page-lead">
          Paste the full role description and JobLens will score the risk level, show the main warning signals,
          and explain what in the text affected the final percentage.
        </p>
      </section>

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
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="score-row">
            <div>
              <h3>{result.riskScore}% Risk</h3>
              <p className="score-verdict">{result.verdict}</p>
            </div>
            <div className="score-pill">{result.safePercent}% Safe Signals</div>
          </div>

          {result.summary && <p className="analysis-summary">{result.summary}</p>}

          {result.reasons?.length > 0 && (
            <ul className="reason-list">
              {result.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="chart-card">
          <h2>Signal Breakdown</h2>
          <div className="chart-wrap">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      <section className="evidence-section">
        <div className="section-heading">
          <h2>Why this score was assigned</h2>
          <p>The cards below explain which parts of the posting affected the final risk percentage.</p>
        </div>

        <div className="evidence-grid">
          {result.evidence?.length > 0 ? (
            result.evidence.map((item, index) => (
              <article className="content-card evidence-card" key={`${item.title}-${index}`}>
                <div className="evidence-top">
                  <h3>{item.title || `Signal ${index + 1}`}</h3>
                  {item.impact && <span className="impact-badge">{item.impact}</span>}
                </div>
                {item.detail && <p>{item.detail}</p>}
                {item.excerpt && <div className="excerpt-box">"{item.excerpt}"</div>}
              </article>
            ))
          ) : (
            <div className="empty-card">
              Run an analysis to see the evidence behind the score and the strongest warning signals in the job text.
            </div>
          )}
        </div>
      </section>
      </div>
    </Layout>
  );
};

export default Analyze;
