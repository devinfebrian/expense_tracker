import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth.js';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: 48, textAlign: 'center' }}>
      <h1>Welcome, {user?.name ?? 'user'}</h1>
      <button onClick={handleLogout} style={{ marginTop: 24, padding: '8px 16px', borderRadius: 8, border: '1px solid #c6c6cd', background: '#fff', cursor: 'pointer' }}>Sign out</button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
