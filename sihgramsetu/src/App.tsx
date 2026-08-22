import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { useStore } from './store/useStore';
import Home from './pages/Home';
import Search from './pages/Search';
import Bazaar from './pages/Bazaar';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LanguageSelect from './pages/LanguageSelect';

/**
 * LanguageGate — renders children only if a language has been chosen.
 * If not, redirects to /language regardless of auth state.
 * This runs inside the Router so it can use useNavigate.
 */
const LanguageGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const language = useStore((state) => state.language);
  const navigate = useNavigate();

  useEffect(() => {
    if (!language) {
      navigate('/language', { replace: true });
    }
  }, [language, navigate]);

  if (!language) return null;
  return <>{children}</>;
};

const App: React.FC = () => {
  const fetchProfile = useStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Language Selection — always public, shown first if no language is set */}
          <Route path="/language" element={<LanguageSelect />} />

          {/* All other routes are gated: language must be chosen first */}
          <Route
            path="/*"
            element={
              <LanguageGate>
                <Routes>
                  {/* Public Auth Routes */}
                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <PublicRoute>
                        <Signup />
                      </PublicRoute>
                    }
                  />

                  {/* Protected Main Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/search"
                    element={
                      <ProtectedRoute>
                        <Search />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/bazaar"
                    element={
                      <ProtectedRoute>
                        <Bazaar />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </LanguageGate>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
