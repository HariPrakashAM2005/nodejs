import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HistoryDisplay.css";

export default function HistoryDisplay() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view your history.");
          setLoading(false);
          return;
        }

        // ✅ Fetch all user history (not by quiz code)
        const res = await axios.get("http://localhost:5000/api/history/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setHistory(res.data);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err.response?.data?.message || "Failed to fetch history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p className="loading">Loading your quiz history...</p>;
  if (error) return <p className="error">{error}</p>;

  if (history.length === 0)
    return <p className="empty">No quiz history found yet.</p>;

  return (
    <div className="history-container">
      <h2>📜 Your Quiz History</h2>

      <div className="history-list">
        {history.map((item, index) => {
          const scorePercent =
            item.totalQuestions > 0
              ? ((item.score / item.totalQuestions) * 100).toFixed(1)
              : 0;

          return (
            <div key={index} className="history-card">
              <h3>{item.quizTitle || "Untitled Quiz"}</h3>
              <p><strong>Quiz Code:</strong> {item.quizCode}</p>
              <p><strong>Questions:</strong> {item.totalQuestions}</p>
              <p>
                <strong>Score:</strong> {item.score} / {item.totalQuestions}{" "}
                ({scorePercent}%)
              </p>
              <p className="date">
                🕒 Taken on: {new Date(item.takenAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
