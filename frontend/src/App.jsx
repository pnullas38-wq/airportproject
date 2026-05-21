import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';

// Components & Pages imports
import FlightSplash from './components/FlightSplash';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ModuleManager from './pages/ModuleManager';

// Route Guard for Protected Routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-semibold select-none">Synchronizing Aerosphere accounts...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <FlightSplash onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              {/* Public access routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Secure Dashboard & CRUD route managers */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/:moduleKey"
                element={
                  <ProtectedRoute>
                    <ModuleManager />
                  </ProtectedRoute>
                }
              />

              {/* Wildcard Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
