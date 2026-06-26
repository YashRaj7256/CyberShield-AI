'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      router.push('/overview');
    } catch {
      // Error is handled by the store
    }
  };

  const displayError = localError || error;

  return (
    <div className="animate-fade-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 glow-cyan"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
        >
          <Shield className="w-8 h-8 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">CyberShield AI</h1>
        <p className="text-sm mt-1" style={{ color: '#71717a' }}>
          Threat Intelligence Platform
        </p>
      </div>

      {/* Login Card */}
      <div className="glass-card p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold" style={{ color: '#e4e4e7' }}>
            Welcome back
          </h2>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>
            Sign in to access the SOC dashboard
          </p>
        </div>

        {/* Error Alert */}
        {displayError && (
          <div
            className="flex items-center gap-3 p-3 rounded-lg mb-4"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a1a1aa' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cti.com"
              className="w-full px-4 py-3 rounded-lg text-sm transition-all duration-200"
              style={{
                background: '#1a1a24',
                border: '1px solid #2a2a3a',
                color: '#e4e4e7',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
              onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#a1a1aa' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: '#1a1a24',
                  border: '1px solid #2a2a3a',
                  color: '#e4e4e7',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
                style={{ color: '#71717a' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 gradient-cyan-blue hover:opacity-90 disabled:opacity-50"
            style={{
              boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div
          className="mt-5 p-3 rounded-lg"
          style={{
            background: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
          }}
        >
          <p className="text-xs font-medium text-cyan-400 mb-1">Demo Credentials</p>
          <p className="text-xs" style={{ color: '#71717a' }}>
            Email: <span style={{ color: '#a1a1aa' }}>admin@cti.com</span>
          </p>
          <p className="text-xs" style={{ color: '#71717a' }}>
            Password: <span style={{ color: '#a1a1aa' }}>Admin@123</span>
          </p>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm mt-6" style={{ color: '#71717a' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Create account
          </Link>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs mt-6" style={{ color: '#3a3a4a' }}>
        © 2026 CyberShield AI. Enterprise Security Platform.
      </p>
    </div>
  );
}
