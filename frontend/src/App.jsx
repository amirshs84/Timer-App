import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudyTimer from './pages/StudyTimer';
import Courses from './pages/Courses';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import StudentProfile from './pages/manager/StudentProfile';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import WhatsNewModal from './components/WhatsNewModal';

function App() {
  return (
    <div className="dark">
      <Router>
        <WhatsNewModal />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/timer" element={<StudyTimer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          
          {/* Manager Routes */}
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/manager/student/:userId" element={<StudentProfile />} />
          
          {/* SuperAdmin Routes */}
          <Route path="/superadmin" element={<SuperAdminDashboard />} />
          
          {/* Redirect old routes */}
          <Route path="/home" element={<Navigate to="/timer" replace />} />
          <Route path="/study-timer" element={<Navigate to="/timer" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
