'use client';

import { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Brain,
  Zap,
  ArrowUpRight,
  ArrowUpDown,
  RefreshCw,
  Database,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Layers,
  Flame,
  Globe,
  Shield,
  User,
} from 'lucide-react';
import { mockAlerts } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { Alert } from '@/types';
import AlertTelemetryStrip from '@/components/alerts/alert-telemetry-strip';
import { getAiThreatReasoning, parseAlertDescription } from '@/lib/alert-parser';

const severityConfig: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  CRITICAL: { color: '#f87171', bg: 'rgba(239, 68, 68, 0.14)', border: 'rgba(239, 68, 68, 0.45)', glow: 'rgba(239, 68, 68, 0.16)' },
  HIGH: { color: '#fb923c', bg: 'rgba(249, 115, 22, 0.14)', border: 'rgba(249, 115, 22, 0.45)', glow: 'rgba(249, 115, 22, 0.16)' },
  MEDIUM: { color: '#facc15', bg: 'rgba(234, 179, 8, 0.14)', border: 'rgba(234, 179, 8, 0.45)', glow: 'rgba(234, 179, 8, 0.16)' },
  LOW: { color: '#4ade80', bg: 'rgba(34, 197, 94, 0.14)', border: 'rgba(34, 197, 94, 0.45)', glow: 'rgba(34, 197, 94, 0.16)' },
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  NEW: { icon: <Zap className="w-4 h-4" />, color: '#06b6d4', label: 'New Incidents' },
  INVESTIGATING: { icon: <Eye className="w-4 h-4" />, color: '#f59e0b', label: 'Under Investigation' },
  RESOLVED: { icon: <CheckCircle className="w-4 h-4" />, color: '#10b981', label: 'Resolved Alerts' },
  FALSE_POSITIVE: { icon: <XCircle className="w-4 h-4" />, color: '#94a3b8', label: 'False Positives' },
};

const alertTypeLabels: Record<string, string> = {
  BRUTE_FORCE: 'Authentication Brute Force',
  SUSPICIOUS_LOGIN: 'Suspicious Login',
  PORT_SCAN: 'Port Scanning',
  DDOS: 'DDoS Attack',
  MALWARE: 'Malware Activity',
  CREDENTIAL_STUFFING: 'Credential Stuffing',
  INSIDER_THREAT: 'Insider Threat',
  UNAUTHORIZED_ACCESS: 'Unauthorized Access',
  ANOMALY: 'Anomaly Detection',
  DATA_EXFILTRATION: 'Data Exfiltration',
  POLICY_VIOLATION: 'Policy Violation',
};

function formatAlertType(type: string): string {
  return alertTypeLabels[type] || type?.replace(/_/g, ' ') || 'Security Alert';
}

function getEffectiveSeverity(alert: { severity?: string; threatScore?: number }): string {
  const score = Math.round(alert.threatScore || 0);
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  if (alert.severity && alert.severity !== 'LOW') return alert.severity;
  return 'LOW';
}

function formatAssignee(assignedTo: Alert['assignedTo']): string | null {
  if (!assignedTo) return null;
  if (typeof assignedTo === 'object') {
    const fullName = `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim();
    return fullName || assignedTo.email || assignedTo.id || 'Assigned';
  }
  return String(assignedTo);
}

function StatusPill({ label, value, online = true }: { label: string; value: string; online?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: online ? '#34d399' : '#f87171',
        }}
      />
      <span className="text-[11px] font-mono text-slate-500 tracking-wide">{label}:</span>
      <span className="text-[11px] font-mono font-medium text-slate-300">{value}</span>
    </div>
  );
}

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Live data state
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    NEW: mockAlerts.filter((a) => a.status === 'NEW').length,
    INVESTIGATING: mockAlerts.filter((a) => a.status === 'INVESTIGATING').length,
    RESOLVED: mockAlerts.filter((a) => a.status === 'RESOLVED').length,
    FALSE_POSITIVE: mockAlerts.filter((a) => a.status === 'FALSE_POSITIVE').length,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Action feedback state
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch alerts from backend
  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await api.get<unknown>('/alerts');
      let alertList: Alert[] = [];

      if (Array.isArray(res)) {
        alertList = res as Alert[];
      } else if (res && typeof res === 'object') {
        const anyRes = res as Record<string, unknown>;
        if (Array.isArray(anyRes.alerts)) {
          alertList = anyRes.alerts as Alert[];
        } else if (Array.isArray(anyRes.data)) {
          alertList = anyRes.data as Alert[];
        }
      }

      if (alertList.length > 0) {
        setAlerts(alertList);
        setIsDemo(false);
        const counts = alertList.reduce<Record<string, number>>((acc, a) => {
          acc[a.status] = (acc[a.status] || 0) + 1;
          return acc;
        }, {});
        setStatusCounts({
          NEW: counts.NEW || 0,
          INVESTIGATING: counts.INVESTIGATING || 0,
          RESOLVED: counts.RESOLVED || 0,
          FALSE_POSITIVE: counts.FALSE_POSITIVE || 0,
        });
      } else {
        setAlerts(mockAlerts);
        setIsDemo(true);
      }
    } catch {
      setAlerts(mockAlerts);
      setIsDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Handle alert status update
  const handleAlertAction = async (
    alertId: string,
    newStatus: 'RESOLVED' | 'INVESTIGATING' | 'FALSE_POSITIVE',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const prevAlerts = [...alerts];
    const prevCounts = { ...statusCounts };

    const targetAlert = alerts.find((a) => a.id === alertId);
    if (!targetAlert) return;
    const oldStatus = targetAlert.status;

    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
    );
    setStatusCounts((prev) => ({
      ...prev,
      [oldStatus]: Math.max(0, (prev[oldStatus] || 0) - 1),
      [newStatus]: (prev[newStatus] || 0) + 1,
    }));

    try {
      if (!isDemo) {
        await api.patch(`/alerts/${alertId}/status`, { status: newStatus });
      }
      setActionSuccess(alertId);
      setTimeout(() => setActionSuccess(null), 1500);
    } catch {
      setAlerts(prevAlerts);
      setStatusCounts(prevCounts);
      setActionError(alertId);
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const severityCounts = useMemo(() => {
    return {
      ALL: alerts.length,
      CRITICAL: alerts.filter((a) => a.severity === 'CRITICAL').length,
      HIGH: alerts.filter((a) => a.severity === 'HIGH').length,
      MEDIUM: alerts.filter((a) => a.severity === 'MEDIUM').length,
      LOW: alerts.filter((a) => a.severity === 'LOW').length,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
      const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.sourceIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesStatus && matchesSearch;
    });
  }, [alerts, severityFilter, statusFilter, searchQuery]);

  const activeIncidents = useMemo(() => {
    return filteredAlerts.filter(
      (a) => a.status === 'NEW' || a.status === 'INVESTIGATING'
    );
  }, [filteredAlerts]);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-7 animate-fade-in pb-16">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SOC Command Banner                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          padding: '20px 24px',
          background: 'rgba(13, 17, 23, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        {/* Top accent — subtle 1px gradient line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-rose-500/50 via-cyan-500/30 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Brand + Status */}
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[16px] font-semibold text-white tracking-tight">
                  Security Operations Incident Alerts
                </h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/40 text-rose-400 border border-rose-800/30 tracking-wider">
                  ENCLAVE-01
                </span>
                {isDemo && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/30 tracking-wider">
                    DEMO DATA
                  </span>
                )}
              </div>
            </div>

            {/* System Status Row */}
            <div
              className="flex flex-wrap items-center gap-5 pt-3 mt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <StatusPill label="Defense Posture" value="Active Triage" online={true} />
              <StatusPill label="Telemetry Stream" value="Connected" online={true} />
              <StatusPill label="Detection Engine" value="CyberShield AI v2.4" online={true} />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-center">
            <button
              onClick={fetchAlerts}
              disabled={isLoading}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[12px] font-mono font-semibold transition-all cursor-pointer border"
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderColor: 'rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.color = '#94a3b8';
              }}
              title="Sync alerts"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Key Performance Indicators (Centered layout prevents corner clip) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-3 h-3 text-slate-500" />
          <span className="text-[11px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-400">
            Key Performance Indicators
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = statusCounts[key] ?? 0;
            const isSelected = statusFilter === key;
            return (
              <div
                key={key}
                onClick={() => setStatusFilter(isSelected ? 'ALL' : key)}
                className="group relative rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-150 cursor-pointer"
                style={{
                  padding: '18px 22px',
                  minHeight: '150px',
                  background: isSelected ? 'rgba(6, 182, 212, 0.06)' : 'rgba(13, 17, 23, 0.92)',
                  border: isSelected ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.12)' : 'none',
                }}
              >
                {/* 1. Header: Label + Accent Icon */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-medium text-slate-400 truncate tracking-wide">
                    {config.label}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      background: `${config.color}15`,
                      color: config.color,
                      border: `1px solid ${config.color}30`,
                    }}
                  >
                    {config.icon}
                  </div>
                </div>

                {/* 2. Middle: Large Value & Tag in Center */}
                <div className="flex flex-col items-center justify-center text-center my-auto py-1">
                  <span className="text-[2.2rem] sm:text-[2.4rem] font-bold font-mono text-white tracking-tight leading-none">
                    {count}
                  </span>
                  <div className="mt-2.5">
                    <span
                      className="inline-block text-[10px] font-mono font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{
                        background:
                          key === 'NEW'
                            ? 'rgba(6, 182, 212, 0.12)'
                            : key === 'INVESTIGATING'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : key === 'RESOLVED'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(148, 163, 184, 0.1)',
                        color:
                          key === 'NEW'
                            ? '#22d3ee'
                            : key === 'INVESTIGATING'
                            ? '#fbbf24'
                            : key === 'RESOLVED'
                            ? '#34d399'
                            : '#94a3b8',
                        border:
                          key === 'NEW'
                            ? '1px solid rgba(6, 182, 212, 0.35)'
                            : key === 'INVESTIGATING'
                            ? '1px solid rgba(245, 158, 11, 0.35)'
                            : key === 'RESOLVED'
                            ? '1px solid rgba(16, 185, 129, 0.35)'
                            : '1px solid rgba(148, 163, 184, 0.25)',
                      }}
                    >
                      {key === 'NEW' ? 'Requires Action' : key === 'INVESTIGATING' ? 'Under Review' : key === 'RESOLVED' ? 'Mitigated' : 'Ignored'}
                    </span>
                  </div>
                </div>

                {/* 3. Footer: Centered Filter Hint without border line */}
                <div className="text-center mt-auto pt-1">
                  <span className="text-slate-500 text-[10px] font-mono tracking-wide">
                    {isSelected ? '✓ Active Filter' : 'Click to filter'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Filter & Search Parameters Toolbar (Matching Reference UI) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl flex-1 max-w-lg"
          style={{
            background: 'rgba(13, 17, 23, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            placeholder="Search alerts by title, IP, signature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-[12px] font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none flex-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 cursor-pointer px-1"
            >
              Clear
            </button>
          )}
        </div>

        {/* Severity Filter Segmented Capsule */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Severity:
            </span>
          </div>

          <div
            className="inline-flex items-center p-1 rounded-xl gap-1.5"
            style={{
              background: 'rgba(13, 17, 23, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            {[
              { id: 'ALL', label: 'All', color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.16)', border: 'rgba(6, 182, 212, 0.45)' },
              { id: 'CRITICAL', label: 'Critical', color: '#f87171', bg: 'rgba(239, 68, 68, 0.16)', border: 'rgba(239, 68, 68, 0.45)' },
              { id: 'HIGH', label: 'High', color: '#fb923c', bg: 'rgba(249, 115, 22, 0.16)', border: 'rgba(249, 115, 22, 0.45)' },
              { id: 'MEDIUM', label: 'Medium', color: '#facc15', bg: 'rgba(234, 179, 8, 0.16)', border: 'rgba(234, 179, 8, 0.45)' },
              { id: 'LOW', label: 'Low', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.16)', border: 'rgba(34, 197, 94, 0.45)' },
            ].map(({ id, label, color, bg, border }) => {
              const isActive = severityFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSeverityFilter(id)}
                  className="h-8 min-w-[58px] px-3.5 rounded-lg text-[12px] font-mono font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                  style={{
                    background: isActive ? bg : 'transparent',
                    border: isActive ? `1px solid ${border}` : '1px solid rgba(255, 255, 255, 0.06)',
                    color: isActive ? color : '#94a3b8',
                    boxShadow: isActive ? `0 0 10px ${border}` : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#f1f5f9';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                    }
                  }}
                  title={`Filter by ${label} severity`}
                >
                  {id !== 'ALL' && (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        background: color,
                        boxShadow: isActive ? `0 0 6px ${color}` : 'none',
                      }}
                    />
                  )}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {fetchError && (
        <div
          className="p-4 rounded-xl flex items-center justify-between gap-3 text-xs"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            onClick={fetchAlerts}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Section View Mode Switcher Toolbar                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Section View Mode Switcher Toolbar                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-1 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-black/40 border border-white/[0.12]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Queue Table ({filteredAlerts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Incidents Grid ({activeIncidents.length})</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 pl-1 border-l border-white/[0.08]">
            <span>Ordered by priority</span>
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 self-start sm:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-medium">Synchronized Ingestion</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300">{filteredAlerts.length} events active</span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. VIEW: Alert Queue (Structured Table with Dark Borders)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="space-y-2 pt-1">
          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-12 rounded-lg animate-pulse"
                  style={{
                    background: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Alert Queue Table */}
          {!isLoading && filteredAlerts.length > 0 && (
            <div
              className="overflow-x-auto rounded-lg border shadow-lg"
              style={{
                background: 'rgba(13, 17, 23, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr
                    className="border-b text-[10.5px] font-mono uppercase tracking-wider text-slate-400 bg-white/[0.03]"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <th className="py-3 px-3.5 w-[130px] text-center border-r border-white/[0.08] border-l-4 border-l-transparent">
                      Severity
                    </th>
                    <th className="py-3 px-3 min-w-[320px]">Incident & Threat Narrative</th>
                    <th className="py-3 px-3 w-[170px]">Detection Vector</th>
                    <th className="py-3 px-3 w-[160px]">Source & Origin</th>
                    <th className="py-3 px-3 w-[130px]">Status</th>
                    <th className="py-3 px-3 w-[95px] text-right">Risk Score</th>
                    <th className="py-3 px-3 w-[100px] text-right">Detected</th>
                    <th className="py-3 pl-2 pr-4 w-[85px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                  {filteredAlerts.map((alert) => {
                    const effectiveSev = getEffectiveSeverity(alert);
                    const sev = severityConfig[effectiveSev] || severityConfig.LOW;
                    const status = statusConfig[alert.status] || statusConfig.NEW;
                    const isExpanded = expandedId === alert.id;
                    const isSuccess = actionSuccess === alert.id;
                    const isError = actionError === alert.id;
                    const roundedScore = Math.round(alert.threatScore);
                    const parsed = parseAlertDescription(alert.description, alert.title, alert.type, alert.sourceIp);

                    return (
                      <Fragment key={alert.id}>
                        <tr
                          onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                          className="group cursor-pointer hover:bg-white/[0.04] transition-colors"
                          style={{
                            borderLeft: `4px solid ${sev.color}`,
                            background: isExpanded ? 'rgba(15, 20, 28, 0.98)' : 'transparent',
                          }}
                        >
                          {/* 1. Severity Container with proper width and border separation */}
                          <td className="py-2.5 px-3 align-middle text-center border-r border-white/[0.08]">
                            <div className="flex items-center justify-center">
                              <div
                                className="inline-flex items-center justify-center gap-1.5 w-[100px] h-7 px-2.5 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm transition-all"
                                style={{
                                  background: sev.bg,
                                  border: `1px solid ${sev.border}`,
                                  color: sev.color,
                                  boxShadow: `0 0 10px ${sev.glow}`,
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{
                                    background: sev.color,
                                    boxShadow: `0 0 6px ${sev.color}`,
                                  }}
                                />
                                <span>{effectiveSev}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Incident & Threat Narrative */}
                          <td className="py-2.5 px-3 align-middle">
                            <div className="min-w-0 pr-2">
                              <div className="font-semibold text-[13px] text-white group-hover:text-cyan-300 transition-colors truncate">
                                {alert.title}
                              </div>
                              <div className="text-[11.5px] text-slate-400 truncate mt-0.5 max-w-xl">
                                {parsed.narrative}
                              </div>
                              {alert.assignedTo && (
                                <div className="text-[10px] font-mono text-cyan-400/90 mt-1 flex items-center gap-1">
                                  <User className="w-2.5 h-2.5" />
                                  <span>Assignee: {formatAssignee(alert.assignedTo)}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 3. Detection Vector (Category + Sensor) */}
                          <td className="py-2.5 px-3 align-middle">
                            <div className="space-y-1">
                              <div className="text-[11.5px] font-medium text-slate-200 truncate">
                                {formatAlertType(alert.type)}
                              </div>
                              {parsed.detector && (
                                <span className="inline-flex items-center gap-1 text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                                  <Shield className="w-2.5 h-2.5 text-cyan-400" />
                                  {parsed.detector}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* 4. Source & Origin (IP + Country) */}
                          <td className="py-2.5 px-3 align-middle">
                            <div className="space-y-1">
                              <span className="inline-block font-mono text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 text-[11px]">
                                {alert.sourceIp}
                              </span>
                              {parsed.country && (
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span className="truncate">{parsed.country}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 5. Status */}
                          <td className="py-2.5 px-3 align-middle">
                            <span
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded"
                              style={{
                                background: `${status.color}15`,
                                border: `1px solid ${status.color}35`,
                                color: status.color,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                              <span>{status.label}</span>
                            </span>
                          </td>

                          {/* 6. Risk Score */}
                          <td className="py-2.5 px-3 align-middle text-right">
                            <div
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[12px] font-bold"
                              style={{
                                background: `${sev.color}10`,
                                borderColor: `${sev.color}35`,
                                color: sev.color,
                              }}
                            >
                              <span>{roundedScore}</span>
                              <span className="text-[9px] text-slate-500 font-normal">/100</span>
                            </div>
                          </td>

                          {/* 7. Time */}
                          <td className="py-2.5 px-3 align-middle text-right text-[11px] font-mono text-slate-400 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {formatTime(alert.createdAt)}
                            </span>
                          </td>

                          {/* 8. Actions / Inspect */}
                          <td className="py-2.5 pl-2 pr-4 align-middle text-center">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                              title="Expand incident details"
                            >
                              <span>{isExpanded ? 'Close' : 'View'}</span>
                              <ChevronRight
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                          </td>
                        </tr>

                        {/* Accordion Detail Row */}
                        {isExpanded && (
                          <tr
                            style={{
                              background: 'rgba(15, 20, 28, 0.98)',
                              borderLeft: `3.5px solid ${sev.color}`,
                            }}
                          >
                            <td colSpan={8} className="p-4 sm:p-5">
                              <div className="space-y-4">
                                {/* Incident Narrative & Telemetry Details */}
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-500">
                                    Incident Narrative & Telemetry Details
                                  </span>
                                  <AlertTelemetryStrip
                                    description={alert.description}
                                    title={alert.title}
                                    alertType={alert.type}
                                    sourceIp={alert.sourceIp}
                                    mode="full"
                                  />
                                </div>

                                {/* AI Reasoning */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                                    <Brain className="w-3.5 h-3.5" />
                                    <span>AI Threat Reasoning & Heuristics</span>
                                  </div>
                                  <p className="text-[12.5px] text-slate-300 leading-relaxed font-normal">
                                    {getAiThreatReasoning(alert)}
                                  </p>
                                </div>

                                {/* Precursors */}
                                {Array.isArray(alert.reasons) && alert.reasons.length > 0 && (
                                  <div className="space-y-1.5">
                                    <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-500">
                                      Diagnostic Precursors
                                    </span>
                                    <ul className="space-y-1.5 pl-1">
                                      {alert.reasons.map((reason: unknown, idx: number) => (
                                        <li
                                          key={idx}
                                          className="flex items-start gap-2.5 text-[12px] text-slate-300 leading-relaxed"
                                        >
                                          <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                          <span>
                                            {typeof reason === 'string' ? reason : JSON.stringify(reason)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3 pt-2 flex-wrap">
                                  {isSuccess && (
                                    <span className="text-xs font-mono font-semibold text-emerald-400 mr-2">
                                      ✓ Status Updated
                                    </span>
                                  )}
                                  {isError && (
                                    <span className="text-xs font-mono font-semibold text-rose-400 mr-2">
                                      ✗ Action Failed
                                    </span>
                                  )}

                                  {!isSuccess && (
                                    <>
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-2 h-8 px-3.5 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer border shadow-sm"
                                        style={{
                                          background: 'rgba(34, 197, 94, 0.12)',
                                          borderColor: 'rgba(34, 197, 94, 0.3)',
                                          color: '#4ade80',
                                        }}
                                        onClick={(e) => handleAlertAction(alert.id, 'RESOLVED', e)}
                                      >
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Resolve Incident</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-2 h-8 px-3.5 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer border shadow-sm"
                                        style={{
                                          background: 'rgba(245, 158, 11, 0.12)',
                                          borderColor: 'rgba(245, 158, 11, 0.3)',
                                          color: '#fbbf24',
                                        }}
                                        onClick={(e) => handleAlertAction(alert.id, 'INVESTIGATING', e)}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Investigate</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-2 h-8 px-3.5 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer border shadow-sm"
                                        style={{
                                          background: 'rgba(255, 255, 255, 0.04)',
                                          borderColor: 'rgba(255, 255, 255, 0.08)',
                                          color: '#94a3b8',
                                        }}
                                        onClick={(e) => handleAlertAction(alert.id, 'FALSE_POSITIVE', e)}
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        <span>False Positive</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredAlerts.length === 0 && (
            <div
              className="p-10 rounded-lg text-center space-y-3"
              style={{
                background: 'rgba(13, 17, 23, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-500" />
              <h3 className="text-sm font-semibold text-white">
                No matching alerts in queue
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                No security alerts currently match your active search and severity filter parameters.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. VIEW: Active Incidents (Responsive Grid with Dark Borders)  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[12px] font-mono font-semibold tracking-[0.14em] uppercase text-white">
                  Active Incidents ({activeIncidents.length})
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/50 text-rose-400 border border-rose-800/40">
                  REQUIRES ACTION
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              High-priority events requiring immediate triage
            </span>
          </div>

          {/* Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 rounded-lg animate-pulse"
                  style={{
                    background: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Active Incidents Grid */}
          {!isLoading && activeIncidents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeIncidents.map((alert) => {
                const effectiveSev = getEffectiveSeverity(alert);
                const sev = severityConfig[effectiveSev] || severityConfig.LOW;
                const status = statusConfig[alert.status] || statusConfig.NEW;
                const isExpanded = expandedId === alert.id;
                const isSuccess = actionSuccess === alert.id;
                const isError = actionError === alert.id;
                const roundedScore = Math.round(alert.threatScore);

                return (
                  <div
                    key={alert.id}
                    className="group relative rounded-lg p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 border shadow-lg hover:border-white/[0.22] hover:shadow-cyan-950/20"
                    style={{
                      background: 'rgba(13, 17, 23, 0.96)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      borderLeft: `4px solid ${sev.color}`,
                    }}
                  >
                    <div className="space-y-3.5">
                      {/* Top: Badges & Score */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div
                            className="inline-flex items-center justify-center gap-1.5 min-w-[92px] h-6 px-2.5 rounded-md font-mono text-[10.5px] font-bold uppercase tracking-wider shadow-sm"
                            style={{
                              background: sev.bg,
                              border: `1px solid ${sev.border}`,
                              color: sev.color,
                              boxShadow: `0 0 10px ${sev.glow}`,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{
                                background: sev.color,
                                boxShadow: `0 0 6px ${sev.color}`,
                              }}
                            />
                            <span>{effectiveSev}</span>
                          </div>
                          <span
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-medium px-2 py-0.5 rounded"
                            style={{
                              background: `${status.color}15`,
                              border: `1px solid ${status.color}35`,
                              color: status.color,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                            {status.label}
                          </span>
                        </div>

                        {/* Harmonious, clean Risk Badge */}
                        <div
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border shrink-0"
                          style={{
                            background: `${sev.color}10`,
                            borderColor: `${sev.color}35`,
                          }}
                        >
                          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                            Risk
                          </span>
                          <span
                            className="text-[13px] font-bold font-mono tracking-tight"
                            style={{ color: sev.color }}
                          >
                            {roundedScore}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">/100</span>
                        </div>
                      </div>

                      {/* Title & Decluttered Preview */}
                      <div className="space-y-1.5">
                        <h4 className="text-[14px] font-semibold text-white tracking-tight line-clamp-1 group-hover:text-cyan-300 transition-colors">
                          {alert.title}
                        </h4>
                        <AlertTelemetryStrip
                          description={alert.description}
                          title={alert.title}
                          alertType={alert.type}
                          sourceIp={alert.sourceIp}
                          mode="compact"
                        />
                      </div>

                      {/* Structured Meta Info Token Bar */}
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400 py-2 border-t border-white/[0.08]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="text-slate-400 whitespace-nowrap">{formatTime(alert.createdAt)}</span>
                          <span className="text-slate-700">•</span>
                          <span className="text-slate-300 truncate">{formatAlertType(alert.type)}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 font-mono text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 text-[10.5px]">
                          <span>{alert.sourceIp}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Quick Actions */}
                    <div className="pt-3 border-t border-white/[0.08] mt-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isSuccess && (
                            <span className="text-[11px] font-mono font-semibold text-emerald-400">
                              ✓ Updated
                            </span>
                          )}
                          {isError && (
                            <span className="text-[11px] font-mono font-semibold text-rose-400">
                              ✗ Error
                            </span>
                          )}
                          {!isSuccess && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleAlertAction(alert.id, 'INVESTIGATING', e)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-mono font-semibold rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer active:scale-95"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Investigate</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleAlertAction(alert.id, 'RESOLVED', e)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-mono font-semibold rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer active:scale-95"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span>Resolve</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleAlertAction(alert.id, 'FALSE_POSITIVE', e)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-[10.5px] font-mono font-semibold rounded bg-white/[0.03] text-slate-400 border border-white/[0.08] hover:bg-white/[0.08] hover:text-slate-200 transition-all cursor-pointer active:scale-95"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Dismiss</span>
                              </button>
                            </>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                          className="px-2 py-1 rounded text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <span>{isExpanded ? 'Hide' : 'Details'}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      </div>

                      {/* Expanded Grid Dossier */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-2 text-[12px] text-slate-300">
                          <div className="flex items-center gap-1.5 text-cyan-400 font-mono text-[10px] uppercase font-semibold tracking-wider">
                            <Brain className="w-3.5 h-3.5" />
                            <span>AI Threat Diagnostics</span>
                          </div>
                          <p className="text-[12px] text-slate-300 leading-relaxed font-normal bg-black/30 p-2.5 rounded border border-white/[0.06]">
                            {getAiThreatReasoning(alert)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isLoading && activeIncidents.length === 0 && (
            <div
              className="p-8 rounded-lg text-center space-y-2 border"
              style={{
                background: 'rgba(13, 17, 23, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <CheckCircle className="w-6 h-6 mx-auto text-emerald-400" />
              <h4 className="text-sm font-semibold text-white">No Active Incidents Pending</h4>
              <p className="text-xs text-slate-400">
                All high-priority alerts in this filter scope have been mitigated or acknowledged.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
