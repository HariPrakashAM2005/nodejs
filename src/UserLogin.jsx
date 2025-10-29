// UserLogin.jsx
import React, { useState } from "react";
import "./UserLogin.css";

function UserLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup) {
      alert(`Signing up with Username: ${username}`);
      // call signup API here
    } else {
      alert(`Logging in with Username: ${username}`);
      // call login API here
    }
  };

  const handleForgotPassword = () => {
    alert("Redirecting to forgot password flow...");
    // you can redirect to /forgot-password route
  };

  return (
    <div className="userlogin-container">
      <div className="userlogin-card">
        <h2>{isSignup ? "Sign Up" : "User Login"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="btn-primary">
            {isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {!isSignup && (
          <p className="forgot" onClick={handleForgotPassword}>
            Forgot Password?
          </p>
        )}

        <p className="toggle">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Login" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default UserLogin;
