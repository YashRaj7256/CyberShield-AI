'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, isLoading, error, clearError, isAuthenticated, loadFromStorage } = useAuthStore();
  
  // Panel mode (false = Sign In, true = Sign Up)
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  
  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLocalError, setSignInLocalError] = useState('');

  // Sign Up Form State
  const [signUpFirstName, setSignUpFirstName] = useState('');
  const [signUpLastName, setSignUpLastName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [signUpLocalError, setSignUpLocalError] = useState('');

  const [mounted, setMounted] = useState(false);

  /* ── Original auth logic — UNTOUCHED ──────────────────────── */
  useEffect(() => {
    setMounted(true);
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/overview');
    }
  }, [isAuthenticated, router]);

  // Handle Sign In Submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInLocalError('');
    clearError();

    if (!signInEmail.trim() || !signInPassword) {
      setSignInLocalError('Please enter both email and password');
      return;
    }

    try {
      await login(signInEmail.trim(), signInPassword);
      router.push('/overview');
    } catch {
      // Error handled by store
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpLocalError('');
    clearError();

    if (!signUpFirstName.trim() || !signUpLastName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setSignUpLocalError('All fields are required');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpLocalError('Passwords do not match');
      return;
    }

    if (signUpPassword.length < 8) {
      setSignUpLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        firstName: signUpFirstName.trim(),
        lastName: signUpLastName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword,
      });
      router.push('/overview');
    } catch {
      // Error handled by store
    }
  };

  const currentSignInError = signInLocalError || (!isRightPanelActive ? error : '');
  const currentSignUpError = signUpLocalError || (isRightPanelActive ? error : '');

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-cyan-500/30 font-sans"
      style={{ background: '#05070f' }}
    >
      {/* Background Grid Pattern */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.02) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient Radial Glows */}
      {mounted && (
        <>
          <div
            aria-hidden
            className="fixed pointer-events-none rounded-full"
            style={{
              top: '-15%',
              left: '15%',
              width: 550,
              height: 550,
              background: 'radial-gradient(circle, rgba(6,182,212,0.05), transparent 70%)',
              animation: 'wander 24s ease-in-out infinite',
            }}
          />
          <div
            aria-hidden
            className="fixed pointer-events-none rounded-full"
            style={{
              bottom: '-15%',
              right: '15%',
              width: 500,
              height: 500,
              background: 'radial-gradient(circle, rgba(59,130,246,0.04), transparent 70%)',
              animation: 'wander 28s ease-in-out infinite reverse',
            }}
          />
        </>
      )}

      {/* Top Branding */}
      <div className="relative z-10 mb-6 flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_15px_rgba(6,182,212,0.18)]"
          >
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            CyberShield <span className="text-cyan-400">AI</span>
          </span>
        </Link>
        <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mt-1">
          Threat Intelligence & Security Operations
        </p>
      </div>

      {/* Mobile Tab Switcher (< md screens) */}
      <div className="md:hidden relative z-10 w-full max-w-[340px] mb-5 flex rounded-xl p-1 bg-slate-900/90 border border-white/10">
        <button
          type="button"
          onClick={() => {
            setIsRightPanelActive(false);
            clearError();
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            !isRightPanelActive
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRightPanelActive(true);
            clearError();
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
            isRightPanelActive
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SLIDING DUAL-PANEL AUTH CONTAINER
      ═══════════════════════════════════════════════════════ */}
      <div
        id="container"
        className={`auth-slider-container relative z-10 ${
          isRightPanelActive ? 'right-panel-active' : ''
        }`}
      >
        {/* ── Sign Up Form Container ────────────────────────── */}
        <div
          className={`auth-form-container auth-sign-up-container ${
            isRightPanelActive ? 'max-md:relative max-md:w-full max-md:opacity-100 max-md:pointer-events-auto' : 'max-md:hidden'
          }`}
        >
          <div className="flex flex-col justify-center items-center h-full px-8 sm:px-12 py-8 bg-[#0b0f19]">
            <div className="w-full max-w-[330px]">
              
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Create Account
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set up your security analyst profile
                </p>
              </div>

              {/* Social Login Provider Bar */}
              <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                <button
                  type="button"
                  className="auth-sso-btn"
                  title="Sign up with Google"
                  aria-label="Sign up with Google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.3 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.1.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z" />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-300">Google</span>
                </button>

                <button
                  type="button"
                  className="auth-sso-btn"
                  title="Sign up with GitHub"
                  aria-label="Sign up with GitHub"
                >
                  <svg className="w-4 h-4 fill-current shrink-0 text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-300">GitHub</span>
                </button>

                <button
                  type="button"
                  className="auth-sso-btn"
                  title="Sign up with SSO / Microsoft"
                  aria-label="Sign up with SSO"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M1 13h10v10H1z" />
                    <path fill="#7fba00" d="M13 1h10v10H13z" />
                    <path fill="#ffb900" d="M13 13h10v10H13z" />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-300">SSO</span>
                </button>
              </div>

              {/* Clean Non-overlapping Divider */}
              <div className="flex items-center gap-3 w-full my-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 shrink-0">
                  or register with email
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Error banner */}
              {currentSignUpError && (
                <div className="flex items-center gap-2 p-2 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs text-left animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{currentSignUpError}</span>
                </div>
              )}

              {/* Registration Form */}
              <form onSubmit={handleSignUpSubmit} className="space-y-2.5" noValidate>
                {/* Names */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="First Name"
                      value={signUpFirstName}
                      onChange={(e) => setSignUpFirstName(e.target.value)}
                      className="w-full h-[40px] rounded-xl text-xs border border-white/10 bg-[#131927] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                      style={{ paddingLeft: '36px', paddingRight: '12px' }}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={signUpLastName}
                      onChange={(e) => setSignUpLastName(e.target.value)}
                      className="w-full h-[40px] px-3 rounded-xl text-xs border border-white/10 bg-[#131927] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full h-[40px] rounded-xl text-xs border border-white/10 bg-[#131927] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                    style={{ paddingLeft: '36px', paddingRight: '12px' }}
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Password (8+ chars)"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full h-[40px] rounded-xl text-xs border border-white/10 bg-[#131927] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                    style={{ paddingLeft: '36px', paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSignUpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    className="w-full h-[40px] rounded-xl text-xs border border-white/10 bg-[#131927] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                    style={{ paddingLeft: '36px', paddingRight: '12px' }}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[44px] mt-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_18px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_22px_rgba(6,182,212,0.45)] cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Mobile Switch Link */}
              <p className="md:hidden text-center text-xs text-slate-500 mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRightPanelActive(false)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline ml-1"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* ── Sign In Form Container ────────────────────────── */}
        <div
          className={`auth-form-container auth-sign-in-container ${
            !isRightPanelActive ? 'max-md:relative max-md:w-full max-md:opacity-100 max-md:pointer-events-auto' : 'max-md:hidden'
          }`}
        >
          <div className="flex flex-col justify-center items-center h-full px-8 sm:px-12 py-8 bg-[#0b0f19]">
            <div className="w-full max-w-[330px]">
              
              {/* Header */}
              <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Welcome back
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Sign in to access your security intelligence console
                </p>
              </div>

              {/* Social Login Provider Bar */}
              <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                <button
                  type="button"
                  className="auth-sso-btn"
                  title="Sign in with Google"
                  aria-label="Sign in with Google"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.3 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7 0-1.1.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z" />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-300">Google</span>
                </button>

                <button
                  type="button"
                  className="auth-sso-btn"
                  title="Sign in with GitHub"
                  aria-label="Sign in with GitHub"
                >
                  <svg className="w-4 h-4 fill-current shrink-0 text-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-300">GitHub</span>
                </button>

                <button
                  type="button"
                  className="auth-sso-btn"
                  title="Sign in with Enterprise SSO"
                  aria-label="Sign in with Enterprise SSO"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z" />
                    <path fill="#00a4ef" d="M1 13h10v10H1z" />
                    <path fill="#7fba00" d="M13 1h10v10H13z" />
                    <path fill="#ffb900" d="M13 13h10v10H13z" />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-300">SSO</span>
                </button>
              </div>

              {/* Clean Non-overlapping Divider */}
              <div className="flex items-center gap-3 w-full my-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 shrink-0">
                  or continue with email
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Error banner */}
              {currentSignInError && (
                <div className="flex items-center gap-2 p-2.5 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs text-left animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="truncate">{currentSignInError}</span>
                </div>
              )}

              {/* Sign In Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-3" noValidate>
                {/* Email Field */}
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="admin@cti.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full h-[46px] rounded-xl text-sm border border-white/10 bg-[#131927] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                      style={{ paddingLeft: '44px', paddingRight: '16px' }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full h-[46px] rounded-xl text-sm border border-white/10 bg-[#131927] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15 transition-all"
                      style={{ paddingLeft: '44px', paddingRight: '44px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Row */}
                <div className="flex justify-end pt-0.5 pb-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password reset link will be sent to your email.');
                    }}
                    className="text-xs text-slate-400 hover:text-cyan-400 transition-colors font-medium"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-[46px] rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_18px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_24px_rgba(6,182,212,0.45)] cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #2563eb)' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Mobile Switch Link */}
              <p className="md:hidden text-center text-xs text-slate-500 mt-4">
                Don&apos;t have an analyst account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRightPanelActive(true)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold underline ml-1"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* ── Sliding Overlay Container (Desktop) ───────────── */}
        <div className="auth-overlay-container hidden md:block">
          <div className="auth-overlay">
            {/* Left Panel (visible when sign-up is active) */}
            <div className="auth-overlay-panel auth-overlay-left">
              <div className="w-13 h-13 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 mb-4 shadow-lg backdrop-blur-md shrink-0">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2 shrink-0">
                Welcome Back!
              </h2>
              <p className="text-[13px] font-light leading-relaxed text-white/90 max-w-[260px] mb-6 shrink-0">
                To keep connected with your SOC operations please login with your personal info
              </p>
              <button
                type="button"
                id="signIn"
                onClick={() => {
                  setIsRightPanelActive(false);
                  clearError();
                }}
                className="auth-ghost-btn shrink-0"
              >
                Sign In
              </button>
            </div>

            {/* Right Panel (visible by default when sign-in is active) */}
            <div className="auth-overlay-panel auth-overlay-right">
              <div className="w-13 h-13 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 mb-4 shadow-lg backdrop-blur-md shrink-0">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-tight mb-2 shrink-0">
                Hello, Friend!
              </h2>
              <p className="text-[13px] font-light leading-relaxed text-white/90 max-w-[260px] mb-6 shrink-0">
                Enter your personal details and start your threat intelligence journey with us
              </p>
              <button
                type="button"
                id="signUp"
                onClick={() => {
                  setIsRightPanelActive(true);
                  clearError();
                }}
                className="auth-ghost-btn shrink-0"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-6 flex items-center gap-2 text-[11px] font-mono text-slate-600">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Protected by CyberShield AI Zero-Trust Security Gateway
      </div>
    </div>
  );
}
