import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./QuizDisplay.css";

function QuizDisplay() {
  const location = useLocation();
  const { quizCode } = location.state || {};

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [resultDetails, setResultDetails] = useState([]);

  useEffect(() => {
    if (!quizCode) {
      setLoading(false);
      setError("No quiz code provided.");
      return;
    }

    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/quiz/code/${encodeURIComponent(quizCode)}`
        );
        // assume response.data is the quiz object
        setQuiz(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch quiz");
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizCode]);

  // Update selected answer for a question (works for radio & click)
  const handleSelect = (qIndex, optionText) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionText,
    }));
  };

  // Submit quiz, compute score, save history
  const handleSubmit = async () => {
    if (!quiz?.questions) return;

    let calculatedScore = 0;
    let results = [];

    quiz.questions.forEach((q, idx) => {
      const userAnswer = selectedAnswers[idx];
      const correctOption = q.options.find((opt) => opt.isCorrect);

      const isCorrect = correctOption && userAnswer === correctOption.text;
      if (isCorrect) calculatedScore++;

      results.push({
        question: q.questionText,
        userAnswer: userAnswer || "Not answered",
        correctAnswer: correctOption ? correctOption.text : "N/A",
        isCorrect,
      });
    });

    setScore(calculatedScore);
    setResultDetails(results);
    setSubmitted(true);

    // POST to history collection (best-effort)
  // ✅ Save quiz attempt to history
try {
  const userName = localStorage.getItem("guestName") || "Guest";
  const userEmail = localStorage.getItem("email") || "guest@example.com"; // optional if you store it

  const historyData = {
    quizCode: quiz.quizCode || quizCode,
    quizTitle: quiz.title || quiz.quizTitle || "Untitled Quiz",
    userName,
    userEmail,
    score: calculatedScore,
    totalQuestions: quiz.questions.length,
    answers: results,
    date: new Date().toISOString(),
  };

  const res = await axios.post("http://localhost:5000/api/history/add", historyData);

  if (res.status === 201 || res.status === 200) {
    console.log("✅ History saved successfully:", res.data);
  } else {
    console.warn("⚠️ Unexpected response saving history:", res);
  }
} catch (err) {
  console.error("❌ Failed to save history:", err);
}

  };

  if (loading) return <p className="center-text">Loading...</p>;
  if (error) return <p className="center-text error-text">{error}</p>;
  if (!quiz) return <p className="center-text">No quiz found.</p>;

  return (
    <div className="quiz-display-container">
      <header className="quiz-header">
        <h2 className="quiz-title">{quiz.quizTitle || quiz.title || "Quiz"}</h2>
        <div className="meta-row">
          <span className="meta-pill">Questions: {quiz.questions.length}</span>
        </div>
      </header>

      {!submitted ? (
        <>
          <form
            className="questions-wrap"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {quiz.questions.map((q, idx) => {
              const userAnswer = selectedAnswers[idx] || "";
              return (
                <fieldset key={idx} className="question-block" aria-labelledby={`q${idx}-label`}>
                  <legend id={`q${idx}-label`} className="question-text">
                    {idx + 1}. {q.questionText}
                  </legend>

                  <ul className="options-list">
                    {q.options.map((opt, i) => {
                      const isSelected = userAnswer === opt.text;
                      return (
                        <li
                          key={i}
                          className={`option-item ${isSelected ? "selected" : ""}`}
                          onClick={() => handleSelect(idx, opt.text)}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelect(idx, opt.text);
                            }
                          }}
                        >
                          <label className="option-label">
                            <input
                              type="radio"
                              name={`question-${idx}`}
                              checked={isSelected}
                              onChange={() => handleSelect(idx, opt.text)}
                            />
                            <span className="option-text">{opt.text}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </fieldset>
              );
            })}

            <div className="actions-row">
              <button type="submit" className="submit-btn">
                Submit Quiz
              </button>
              <button
                type="button"
                className="reset-btn"
                onClick={() => {
                  setSelectedAnswers({});
                  setSubmitted(false);
                  setResultDetails([]);
                  setScore(0);
                }}
              >
                Reset Answers
              </button>
            </div>
          </form>
        </>
      ) : (
        <>
          <div className="score-block">
            <h3 className="score-text">
              ✅ Your Score: {score} / {quiz.questions.length}
            </h3>
          </div>

          <div className="results-summary">
            <h4>📋 Result Summary</h4>
            <ul className="results-list">
              {resultDetails.map((r, idx) => (
                <li
                  key={idx}
                  className={`result-item ${r.isCorrect ? "correct" : "wrong"}`}
                >
                  <p>
                    <strong>Q{idx + 1}:</strong> {r.question}
                  </p>
                  <p>
                    <span className="label">Your Answer:</span> {r.userAnswer}
                  </p>
                  <p>
                    <span className="label">Correct Answer:</span> {r.correctAnswer}
                  </p>
                  <p className="result-flag">{r.isCorrect ? "✅ Correct" : "❌ Wrong"}</p>
                </li>
              ))}
            </ul>

            <div className="actions-row">
              <button
                className="submit-btn"
                onClick={() => {
                  // allow retake by clearing selections
                  setSelectedAnswers({});
                  setSubmitted(false);
                  setResultDetails([]);
                  setScore(0);
                }}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default QuizDisplay;
