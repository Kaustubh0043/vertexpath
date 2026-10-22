import React, { useState } from 'react';
import { LegalModal } from '../components/LegalModal';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { Compass, AlertCircle, RefreshCw, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode') === 'signup' ? false : true;

  const [isLogin, setIsLogin] = useState(initialMode);
  const [isVerify, setIsVerify] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Form fields (Preserving existing logic)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [code, setCode] = useState('');
  
  // Terms & Privacy Modal states (Preserving existing logic)
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'terms' | 'privacy'>('terms');

  const openModal = (tab: 'terms' | 'privacy') => {
    setActiveModalTab(tab);
    setShowTermsModal(true);
  };
  
  // Feedback states (Preserving existing logic)
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, signup, verifyCode, resendCode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your entries.');
        return;
      }
      if (!agreeTerms) {
        setError('You must agree to the Terms & Conditions to create an account.');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email.trim().toLowerCase(), password);
        navigate('/dashboard');
      } else {
        const res = await signup(email.trim().toLowerCase(), password, fullName.trim());
        if (res?.requiresVerification) {
          setIsVerify(true);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message;
      if (errMsg === 'ACCOUNT_NOT_VERIFIED') {
        setError('Your account is not verified yet. Please enter the verification code sent to your email.');
        setIsVerify(true);
      } else {
        setError(
          err.response?.data?.message || 
          (err.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data)[0] : null) ||
          'Authentication failed. Please verify your inputs.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await verifyCode(email.trim().toLowerCase(), code.trim());
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError(null);
    setSuccessMsg(null);
    try {
      await resendCode(email.trim().toLowerCase());
      setSuccessMsg('A new 6-digit verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email) {
      setError('Please enter your email address to reset password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(`A password reset link has been simulated & sent to ${email}`);
    }, 1500);
  };

  return (
    <div className="auth-shell min-h-screen text-[var(--text-primary)] bg-[var(--bg-primary)]">
      <aside className="auth-story" aria-label="About VertexPath">
        <button onClick={() => navigate('/')} className="auth-brand" aria-label="VertexPath home">
          <span className="auth-brand-mark"><img src={logoImg} alt="" /></span>
          <span>VertexPath</span>
        </button>
        <div className="auth-story-copy">
          <span className="auth-eyebrow"><span /> YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Build a career<br />that moves you<br /><em>forward.</em></h1>
          <p>Turn your skills into a clear path forward. Learn, build, and prepare for the work you want to do.</p>
        </div>
        <div className="auth-route" aria-hidden="true">
          <div className="auth-route-line" />
          <span className="auth-route-point point-one"><CheckCircle /></span>
          <span className="auth-route-point point-two"><Compass /></span>
          <span className="auth-route-point point-three"><KeyRound /></span>
          <div className="auth-route-caption"><strong>YOUR CAREER, IN MOTION</strong><span>One focused step at a time</span></div>
        </div>
        <p className="auth-story-foot">A career operating system for developers</p>
      </aside>

      <main className="auth-main">
        <div className="auth-content">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark"><img src={logoImg} alt="" /></span>
            <span>VertexPath</span>
          </div>

        {/* Back to Home Button */}
        <div className="auth-back-row">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Auth Panels */}
        {isVerify ? (
          /* Verification Screen */
          <div className="auth-panel bg-[var(--card)] border border-[var(--border)] p-8 rounded-lg space-y-6">
            <div className="flex items-center gap-3 text-[var(--brand-primary)]">
              <div className="p-1.5 rounded bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
                <KeyRound className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Verify Your Account</h2>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-[#FF6577]/10 border border-[#FF6577]/20 text-[#FF6577] text-xs rounded">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 p-3 bg-[#55D39A]/10 border border-[#55D39A]/20 text-[#55D39A] text-xs rounded">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              We've sent a 6-digit verification code to <strong className="text-[var(--text-primary)]">{email}</strong>. Please enter it below.
            </p>

            <form onSubmit={handleVerify} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Verification Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] font-extrabold text-lg py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Activate Account</span>
                )}
              </button>

              <div className="flex justify-between items-center text-xs mt-6 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => { setIsVerify(false); setError(null); setSuccessMsg(null); }}
                  className="flex items-center gap-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-[var(--brand-primary)] hover:text-[var(--brand-hover)] font-bold transition-colors cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        ) : isForgotPassword ? (
          /* Forgot Password Screen */
          <div className="auth-panel bg-[var(--card)] border border-[var(--border)] p-8 rounded-lg space-y-6">
            <div className="flex items-center gap-3 text-[var(--brand-primary)]">
              <div className="p-1.5 rounded bg-[var(--brand-primary)]/10 border border-[var(--brand-primary)]/20">
                <Compass className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Reset Password</h2>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-[#FF6577]/10 border border-[#FF6577]/20 text-[#FF6577] text-xs rounded">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 p-3 bg-[#55D39A]/10 border border-[#55D39A]/20 text-[#55D39A] text-xs rounded">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <p className="text-[var(--text-secondary)] text-xs leading-relaxed">
              Enter your email address below and we'll send you instructions to reset your password.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </button>

              <div className="flex items-center justify-center text-xs mt-6 pt-3 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setError(null); setSuccessMsg(null); }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Login/Signup Screen */
          <div className="auth-panel bg-[var(--card)] border border-[var(--border)] p-8 rounded-lg space-y-6">
            <div className="auth-form-heading">
              <span>{isLogin ? 'WELCOME BACK' : 'YOUR NEXT STEP'}</span>
              <h2>{isLogin ? 'Sign in to VertexPath' : 'Create your account'}</h2>
              <p>{isLogin ? 'Pick up where your career journey left off.' : 'Create an account and start building your path.'}</p>
            </div>
            {/* Header Tabs */}
            <div className="flex border-b border-[var(--border)] mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                  isLogin ? 'border-[var(--brand-primary)] text-[var(--text-primary)]' : 'border-transparent text-slate-500 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                  !isLogin ? 'border-[var(--brand-primary)] text-[var(--text-primary)]' : 'border-transparent text-slate-500 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="auth-provider-buttons" aria-label="Social sign-in providers">
              <button type="button" disabled aria-label="Google sign-in is being set up">
                <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.4-4.55H24v9.02h12.87a11 11 0 0 1-4.77 7.22l7.73 6C44.34 38.12 47 31.95 47 24.55Z"/><path fill="#FBBC05" d="M10.54 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.98-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.76l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.2C6.51 42.62 14.62 48 24 48Z"/></svg>
                <span>Google</span>
              </button>
              <button type="button" disabled aria-label="GitHub sign-in is being set up">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.28-1.24-1.62-1.24-1.62-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.73 2.2 3.28 1.57.1-.73.39-1.22.7-1.5-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.15a10.63 10.63 0 0 1 5.57 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.71.78 1.14 1.78 1.14 3 0 4.29-2.61 5.23-5.1 5.51.4.35.75 1.03.75 2.08v3.1c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z"/></svg>
                <span>GitHub</span>
              </button>
            </div>
            <div className="auth-email-divider"><span>OR CONTINUE WITH EMAIL</span></div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-[#FF6577]/10 border border-[#FF6577]/20 text-[#FF6577] text-xs rounded">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2 p-3 bg-[#55D39A]/10 border border-[#55D39A]/20 text-[#55D39A] text-xs rounded">
                <CheckCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                /* FULL NAME (Signup only) */
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs"
                  />
                </div>
              )}

              {/* EMAIL */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              {/* PASSWORD */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(null); setSuccessMsg(null); }}
                      className="text-[11px] text-[var(--brand-primary)] hover:text-[var(--brand-hover)] font-bold transition-colors cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs"
                />
              </div>

              {!isLogin && (
                /* CONFIRM PASSWORD (Signup only) */
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confirm Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <div className="flex items-center gap-1.5 text-xs text-[#FF6577] mt-1 font-bold">
                      <AlertCircle className="w-4 h-4" />
                      <span>Passwords do not match</span>
                    </div>
                  )}
                </div>
              )}

              {!isLogin && (
                /* TERMS AND CONDITIONS CHECKBOX (Signup only) */
                <div className="flex items-start gap-3 mt-4 pt-1 text-left">
                  <input
                    id="agreeTerms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--border)] bg-[var(--bg-primary)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)] focus:ring-offset-[#111318] cursor-pointer mt-0.5"
                  />
                  <label htmlFor="agreeTerms" className="text-xs text-[var(--text-secondary)] leading-normal select-none">
                    I agree to the{' '}
                    <span 
                      onClick={() => openModal('terms')} 
                      className="text-[var(--brand-primary)] font-bold hover:text-[var(--brand-hover)] transition-colors cursor-pointer"
                    >
                      Terms of Service
                    </span>
                    {' '}and{' '}
                    <span 
                      onClick={() => openModal('privacy')} 
                      className="text-[var(--brand-primary)] font-bold hover:text-[var(--brand-hover)] transition-colors cursor-pointer"
                    >
                      Privacy Policy
                    </span>.
                  </label>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading || (!isLogin && password !== confirmPassword)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer mt-6"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </button>
            </form>
          </div>
        )}
        </div>
      </main>

      <LegalModal open={showTermsModal} activeTab={activeModalTab} onTabChange={setActiveModalTab} onClose={() => setShowTermsModal(false)} />

    </div>
  );
};
export default Auth;
