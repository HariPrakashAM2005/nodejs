// LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import "./button.css";

/* -------------------------
   ADMIN LOGIN POPUP
   (unchanged logic, small UX improvements)
------------------------- */
function LoginPopup({ show, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!show) return null;

  async function handleSubmit() {
    if (!username.trim() || !password) {
      alert("Please enter username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username.trim(), password }),
      });

      // try parse JSON, fallback to text
      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: await res.text() };
      }

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        alert("Admin login successful!");
        navigate("/QuizPage");
      } else {
        alert(data.message || "Invalid username or password!");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Network or server error. Check backend.");
    } finally {
      setLoading(false);
      setUsername("");
      setPassword("");
    }
  }

  return (
    <div className="overlay">
      <div className="popup">
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username (email)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <div className="password-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <label style={{ marginLeft: 8 }}>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              disabled={loading}
            />{" "}
            Show
          </label>
        </div>

        <div className="popup-buttons">
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Logging in..." : "Submit"}
          </button>
          <button onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------
   USER LOGIN + REGISTER POPUP
   (the user login now performs input validation,
    shows errors, handles loading, and reliably reads backend responses)
------------------------- */
function UserLoginPopup({ show, onClose }) {
  const [guestName, setGuestName] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState(null); // "user" | "register" | "guest"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!show) return null;

  // simple email format check
  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  // ----- Handle guest login -----
  function handleGuestSubmit() {
    if (!guestName.trim() || !quizCode.trim()) {
      alert("Please enter both Name and Quiz Code!");
      return;
    }
    localStorage.setItem("guestName", guestName.trim());
    localStorage.setItem("quizCode", quizCode.trim());
    navigate("/UserForm", { state: { guestName: guestName.trim(), quizCode: quizCode.trim() } });
  }

  // ----- Handle user login -----
  async function handleUserSubmit() {
    // validation
    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      // robust parse
      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: await res.text() };
      }

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        // optionally store user email
        localStorage.setItem("userEmail", data.email || email.trim());
        alert("User login successful!");
        navigate("/UserLoginPage");
      } else {
        // show backend message if present
        alert(data.message || "Invalid credentials!");
      }
    } catch (err) {
      console.error("User login error:", err);
      alert("Network or server error. Check backend.");
    } finally {
      setLoading(false);
    }
  }

  // ----- Handle registration -----
  async function handleRegisterSubmit() {
    if (!email.trim() || !password) {
      alert("Please enter email and password.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: await res.text() };
      }

      if (res.ok) {
        alert("Registration successful!");
        navigate("/"); // redirect to home
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Register error:", err);
      alert("Network or server error. Check backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay">
      <div className="popup">
        <h2>User Login</h2>

        {!mode && (
          <div className="popup-buttons">
            <button onClick={() => setMode("user")} disabled={loading}>User Login</button>
            <button onClick={() => setMode("register")} disabled={loading}>Register</button>
            <button onClick={() => setMode("guest")} disabled={loading}>Guest Login</button>
            <button onClick={onClose} disabled={loading}>Close</button>
          </div>
        )}

        {mode === "user" && (
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <label style={{ marginLeft: 8 }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  disabled={loading}
                />{" "}
                Show
              </label>
            </div>
            <div className="popup-buttons">
              <button onClick={handleUserSubmit} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
              <button onClick={() => setMode(null)} disabled={loading}>Back</button>
            </div>
          </div>
        )}

        {mode === "register" && (
          <div>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <label style={{ marginLeft: 8 }}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  disabled={loading}
                />{" "}
                Show
              </label>
            </div>
            <div className="popup-buttons">
              <button onClick={handleRegisterSubmit} disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
              <button onClick={() => setMode(null)} disabled={loading}>Back</button>
            </div>
          </div>
        )}

        {mode === "guest" && (
          <div>
            <input
              type="text"
              placeholder="Enter your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              disabled={loading}
            />
            <input
              type="text"
              placeholder="Enter Quiz Code"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value)}
              disabled={loading}
            />
            <div className="popup-buttons">
              <button onClick={handleGuestSubmit} disabled={loading}>Continue as Guest</button>
              <button onClick={() => setMode(null)} disabled={loading}>Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------
   MAIN LOGIN PAGE
------------------------- */
function LoginPage() {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showUserLogin, setShowUserLogin] = useState(false);

  return (
    <div className="app-container">
      <h1 className="login-head">Login</h1>

      <button className="button-1" onClick={() => setShowAdminLogin(true)}>
        Admin Login
      </button>
      <LoginPopup
        show={showAdminLogin}
        onClose={() => setShowAdminLogin(false)}
      />

      <button className="button-1" onClick={() => setShowUserLogin(true)}>
        User Login / Register
      </button>
      <UserLoginPopup
        show={showUserLogin}
        onClose={() => setShowUserLogin(false)}
      />
    </div>
  );
}

export default LoginPage;
