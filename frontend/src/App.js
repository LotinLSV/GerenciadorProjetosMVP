import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './index.css';
import { Toaster } from './components/ui/sonner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import TasksPage from './pages/TasksPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedDarkMode = localStorage.getItem('darkMode');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/register" element={<RegisterPage setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsPage user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetailPage user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage user={user} logout={logout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;