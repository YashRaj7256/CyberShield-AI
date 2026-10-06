'use client';

import React, { useState, useEffect } from 'react';
import {
  Server,
  ShieldAlert,
  Database,
  Lock,
  Cpu,
  ShieldBan,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';
import {
  SectionCard,
  SectionCardHeader,
  SectionCardBody,
  StickyActionBar,
  settingsInputClasses,
} from '@/components/settings/settings-ui';
import { cn } from '@/lib/utils';

export default function PlatformSettings() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  const [threatThreshold, setThreatThreshold] = useState(75);
  const [logRetentionDays, setLogRetentionDays] = useState(30);
  const [autoBlock, setAutoBlock] = useState(false);
  const [autoRetrain, setAutoRetrain] = useState(true);

  const [initialState, setInitialState] = useState({
    threatThreshold: 75,
    logRetentionDays: 30,
    autoBlock: false,
    autoRetrain: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setIsFetching(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const settings = await api.get<{ key: string; value: unknown }[]>('/settings/platform');

        if (Array.isArray(settings)) {
          let tt = 75;
          let lr = 30;
          let ab = false;
          let ar = true;

          settings.forEach((s) => {
            if (s.key === 'threat_threshold') {
              tt = Number(s.value);
              setThreatThreshold(tt);
            }
            if (s.key === 'log_retention_days') {
              lr = Number(s.value);
              setLogRetentionDays(lr);
            }
            if (s.key === 'auto_block_ips') {
              ab = Boolean(s.value);
              setAutoBlock(ab);
            }
            if (s.key === 'ml_auto_retrain') {
              ar = Boolean(s.value);
              setAutoRetrain(ar);
            }
          });

          setInitialState({ threatThreshold: tt, logRetentionDays: lr, autoBlock: ab, autoRetrain: ar });
        }
      } catch (error: unknown) {
        console.warn('Failed to fetch platform settings', error);
        setMessage({ type: 'error', text: 'Failed to load platform settings from server.' });
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, [isAdmin]);

  const isDirty =
    threatThreshold !== initialState.threatThreshold ||
    logRetentionDays !== initialState.logRetentionDays ||
    autoBlock !== initialState.autoBlock ||
    autoRetrain !== initialState.autoRetrain;

  const handleDiscard = () => {
    setThreatThreshold(initialState.threatThreshold);
    setLogRetentionDays(initialState.logRetentionDays);
    setAutoBlock(initialState.autoBlock);
    setAutoRetrain(initialState.autoRetrain);
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsLoading(true);
    setMessage(null);

    try {
      await Promise.all([
        api.patch('/settings/platform', { key: 'threat_threshold', value: threatThreshold, category: 'detection' }),
        api.patch('/settings/platform', { key: 'log_retention_days', value: logRetentionDays, category: 'storage' }),
        api.patch('/settings/platform', { key: 'auto_block_ips', value: autoBlock, category: 'automation' }),
        api.patch('/settings/platform', { key: 'ml_auto_retrain', value: autoRetrain, category: 'automation' }),
      ]);

      setInitialState({ threatThreshold, logRetentionDays, autoBlock, autoRetrain });
      setMessage({ type: 'success', text: 'Platform configuration updated and propagated to SOC cluster.' });
    } catch (error: unknown) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred while saving platform configuration.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const CyberToggle = ({
    value,
    onChange,
    disabled = false,
    id,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
    id: string;
  }) => (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => !disabled && onChange(!value)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 border transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
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

  const getThresholdSeverity = (val: number) => {
    if (val < 40) return { label: 'LOW', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (val < 70) return { label: 'MEDIUM', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' };
    if (val < 85) return { label: 'HIGH', color: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
    return { label: 'CRITICAL', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const thresholdSev = getThresholdSeverity(threatThreshold);

  if (isFetching) {
    return (
      <SectionCard className="p-8 flex items-center justify-center min-h-[360px]">
        <div className="flex items-center gap-3 text-slate-400 font-mono text-xs">
          <RefreshCw className="w-4 h-4 animate-spin text-[var(--accent)]" />
          <span>Loading platform rules...</span>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full min-w-0">
      <SectionCard className="relative">
        {/* Admin Privilege Restriction Overlay */}
        {!isAdmin && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0a0d14]/90 backdrop-blur-md p-6 text-center rounded-[14px]">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-500/15 border border-rose-500/30 text-rose-400 shadow-[0_0_25px_rgba(239,68,68,0.25)] mb-3.5">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">Admin Role Required</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
              Platform governance, ML heuristic thresholds, and IP containment rules are restricted to root security administrators.
            </p>
            <div className="mt-4 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-slate-400">
              Current Role: <span className="text-slate-200 font-semibold">{user?.role || 'VIEWER'}</span>
            </div>
          </div>
        )}

        <SectionCardHeader
          title="Platform Governance & Rules"
          subtitle="Tune machine learning threat thresholds, data retention policies, and automated containment."
          tag="Root Level"
          action={
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 shrink-0">
              <Lock className="w-3 h-3" />
              ADMIN ONLY
            </span>
          }
          icon={
            <div className="w-12 h-12 rounded-[10px] flex items-center justify-center text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/30 shadow-[0_0_15px_rgba(34,211,238,0.15)] shrink-0">
              <Server className="w-6 h-6" />
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

          <form id="platform-form" onSubmit={handleSave} className="flex flex-col gap-6 max-w-[720px] w-full min-w-0">
            {/* Thresholds and Storage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Threat Alert Threshold */}
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white tracking-wide">Threat Threshold</span>
                  </div>
                  <span className={cn('text-[10px] font-mono font-bold px-2 py-0.5 rounded border', thresholdSev.color)}>
                    {thresholdSev.label} ({threatThreshold})
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Composite ML scores reaching or exceeding this trigger automated alerts.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={threatThreshold}
                      onChange={(e) => setThreatThreshold(Number(e.target.value))}
                      disabled={!isAdmin}
                      className="flex-1 accent-[var(--accent)] cursor-pointer h-1.5 bg-white/[0.08] rounded-lg"
                    />
                    <div className="w-16">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={threatThreshold}
                        onChange={(e) => setThreatThreshold(Math.max(0, Math.min(100, Number(e.target.value))))}
                        disabled={!isAdmin}
                        className={cn(
                          settingsInputClasses,
                          'h-8 text-center font-mono text-xs text-[var(--accent)] font-bold px-1'
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>0 (Sensitive)</span>
                    <span>50 (Balanced)</span>
                    <span>100 (Strict)</span>
                  </div>
                </div>
              </div>

              {/* Log Retention Days */}
              <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Database className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-white tracking-wide">Log Retention</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-blue-500/10 text-blue-300 border-blue-500/30">
                    {logRetentionDays} DAYS
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Raw telemetry and authentication logs preserved before purging.
                </p>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="7"
                      max="365"
                      value={logRetentionDays}
                      onChange={(e) => setLogRetentionDays(Number(e.target.value))}
                      disabled={!isAdmin}
                      className="flex-1 accent-blue-400 cursor-pointer h-1.5 bg-white/[0.08] rounded-lg"
                    />
                    <div className="w-16">
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={logRetentionDays}
                        onChange={(e) => setLogRetentionDays(Math.max(7, Math.min(365, Number(e.target.value))))}
                        disabled={!isAdmin}
                        className={cn(
                          settingsInputClasses,
                          'h-8 text-center font-mono text-xs text-blue-300 font-bold px-1'
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>7 Days</span>
                    <span>90 Days</span>
                    <span>365 Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Automated SOC Defenses */}
            <div className="pt-5 border-t border-[var(--border)] space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.1em] text-slate-400">
                Automated SOC Defenses & Heuristics
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Auto-Block Malicious IPs */}
                <div className="flex items-center justify-between p-4 min-h-[82px] rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
                      <ShieldBan className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white tracking-wide truncate">Auto-Block Malicious IPs</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Issue instant firewall bans on addresses reaching 90+ threat severity scores.
                      </p>
                    </div>
                  </div>
                  <CyberToggle
                    id="auto-block-ips-toggle"
                    value={autoBlock}
                    onChange={setAutoBlock}
                    disabled={!isAdmin}
                  />
                </div>

                {/* ML Auto Retrain */}
                <div className="flex items-center justify-between p-4 min-h-[82px] rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--border-strong)] transition-all">
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white tracking-wide truncate">Continuous ML Auto-Retraining</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Re-calibrate neural model weights weekly using fresh log batches.
                      </p>
                    </div>
                  </div>
                  <CyberToggle
                    id="ml-auto-retrain-toggle"
                    value={autoRetrain}
                    onChange={setAutoRetrain}
                    disabled={!isAdmin}
                  />
                </div>
              </div>
            </div>
          </form>
        </SectionCardBody>
      </SectionCard>

      {/* Sticky Action Bar */}
      <StickyActionBar
        isDirty={isDirty}
        isLoading={isLoading}
        loadingText="Propagating Rules..."
        submitText="Save Configuration"
        submitDisabled={!isAdmin}
        statusText={!isAdmin ? 'Admin role required to modify' : isDirty ? 'Platform rules pending update' : 'Cluster rules active'}
        formId="platform-form"
        onDiscard={handleDiscard}
      />
    </div>
  );
}
