import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './components/DashboardLayout';
import { Auth } from './pages/Auth';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Resume } from './pages/Resume';
import { JdMatch } from './pages/JdMatch';
import { Roadmaps } from './pages/Roadmaps';
import { Projects } from './pages/Projects';
import { Interviews } from './pages/Interviews';
import { Onboarding } from './pages/Onboarding';
import { Profile } from './pages/Profile';
import { Outreach } from './pages/Outreach';
import { CodingChallenge } from './pages/CodingChallenge';
import { Compensation } from './pages/Compensation';
import { PublicPortfolio } from './pages/PublicPortfolio';

// Global Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App uncaught render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0C0D10] text-[#F5F5F2] flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-primary)] text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-sm text-slate-400 max-w-md">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.href = '/dashboard';
            }}
            className="px-4 py-2 bg-[var(--brand-primary)] text-black text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
          >
            Reload Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Private Route Guard Component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Onboarding Route Guard Component
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (user.onboardingCompleted === true) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Routes>
              {/* Public Home Landing Page */}
              <Route path="/" element={<Landing />} />

              {/* Public Auth Routes */}
              <Route path="/auth" element={<Auth />} />

              {/* Public Developer Profile Portfolio */}
              <Route path="/p/:username" element={<PublicPortfolio />} />
              <Route path="/portfolio/:username" element={<PublicPortfolio />} />

              {/* Onboarding Flow Page */}
              <Route 
                path="/onboarding" 
                element={
                  <OnboardingRoute>
                    <Onboarding />
                  </OnboardingRoute>
                } 
              />

              {/* Secure Dashboard Shell */}
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                } 
              >
                <Route index element={<Dashboard />} />
                <Route path="chat" element={<Chat />} />
                <Route path="resume" element={<Resume />} />
                <Route path="jd-match" element={<JdMatch />} />
                <Route path="roadmaps" element={<Roadmaps />} />
                <Route path="learning" element={<Roadmaps />} />
                <Route path="projects" element={<Projects />} />
                <Route path="interviews" element={<Interviews />} />
                <Route path="coding" element={<CodingChallenge />} />
                <Route path="outreach" element={<Outreach />} />
                <Route path="compensation" element={<Compensation />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Fallback Catch-all Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
