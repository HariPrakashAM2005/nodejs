// UserLogin.jsx
import React from "react";
import QuizDisplay from "./UserForm";
import { useLocation } from "react-router-dom";

function GuestLogin() {
  const location = useLocation();
  const { guestName, quizCode } = location.state || {};

  if (!quizCode) return <p>No quiz code provided.</p>;

  return (
    <div>
      <h1>Welcome {guestName}</h1>
      {/* Pass the quizCode prop properly */}
      <QuizDisplay quizCode={quizCode} />
    </div>
  );
}

export default GuestLogin;
