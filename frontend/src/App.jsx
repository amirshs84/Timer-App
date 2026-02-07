import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudyTimer from './pages/StudyTimer';
import Courses from './pages/Courses';

function App() {
  return (
    <div className="dark">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/timer" element={<StudyTimer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          {/* Redirect old routes */}
          <Route path="/home" element={<Navigate to="/timer" replace />} />
          <Route path="/study-timer" element={<Navigate to="/timer" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
