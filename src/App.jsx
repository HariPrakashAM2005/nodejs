// App.jsx
import { Routes, Route } from "react-router-dom";
import './App.css';
import './button.css';
import LoginPage from './LoginPage';
import QuizPage from './AdminHomePage';
import QuizCreation from './QuizCreation';
import UserLogin from "./UserLogin";
import QuizDisplay from "./UserForm";
import UserLoginPage from "./UserLoginPage";
import HistoryDisplay from "./HistoryDisplay";
function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/QuizPage" element={<QuizPage />} />
      <Route path="/QuizCreation" element={<QuizCreation />} />
      <Route path="/UserLogin" element={<UserLogin/>}/>
      <Route path="/UserForm" element={<QuizDisplay/>}/>
      <Route path="/QuizDisplay" element={<QuizDisplay />} />
      <Route path="/UserLoginPage" element={<UserLoginPage/>}></Route>
      <Route path="/HistoryDisplay" element={<HistoryDisplay/>}></Route>
    </Routes>
  );
}

export default App;
