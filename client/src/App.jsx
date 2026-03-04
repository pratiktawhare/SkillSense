import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { SettingsProvider } from './context/SettingsContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './layouts/AppLayout';
import PublicLayout from './layouts/PublicLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardOverview from './pages/DashboardOverview';
import ResumesPage from './pages/ResumesPage';
import JobsPage from './pages/JobsPage';
import MatchingPage from './pages/MatchingPage';
import CompareView from './pages/CompareView';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import CandidateDashboard from './pages/CandidateDashboard';
import JobBoard from './pages/JobBoard';
import ApplicationTracker from './pages/ApplicationTracker';
import ApplicationPipeline from './pages/ApplicationPipeline';
import './index.css';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard based on actual role
    return <Navigate to={user.role === 'candidate' ? '/candidate' : '/dashboard'} />;
  }

  return children;
};

// Public route wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'candidate' ? '/candidate' : '/dashboard'} />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SettingsProvider>
              <NotificationProvider>
                <ErrorBoundary>
                  <Routes>
                    {/* Public routes */}
                    <Route element={<PublicLayout />}>
                      <Route path="/" element={<Landing />} />
                      <Route
                        path="/login"
                        element={
                          <PublicRoute>
                            <Login />
                          </PublicRoute>
                        }
                      />
                      <Route
                        path="/register"
                        element={
                          <PublicRoute>
                            <Register />
                          </PublicRoute>
                        }
                      />
                    </Route>

                    {/* Recruiter Routes */}
                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['recruiter']}>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/dashboard" element={<DashboardOverview />} />
                      <Route path="/dashboard/resumes" element={<ResumesPage />} />
                      <Route path="/dashboard/jobs" element={<JobsPage />} />
                      <Route path="/dashboard/matching" element={<MatchingPage />} />
                      <Route path="/dashboard/compare" element={<CompareView />} />
                      <Route path="/dashboard/analytics" element={<Analytics />} />
                      <Route path="/dashboard/applications" element={<ApplicationPipeline />} />
                      <Route path="/dashboard/settings" element={<Settings />} />
                    </Route>

                    {/* Candidate Routes */}
                    <Route
                      element={
                        <ProtectedRoute allowedRoles={['candidate']}>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/candidate" element={<CandidateDashboard />} />
                      <Route path="/candidate/jobs" element={<JobBoard />} />
                      <Route path="/candidate/applications" element={<ApplicationTracker />} />
                      <Route path="/candidate/resumes" element={<ResumesPage />} /> {/* Reusing ResumesPage for now, might need adaptation */}
                    </Route>

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </ErrorBoundary>
              </NotificationProvider>
            </SettingsProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
