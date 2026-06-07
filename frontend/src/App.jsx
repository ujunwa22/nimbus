import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDash from './pages/StudentDash';
import TeacherDash from './pages/TeacherDash';
import CreateQuiz from './pages/CreateQuiz';
import TakeQuiz from './pages/TakeQuiz';
import Result from './pages/Result';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={
    user.role === 'TEACHER' ? '/teacher' : '/student'
  } replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route path="/student" element={
            <ProtectedRoute role="STUDENT">
              <StudentDash />
            </ProtectedRoute>
          } />

          <Route path="/teacher" element={
            <ProtectedRoute role="TEACHER">
              <TeacherDash />
            </ProtectedRoute>
          } />

          <Route path="/quiz/create" element={
            <ProtectedRoute role="TEACHER">
              <CreateQuiz />
            </ProtectedRoute>
          } />

          <Route path="/quiz/:id/take" element={
            <ProtectedRoute role="STUDENT">
              <TakeQuiz />
            </ProtectedRoute>
          } />

          <Route path="/result/:id" element={
            <ProtectedRoute>
              <Result />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}