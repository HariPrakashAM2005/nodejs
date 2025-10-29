import { useState } from "react";
import axios from "axios";
import "./QuizCreation.css";
import { useNavigate } from "react-router-dom";

// Utility: Generate random quiz code
function generateQuizCode() {
  return "QZ-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function QuestionForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [quizCode] = useState(generateQuizCode());
  const [time, setTime] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: [""], correctIndex: null },
  ]);

  // Add/Remove question
  const addQuestion = () =>
    setQuestions([...questions, { text: "", options: [""], correctIndex: null }]);
  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // Handle question/option input changes
  const handleQuestionChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].text = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push("");
    setQuestions(updated);
  };

  const handleCorrectAnswerSelect = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = oIndex;
    setQuestions(updated);
  };

  // Form submission
  const handleSubmit = async () => {
    // Validation
    for (let q of questions) {
      if (!q.text || q.options.some((opt) => !opt)) {
        alert("Please fill all questions and options!");
        return;
      }
      if (q.correctIndex === null) {
        alert("Please select a correct answer for each question!");
        return;
      }
    }

    if (!time) {
      alert("Please enter quiz duration!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/quiz",
        {
          title: title || "Untitled Quiz",
          quizCode,
          timeAllowed: time,
          questions: questions.map((q) => ({
            questionText: q.text,
            options: q.options.map((opt, i) => ({
              text: opt,
              isCorrect: i === q.correctIndex,
            })),
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    
      console.log("Quiz created successfully:", response.data);
      alert("✅ Quiz created successfully!");
    } catch (err) {
      console.error("Quiz creation error:", err);
      alert("❌ Failed to create quiz. Check console for details.");
    }
    finally{
      navigate("/QuizPage");
    }
  };

  return (
    <div className="quiz-container">
      <div className="quiz-card">
        <h2>Create Quiz</h2>

        <label>Quiz Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter quiz title"
        />

        <p>
          <strong>Generated Quiz Code:</strong> {quizCode}
        </p>

        {questions.map((q, i) => (
          <div key={i} className="question-block">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label>Question {i + 1}:</label>
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                style={{
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                ❌ Remove
              </button>
            </div>

            <input
              type="text"
              value={q.text}
              onChange={(e) => handleQuestionChange(i, e.target.value)}
              placeholder="Enter your question"
            />

            <div>
              <strong>Options:</strong>
              {q.options.map((opt, j) => (
  <div
    key={j}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "4px",
    }}
  >
    <input
      type="radio"
      name={`correct-${i}`}
      checked={q.correctIndex === j}
      onChange={() => handleCorrectAnswerSelect(i, j)}
    />
    <input
      type="text"
      value={opt}
      placeholder={`Option ${j + 1}`}
      onChange={(e) => handleOptionChange(i, j, e.target.value)}
    />
    <button
      type="button"
      onClick={() => {
        const updated = [...questions];
        updated[i].options.splice(j, 1);
        if (updated[i].correctIndex === j) updated[i].correctIndex = null;
        else if (updated[i].correctIndex > j) updated[i].correctIndex -= 1;
        setQuestions(updated);
      }}
      style={{
        background: "red",
        color: "white",
        border: "none",
        borderRadius: "4px",
        padding: "2px 6px",
        cursor: "pointer",
      }}
    >
      ❌ Remove
    </button>
  </div>
))}

              <button type="button" onClick={() => addOption(i)}>
                ➕ Add Option
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addQuestion}>
          ➕ Add Question
        </button>

        <div style={{ marginTop: "12px" }}>
          <label>Time Allowed (minutes):</label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Enter time allowed"
          />
        </div>

        <button className="submit-btn" onClick={handleSubmit} style={{ marginTop: "12px" }}>
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

export default QuestionForm;
