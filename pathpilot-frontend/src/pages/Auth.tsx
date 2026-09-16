import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, User, AlertCircle, RefreshCw, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

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
        await login(email, password);
        navigate('/dashboard');
      } else {
        const res = await signup(email, password, fullName);
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
      await verifyCode(email, code);
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
      await resendCode(email);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#55D39A]';
    if (score >= 60) return 'text-[#E9B84B]';
    return 'text-[#FF6577]';
  };

  return (
    <div className="relative min-h-screen text-[#F4F4F5] flex items-center justify-center p-6 bg-[#111318]">
      
      <div className="w-full max-w-sm relative z-10 my-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-2">
            <img src={logoImg} alt="VertexPath Logo" className="w-32 h-32 object-contain" />
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4F4F5] font-display m-0">VertexPath</h1>
          </div>
          <p className="text-[#A1A1AA] text-xs text-center font-medium max-w-xs leading-normal">
            The Career Operating System
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Auth Panels */}
        {isVerify ? (
          /* Verification Screen */
          <div className="bg-[#15161C] border border-[#25262D] p-8 rounded-lg space-y-6">
            <div className="flex items-center gap-3 text-[#8B5CF6]">
              <div className="p-1.5 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                <KeyRound className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#F4F4F5]">Verify Your Account</h2>
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

            <p className="text-[#A1A1AA] text-xs leading-relaxed">
              We've sent a 6-digit verification code to <strong className="text-[#F4F4F5]">{email}</strong>. Please enter it below.
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
                  className="w-full text-center tracking-[0.5em] font-extrabold text-lg py-2.5 bg-[#111318] border border-[#25262D] rounded text-[#F4F4F5]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Activate Account</span>
                )}
              </button>

              <div className="flex justify-between items-center text-xs mt-6 pt-3 border-t border-[#25262D]">
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
                  className="text-[#8B5CF6] hover:text-[#C49AFF] font-bold transition-colors cursor-pointer"
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        ) : isForgotPassword ? (
          /* Forgot Password Screen */
          <div className="bg-[#15161C] border border-[#25262D] p-8 rounded-lg space-y-6">
            <div className="flex items-center gap-3 text-[#8B5CF6]">
              <div className="p-1.5 rounded bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
                <Compass className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-[#F4F4F5]">Reset Password</h2>
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

            <p className="text-[#A1A1AA] text-xs leading-relaxed">
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
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </button>

              <div className="flex items-center justify-center text-xs mt-6 pt-3 border-t border-[#25262D]">
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
          <div className="bg-[#15161C] border border-[#25262D] p-8 rounded-lg space-y-6">
            {/* Header Tabs */}
            <div className="flex border-b border-[#25262D] mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(null); setSuccessMsg(null); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                  isLogin ? 'border-[#8B5CF6] text-[#F4F4F5]' : 'border-transparent text-slate-500 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(null); setSuccessMsg(null); }}
                className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                  !isLogin ? 'border-[#8B5CF6] text-[#F4F4F5]' : 'border-transparent text-slate-500 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
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
                      className="text-[11px] text-[#8B5CF6] hover:text-[#C49AFF] font-bold transition-colors cursor-pointer"
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
                    className="w-4 h-4 rounded border-[#25262D] bg-[#111318] text-[#8B5CF6] focus:ring-[#8B5CF6] focus:ring-offset-[#111318] cursor-pointer mt-0.5"
                  />
                  <label htmlFor="agreeTerms" className="text-xs text-[#A1A1AA] leading-normal select-none">
                    I agree to the{' '}
                    <span 
                      onClick={() => openModal('terms')} 
                      className="text-[#8B5CF6] font-bold hover:text-[#C49AFF] transition-colors cursor-pointer"
                    >
                      Terms of Service
                    </span>
                    {' '}and{' '}
                    <span 
                      onClick={() => openModal('privacy')} 
                      className="text-[#8B5CF6] font-bold hover:text-[#C49AFF] transition-colors cursor-pointer"
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
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] rounded text-xs font-bold transition-all cursor-pointer mt-6"
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

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#15161C] border border-[#25262D] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-lg z-50 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#25262D] bg-[#11151D]/30">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveModalTab('terms')}
                  className={`text-xs font-bold pb-1 uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeModalTab === 'terms' ? 'border-[#8B5CF6] text-[#F4F4F5]' : 'border-transparent text-slate-550 hover:text-white'
                  }`}
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => setActiveModalTab('privacy')}
                  className={`text-xs font-bold pb-1 uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    activeModalTab === 'privacy' ? 'border-[#8B5CF6] text-[#F4F4F5]' : 'border-transparent text-slate-550 hover:text-white'
                  }`}
                >
                  Privacy Policy
                </button>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-500 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#A1A1AA] leading-relaxed custom-scrollbar">
              {activeModalTab === 'terms' ? (
                <div className="space-y-4">
                  <h3 className="text-[#F4F4F5] font-bold text-sm">1. Acceptance of Terms</h3>
                  <p>
                    Welcome to VertexPath. By accessing or using our platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
                  </p>
                  <h3 className="text-[#F4F4F5] font-bold text-sm">2. Description of Service</h3>
                  <p>
                    VertexPath is a career development ecosystem designed to assist users with roadmaps, resume score evaluation, mock interviews, and reference context question answering. AI suggestions are generated by LLMs and are intended solely for educational purposes.
                  </p>
                  <h3 className="text-[#F4F4F5] font-bold text-sm">3. User Obligations & Account</h3>
                  <p>
                    You agree to provide true, accurate, and complete information during registration. You are responsible for keeping your account password secure.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-[#F4F4F5] font-bold text-sm">1. Information We Collect</h3>
                  <p>
                    We collect personal information that you provide directly, such as your name, email address, password hash, and files/resumes you upload to the platform.
                  </p>
                  <h3 className="text-[#F4F4F5] font-bold text-sm">2. How We Use Your Information</h3>
                  <p>
                    We use information to maintain your career dashboard, generate roadmaps, and review resumes.
                  </p>
                  <h3 className="text-[#F4F4F5] font-bold text-sm">3. Data Sharing & Third-Party APIs</h3>
                  <p>
                    We use enterprise-grade AI neural models and isolated vector storage to power intelligent career features. Resumes and context files are indexed and processed with end-to-end encryption. We do not sell your personal data.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#25262D] flex justify-end bg-[#11151D]/20">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#C49AFF] text-[#111318] text-xs font-bold rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Auth;
