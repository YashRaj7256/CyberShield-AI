'use client';

import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, CheckCircle2, Circle, AlertTriangle, Shield } from 'lucide-react';
import api from '@/lib/api';
import {
  SectionCard,
  SectionCardHeader,
  SectionCardBody,
  FormField,
  StickyActionBar,
  settingsInputClasses,
} from '@/components/settings/settings-ui';
import { cn } from '@/lib/utils';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check password strength requirements
  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  const strengthScore = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (newPassword.length === 0) return 'Not Entered';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthBadgeClass = () => {
    if (newPassword.length === 0) return 'text-slate-500 bg-white/[0.04] border-white/[0.08]';
    if (strengthScore <= 1) return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    if (strengthScore === 2) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    if (strengthScore === 3) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const isDirty = Boolean(currentPassword || newPassword || confirmPassword);

  const handleDiscard = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match. Please verify and re-enter.' });
      return;
    }

    if (strengthScore < 3) {
      setMessage({ type: 'error', text: 'Password must meet at least 3 security complexity requirements.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await api.post('/settings/change-password', {
        currentPassword,
        newPassword,
      });

      setMessage({ type: 'success', text: 'Password credential updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred while changing password.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      <SectionCard>
        <SectionCardHeader
          title="Security & Credentials"
          subtitle="Change your password and maintain SOC compliance security standards."
          tag="Authentication Policy"
          icon={
            <div className="w-12 h-12 rounded-[10px] flex items-center justify-center text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
          }
        />

        <SectionCardBody>
          {/* Feedback Alert */}
          {message && (
            <div
              className={cn(
                'flex items-center gap-2.5 px-4 py-3 rounded-[10px] border text-xs font-medium backdrop-blur-md mb-6',
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              )}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form
            id="security-form"
            onSubmit={handleSave}
            className="flex flex-col gap-5 max-w-[720px] w-full min-w-0 overflow-visible"
          >
            {/* Current Password */}
            <FormField id="currentPassword" label="Current Password" required>
              <div className="relative w-full min-w-0 overflow-visible">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className={cn(settingsInputClasses, 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {/* New Password */}
            <FormField id="newPassword" label="New Password" required>
              <div className="relative w-full min-w-0 overflow-visible">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  required
                  className={cn(settingsInputClasses, 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              <div className="p-3.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] space-y-2.5 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">Complexity Score:</span>
                  <span className={cn('text-[11px] font-mono px-2 py-0.5 rounded border', getStrengthBadgeClass())}>
                    {getStrengthLabel()}
                  </span>
                </div>

                {/* 4-segment meter */}
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4].map((step) => {
                    const active = strengthScore >= step;
                    return (
                      <div
                        key={step}
                        className={cn(
                          'h-full rounded-full transition-all duration-200',
                          active
                            ? strengthScore === 1
                              ? 'bg-rose-500'
                              : strengthScore === 2
                              ? 'bg-amber-500'
                              : strengthScore === 3
                              ? 'bg-yellow-400'
                              : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                            : 'bg-white/[0.06]'
                        )}
                      />
                    );
                  })}
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                  <div className={cn('flex items-center gap-1.5', hasLength ? 'text-emerald-400' : 'text-slate-500')}>
                    {hasLength ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Min 8 characters</span>
                  </div>
                  <div className={cn('flex items-center gap-1.5', hasUpper ? 'text-emerald-400' : 'text-slate-500')}>
                    {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Uppercase letter (A-Z)</span>
                  </div>
                  <div className={cn('flex items-center gap-1.5', hasNumber ? 'text-emerald-400' : 'text-slate-500')}>
                    {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className={cn('flex items-center gap-1.5', hasSpecial ? 'text-emerald-400' : 'text-slate-500')}>
                    {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0" />}
                    <span>Special symbol (!@#$)</span>
                  </div>
                </div>
              </div>
            </FormField>

            {/* Confirm Password */}
            <FormField id="confirmPassword" label="Confirm New Password" required>
              <div className="relative w-full min-w-0 overflow-visible">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className={cn(settingsInputClasses, 'pr-10')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>
          </form>

          {/* Security Policy Reminder */}
          <div className="mt-6 pt-5 border-t border-[var(--border)] max-w-[720px]">
            <div className="p-4 rounded-[10px] border border-[var(--accent)]/20 bg-[var(--accent)]/5 flex items-start gap-3">
              <Shield className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-white">SOC Best Practice:</span> Changing passwords terminates all
                secondary active session tokens on peripheral devices to enforce credential containment.
              </div>
            </div>
          </div>
        </SectionCardBody>
      </SectionCard>

      {/* Sticky Action Bar */}
      <StickyActionBar
        isDirty={isDirty}
        isLoading={isLoading}
        loadingText="Updating Password..."
        submitText="Update Password"
        submitDisabled={strengthScore < 3}
        statusText={
          newPassword && strengthScore < 3
            ? 'Must meet 3+ complexity rules'
            : isDirty
            ? 'Credential changes pending'
            : 'All credentials secure'
        }
        formId="security-form"
        onDiscard={handleDiscard}
      />
    </div>
  );
}
