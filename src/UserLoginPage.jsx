import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UserLoginPage.css";

export default function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [error, setError] = useState("");
  const [showQuizInput, setShowQuizInput] = useState(false);
  const [quizCode, setQuizCode] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials");
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Try again later.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const handleJoinQuiz = () => {
    setShowQuizInput(true);
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizCode.trim()) return alert("Please enter a quiz code!");
    navigate("/QuizDisplay", { state: { quizCode } }); // ✅ Pass quizCode
  };
  

  if (token) {
    return (
      <div className="dashboard">
        <div className="card">
          <h2>Welcome!</h2>

         

          {!showQuizInput ? (
            <button className="btn success" onClick={handleJoinQuiz}>
              🎯 Join Quiz
            </button>
          ) : (
            <form onSubmit={handleQuizSubmit}>
              <input
                type="text"
                placeholder="Enter Quiz Code"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value)}
                className="quiz-input"
              />
              <button type="submit" className="btn success">
                Start Quiz 🚀
              </button>
            </form>
          )}

          <button className="btn logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn primary">
          Login
        </button>
      </form>
    </div>
  );
}
