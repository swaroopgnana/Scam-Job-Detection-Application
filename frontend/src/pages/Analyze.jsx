import { useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import { victimGrowthData } from "../data";

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const Analyze = () => {
  const [jobText, setJobText] = useState("");
  const [riskScore, setRiskScore] = useState(39);
  const [verdict, setVerdict] = useState("Low Risk");
  const [reasons, setReasons] = useState([]);

  const handleAnalyze = async () => {
    try {
      const { data } = await API.post("/analyze", { jobText });
      setRiskScore(data.analysis.riskScore);
      setVerdict(data.analysis.verdict);
      setReasons(data.analysis.reasons);
    } catch (error) {
      console.error(error);
    }
  };

  const doughnutData = {
    labels: ["Safe", "Risk"],
    datasets: [
      {
        data: [100 - riskScore, riskScore],
        backgroundColor: ["#52d017", "#ff4d4d"],
        borderColor: ["#52d017", "#ff4d4d"]
      }
    ]
  };

  const lineData = {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Victim Growth",
        data: victimGrowthData,
        borderColor: "#8a5cff",
        backgroundColor: "#8a5cff",
        tension: 0.4
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
        <button className="gradient-btn small-btn" onClick={handleAnalyze}>
          Analyze with AI
        </button>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h2>Risk Analysis</h2>
          <div className="chart-wrap">
            <Doughnut data={doughnutData} />
          </div>
          <h3>{riskScore}% Risk</h3>
          <p>{verdict}</p>
          {reasons.length > 0 && (
            <ul className="reason-list">
              {reasons.map((reason, index) => <li key={index}>{reason}</li>)}
            </ul>
          )}
        </div>

        <div className="chart-card">
          <h2>Victim Growth</h2>
          <div className="chart-wrap">
            <Line data={lineData} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analyze;