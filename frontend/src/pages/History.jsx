import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import API from "../services/api";

const History = () => {
  const [history, setHistory] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await API.get("/history");
        setHistory(data);
      } catch (error) {
        console.error("Fetch history error:", error.response?.data || error.message);
      }
    };

    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this item?");
    if (!ok) return;

    try {
      setDeletingId(id);
      const res = await API.delete(`/history/${id}`);
      console.log("Delete success:", res.data);

      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Delete failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Layout>
      <div className="page-heading">
        <h1>Analysis History</h1>
      </div>

      <div className="history-list">
        {history.length > 0 ? (
          history.map((item) => (
            <div className="history-card" key={item._id}>
              <div className="history-card-top">
                <h3>{item.verdict}</h3>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item._id)}
                  disabled={deletingId === item._id}
                >
                  {deletingId === item._id ? "Deleting..." : "Delete"}
                </button>
              </div>

              <p><strong>Risk Score:</strong> {item.riskScore}%</p>
              {item.summary && <p><strong>Summary:</strong> {item.summary}</p>}
              <p><strong>Job Description:</strong> {item.jobText}</p>
              <p><strong>Reasons:</strong> {item.reasons.join(", ") || "No strong scam indicators found"}</p>
              {item.evidence?.length > 0 && (
                <div className="history-evidence">
                  {item.evidence.map((evidenceItem, index) => (
                    <div className="history-evidence-item" key={`${evidenceItem.title}-${index}`}>
                      <strong>{evidenceItem.title || `Signal ${index + 1}`}</strong>
                      <span>{evidenceItem.detail}</span>
                    </div>
                  ))}
                </div>
              )}
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
