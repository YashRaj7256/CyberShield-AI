'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import {
  SectionCard,
  SectionCardHeader,
  SectionCardBody,
  StickyActionBar,
} from '@/components/settings/settings-ui';
import { cn } from '@/lib/utils';

export default function NotificationSettings() {
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [dashboardAlerts, setDashboardAlerts] = useState(true);
  const [severityThreshold, setSeverityThreshold] = useState('MEDIUM');

  const [initialState, setInitialState] = useState({
    emailAlerts: false,
    dashboardAlerts: true,
    severityThreshold: 'MEDIUM',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get<{
          emailAlerts: boolean;
          dashboardAlerts: boolean;
          severityThreshold: string;
        }>('/settings/notifications');
        const email = data.emailAlerts ?? false;
        const dashboard = data.dashboardAlerts ?? true;
        const threshold = data.severityThreshold ?? 'MEDIUM';

        setEmailAlerts(email);
        setDashboardAlerts(dashboard);
        setSeverityThreshold(threshold);
        setInitialState({ emailAlerts: email, dashboardAlerts: dashboard, severityThreshold: threshold });
      } catch (error: unknown) {
        console.warn('Failed to fetch notification settings', error);
        setMessage({ type: 'error', text: 'Failed to load notification preferences from server.' });
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const isDirty =
    emailAlerts !== initialState.emailAlerts ||
    dashboardAlerts !== initialState.dashboardAlerts ||
    severityThreshold !== initialState.severityThreshold;

  const handleDiscard = () => {
    setEmailAlerts(initialState.emailAlerts);
    setDashboardAlerts(initialState.dashboardAlerts);
    setSeverityThreshold(initialState.severityThreshold);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await api.patch('/settings/notifications', {
        emailAlerts,
        dashboardAlerts,
        severityThreshold,
      });

      setInitialState({ emailAlerts, dashboardAlerts, severityThreshold });
      setMessage({ type: 'success', text: 'Notification preferences saved successfully.' });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred while saving preferences.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CyberToggle = ({
    value,
    onChange,
    id,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    id: string;
  }) => (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
        value
          ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]'
          : 'bg-white/[0.05] border-white/[0.12] hover:bg-white/[0.08]'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 rounded-full transition-transform duration-200 shadow-sm',
          value
            ? 'translate-x-5 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
            : 'translate-x-0 bg-slate-400'
        )}
      />
    </button>
  );

  const severityOptions = [
    {
      value: 'LOW',
      label: 'Low & Above',
      tag: 'ALL ALERTS',
      desc: 'Information notices, warnings, and intrusions.',
      activeColor: 'border-emerald-400 bg-emerald-500/15 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      dot: 'bg-emerald-400',
    },
    {
      value: 'MEDIUM',
      label: 'Medium & Above',
      tag: 'STANDARD',
      desc: 'Suspicious scanning, brute-force & hazards.',
      activeColor: 'border-yellow-400 bg-yellow-500/15 text-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.15)]',
      dot: 'bg-yellow-400',
    },
    {
      value: 'HIGH',
      label: 'High & Above',
      tag: 'CRITICAL OPS',
      desc: 'Severe exploit activity and confirmed attacks.',
      activeColor: 'border-orange-400 bg-orange-500/15 text-orange-200 shadow-[0_0_15px_rgba(249,115,22,0.15)]',
      dot: 'bg-orange-400',
    },
    {
      value: 'CRITICAL',
      label: 'Critical Only',
      tag: 'URGENT',
      desc: 'Emergency compromises & active exfiltration.',
      activeColor: 'border-rose-400 bg-rose-500/15 text-rose-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      dot: 'bg-rose-400',
    },
  ];

  if (isFetching) {
    return (
      <SectionCard className="p-8 flex items-center justify-center min-h-[360px]">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span>Loading notification configuration...</span>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      <SectionCard>
        <SectionCardHeader
          title="Notification Preferences"
          subtitle="Choose delivery channels and set minimum severity thresholds for threat alarms."
          tag="Dispatch & Escalation"
          icon={
            <div className="w-12 h-12 rounded-[10px] flex items-center justify-center text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] shrink-0">
              <Bell className="w-6 h-6" />
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

          <form id="notification-form" onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px] w-full min-w-0">
            {/* Dispatch Channels */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-slate-400">
                Notification Channels
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Alerts Channel */}
                <div className="flex items-center justify-between p-4 min-h-[82px] rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/15 border border-blue-500/30 text-blue-400 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-white tracking-wide truncate">Email Alerts</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Forward critical incidents directly to analyst inbox.
                      </p>
                    </div>
                  </div>
                  <CyberToggle id="email-alerts-toggle" value={emailAlerts} onChange={setEmailAlerts} />
                </div>

                {/* Dashboard Alerts Channel */}
                <div className="flex items-center justify-between p-4 min-h-[82px] rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-white tracking-wide truncate">Dashboard Realtime</h3>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Display visual toast alarms and live banner broadcasts.
                      </p>
                    </div>
                  </div>
                  <CyberToggle id="dashboard-alerts-toggle" value={dashboardAlerts} onChange={setDashboardAlerts} />
                </div>
              </div>
            </div>

            {/* Minimum Severity Threshold */}
            <div className="pt-5 border-t border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-slate-400">
                  Minimum Severity Filter
                </div>
                <span className="text-[11px] font-mono text-[var(--accent)]">
                  Threshold: {severityThreshold}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suppress telemetry noise by configuring the minimum incident severity needed to trigger dispatch.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {severityOptions.map((opt) => {
                  const isSelected = severityThreshold === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSeverityThreshold(opt.value)}
                      className={cn(
                        'flex flex-col justify-between p-3.5 rounded-[10px] border text-left transition-all duration-150 cursor-pointer min-w-0',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
                        isSelected
                          ? opt.activeColor
                          : 'border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-strong)] text-slate-300'
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-1.5 text-xs font-bold font-mono">
                            <span className={cn('w-2 h-2 rounded-full', opt.dot)} />
                            {opt.label}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/[0.1] bg-black/40">
                            {opt.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {opt.desc}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
                        <span className={isSelected ? 'text-white font-semibold' : 'text-slate-500'}>
                          {isSelected ? '✓ Selected' : 'Click to select'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </SectionCardBody>
      </SectionCard>

      {/* Sticky Action Bar */}
      <StickyActionBar
        isDirty={isDirty}
        isLoading={isLoading}
        loadingText="Saving Preferences..."
        submitText="Save Preferences"
        formId="notification-form"
        onDiscard={handleDiscard}
      />
    </div>
  );
}
