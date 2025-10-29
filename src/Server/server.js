// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection (fixed)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

/* ==============================
   USER AUTHENTICATION
================================*/
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Missing Authorization header" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
}

// ✅ Register route
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// ✅ Login route
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      return res.status(401).json({ message: "Invalid email or password" });

    // 🔑 JWT generation
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login error" });
  }
});

/* ==============================
   QUIZ + HISTORY SCHEMAS
================================*/
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [optionSchema],
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  quizCode: { type: String, required: true, unique: true },
  timeAllowed: { type: Number, required: true },
  questions: [questionSchema],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const historySchema = new mongoose.Schema({
  quizCode: { type: String, required: true },
  guestName: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  resultDetails: { type: Array, required: true },
  takenAt: { type: Date, default: Date.now },
});

const Quiz = mongoose.model("Quiz", quizSchema);
const History = mongoose.model("History", historySchema);

/* ==============================
   ROUTES
================================*/

// ✅ Create new quiz (Protected)
app.post("/api/quiz", verifyToken, async (req, res) => {
  try {
    const { title, quizCode, timeAllowed, questions } = req.body;

    const existing = await Quiz.findOne({ quizCode });
    if (existing)
      return res.status(400).json({ message: "Quiz code already exists" });

    const quiz = new Quiz({
      title,
      quizCode,
      timeAllowed,
      questions,
      createdBy: req.user.userId,
    });

    const savedQuiz = await quiz.save();
    res.status(201).json(savedQuiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving quiz" });
  }
});

// ✅ Get quiz by code
app.get("/api/quiz/code/:quizCode", async (req, res) => {
  try {
    const { quizCode } = req.params;
    const quiz = await Quiz.findOne({ quizCode });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Save quiz result to history
app.post("/api/history", async (req, res) => {
  try {
    const { quizCode, guestName, score, totalQuestions, resultDetails } =
      req.body;

    const historyEntry = new History({
      quizCode,
      guestName,
      score,
      totalQuestions,
      resultDetails,
    });

    const savedHistory = await historyEntry.save();
    res.status(201).json(savedHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error saving history" });
  }
});

// ✅ Get history for a quiz
app.get("/api/history/:quizCode", async (req, res) => {
  try {
    const { quizCode } = req.params;
    const history = await History.find({ quizCode }).sort({ takenAt: -1 });
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching history" });
  }
});

// ✅ Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
