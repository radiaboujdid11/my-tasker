import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { CornerProvider } from './context/CornerContext';
import Notification from './components/Notification';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import BoardView from './pages/BoardView';
import CalendarPage from './pages/CalendarPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ece5d8' }}>
        <div className="w-8 h-8 rounded-full border-2 border-beige-300 border-t-brown-500 animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

function AppLayout({ darkMode, onToggleDark }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState('board');

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Navbar
        darkMode={darkMode}
        onToggleDark={onToggleDark}
        onMenuToggle={() => setSidebarOpen((o) => !o)}
        showLogo={false}
      />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        view={view}
        onViewChange={setView}
      />
      <div className="lg:pl-60 min-h-screen pt-14" style={{ background: '#ece5d8' }}>
        {view === 'board'    && <BoardView />}
        {view === 'calendar' && <CalendarPage />}
        {view === 'corner'   && <Dashboard />}
      </div>
    </div>
  );
}

function AppRoutes() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />
        </ProtectedRoute>
      } />
      <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <CornerProvider>
            <AppRoutes />
            <Notification />
          </CornerProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
