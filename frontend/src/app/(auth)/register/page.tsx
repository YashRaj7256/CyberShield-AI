'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated, loadFromStorage } = useAuthStore();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/overview');
    }
  }, [isAuthenticated, router]);


  const passwordStrength = useMemo(() => {
    const p = form.password;
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
    if (score <= 3) return { score, label: 'Fair', color: '#eab308' };
    if (score <= 4) return { score, label: 'Good', color: '#f97316' };
    return { score, label: 'Strong', color: '#22c55e' };
  }, [form.password]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearError();
    setLocalError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setLocalError('All fields are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      router.push('/overview');
    } catch {
      // handled by store
    }
  };

  const displayError = localError || error;

  const inputStyle = {
    background: '#1a1a24',
    border: '1px solid #2a2a3a',
    color: '#e4e4e7',
  };

  return (
    <div className="animate-fade-in w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="text-center mb-6">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 glow-cyan"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
        >
          <Shield className="w-7 h-7 text-cyan-400" />
        </div>
        <h1 className="text-2xl font-bold gradient-text">CyberShield AI</h1>
        <p className="text-sm mt-1" style={{ color: '#71717a' }}>
          Create your analyst account
        </p>
      </div>

      {/* Register Card */}
      <div className="glass-card p-8">
        <div className="mb-5">
          <h2 className="text-xl font-semibold" style={{ color: '#e4e4e7' }}>
            Get Started
          </h2>
          <p className="text-sm mt-1" style={{ color: '#71717a' }}>
            Set up your security analyst profile
          </p>
        </div>

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
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#a1a1aa' }}>
                First Name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                placeholder="John"
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#a1a1aa' }}>
                Last Name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                placeholder="Doe"
                className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#a1a1aa' }}>
              Email Address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="analyst@company.com"
              className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
              onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#a1a1aa' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-4 py-2.5 pr-12 rounded-lg text-sm transition-all duration-200"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
                onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                style={{ color: '#71717a' }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength */}
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : '#2a2a3a',
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                  <div className="flex gap-2">
                    {[
                      { test: form.password.length >= 8, label: '8+' },
                      { test: /[A-Z]/.test(form.password), label: 'A-Z' },
                      { test: /[0-9]/.test(form.password), label: '0-9' },
                      { test: /[^A-Za-z0-9]/.test(form.password), label: '@#$' },
                    ].map((req) => (
                      <span
                        key={req.label}
                        className="flex items-center gap-0.5 text-[10px]"
                        style={{ color: req.test ? '#22c55e' : '#71717a' }}
                      >
                        {req.test && <Check className="w-2.5 h-2.5" />}
                        {req.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#a1a1aa' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-2.5 rounded-lg text-sm transition-all duration-200"
              style={{
                ...inputStyle,
                borderColor:
                  form.confirmPassword && form.confirmPassword !== form.password
                    ? '#ef4444'
                    : form.confirmPassword && form.confirmPassword === form.password
                    ? '#22c55e'
                    : '#2a2a3a',
              }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 gradient-cyan-blue hover:opacity-90 disabled:opacity-50"
            style={{ boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#71717a' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
