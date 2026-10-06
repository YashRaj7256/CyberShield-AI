'use client';

import { useState, useEffect } from 'react';
import { Lock, Shield, Calendar, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';
import {
  SectionCard,
  SectionCardHeader,
  SectionCardBody,
  FormField,
  InfoTile,
  StickyActionBar,
  settingsInputClasses,
} from '@/components/settings/settings-ui';
import { cn } from '@/lib/utils';

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore();

  const sanitizeName = (val: string | undefined | null, filter: string[]) => {
    if (!val) return '';
    const trimmed = val.trim();
    if (filter.some((f) => trimmed.toLowerCase() === f.toLowerCase())) {
      return '';
    }
    return trimmed;
  };

  const [firstName, setFirstName] = useState(() =>
    sanitizeName(user?.firstName, ['System'])
  );
  const [lastName, setLastName] = useState(() =>
    sanitizeName(user?.lastName, ['Administrator', 'Administration', 'Administaration'])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(sanitizeName(user.firstName, ['System']));
      setLastName(
        sanitizeName(user.lastName, ['Administrator', 'Administration', 'Administaration'])
      );
    }
  }, [user]);

  const initialFirst = sanitizeName(user?.firstName, ['System']);
  const initialLast = sanitizeName(user?.lastName, ['Administrator', 'Administration', 'Administaration']);
  const isDirty = initialFirst !== firstName || initialLast !== lastName;

  const handleDiscard = () => {
    setFirstName(sanitizeName(user?.firstName, ['System']));
    setLastName(
      sanitizeName(user?.lastName, ['Administrator', 'Administration', 'Administaration'])
    );
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const updated = await api.patch<{ firstName: string; lastName: string }>('/settings/profile', {
        firstName,
        lastName,
      });
      if (user) {
        setUser({ ...user, firstName: updated.firstName, lastName: updated.lastName });
      }
      setMessage({ type: 'success', text: 'Profile information updated successfully.' });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred while updating profile.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initials = `${firstName?.[0] || 'S'}${lastName?.[0] || 'A'}`.toUpperCase();

  const formattedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—';
  const formattedLastActive = user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—';

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Card 1: Profile Information                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionCardHeader
          title="Profile Information"
          subtitle="Update your security analyst display name and contact credentials."
          tag="Identity & Metadata"
          icon={
            /* 48px avatar tile */
            <div className="w-12 h-12 rounded-[10px] flex items-center justify-center font-mono font-bold text-base text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] shrink-0">
              {initials}
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

          {/* Form constrained to max readable width of ~720px */}
          <form
            id="profile-form"
            onSubmit={handleSave}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5 max-w-[720px] w-full min-w-0 overflow-visible"
          >
            {/* First Name Field */}
            <div className="min-w-0 overflow-visible">
              <FormField id="firstName" label="First Name">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className={settingsInputClasses}
                  style={{
                    height: '44px',
                    padding: '0 14px',
                    lineHeight: '44px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </FormField>
            </div>

            {/* Last Name Field */}
            <div className="min-w-0 overflow-visible">
              <FormField id="lastName" label="Last Name">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className={settingsInputClasses}
                  style={{
                    height: '44px',
                    padding: '0 14px',
                    lineHeight: '44px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </FormField>
            </div>

            {/* Email Field: spans both columns */}
            <div className="col-span-1 sm:col-span-2 min-w-0 overflow-visible">
              <FormField
                id="email"
                label="Email Address"
                helperText="Primary authentication ID · Email cannot be changed directly. Contact a platform administrator."
              >
                <div className="relative w-full min-w-0 overflow-visible">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={user?.email || '—'}
                    disabled
                    readOnly
                    className={cn(
                      settingsInputClasses,
                      'text-left text-slate-400 bg-white/[0.02] border-white/[0.06] cursor-not-allowed opacity-75'
                    )}
                    style={{
                      height: '44px',
                      padding: '0 14px 0 42px',
                      lineHeight: '44px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </FormField>
            </div>
          </form>
        </SectionCardBody>
      </SectionCard>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Card 2: Account Governance & Telemetry                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionCardHeader
          title="Account Governance & Telemetry"
          subtitle="Identity role assignments and security session timestamps."
        />

        <SectionCardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full min-w-0">
            {/* Assigned Role InfoTile */}
            <InfoTile
              label="Assigned Role"
              icon={<Shield className="w-3.5 h-3.5 text-[var(--accent)]" />}
              value={
                <span
                  className={cn(
                    'inline-flex items-center text-xs font-mono font-medium px-2.5 py-0.5 rounded-full border',
                    user?.role === 'ADMIN'
                      ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      : user?.role === 'ANALYST'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                  )}
                >
                  {user?.role || '—'}
                </span>
              }
            />

            {/* Provisioned Date InfoTile */}
            <InfoTile
              label="Provisioned Date"
              icon={<Calendar className="w-3.5 h-3.5 text-blue-400" />}
              value={<span className="font-mono text-xs">{formattedDate}</span>}
              fallback="—"
            />

            {/* Last Active InfoTile */}
            <InfoTile
              label="Last Active"
              icon={<Clock className="w-3.5 h-3.5 text-emerald-400" />}
              value={<span className="font-mono text-xs truncate">{formattedLastActive}</span>}
              fallback="—"
            />
          </div>
        </SectionCardBody>
      </SectionCard>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Card 3: Sticky Action Bar                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <StickyActionBar
        isDirty={isDirty}
        isLoading={isLoading}
        loadingText="Saving Changes..."
        submitText="Save Changes"
        formId="profile-form"
        onDiscard={handleDiscard}
      />
    </div>
  );
}
