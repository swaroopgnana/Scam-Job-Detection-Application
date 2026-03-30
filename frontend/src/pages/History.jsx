import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await API.get("/history");
        setHistory(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <Layout>
      <div className="page-heading">
        <h1>Analysis History</h1>
      </div>

      <div className="history-list">
        {history.length > 0 ? (
          history.map((item) => (
            <div className="history-card" key={item._id}>
              <h3>{item.verdict}</h3>
              <p><strong>Risk Score:</strong> {item.riskScore}%</p>
              <p><strong>Job Description:</strong> {item.jobText}</p>
              <p><strong>Reasons:</strong> {item.reasons.join(", ") || "No strong scam indicators found"}</p>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
          ))
        ) : (
          <div className="empty-card">No history found yet.</div>
        )}
      </div>
    </Layout>
  );
};

export default History;