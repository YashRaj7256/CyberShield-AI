'use client';

import { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Brain,
  Zap,
  ArrowUpRight,
  ArrowUpDown,
  RefreshCw,
  Database,
  LayoutGrid,
  Table as TableIcon,
  Flame,
  Globe,
  Shield,
  User,
} from 'lucide-react';
import { mockAlerts } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { Alert } from '@/types';
import AlertTelemetryStrip from '@/components/alerts/alert-telemetry-strip';
import { SeverityBadge, getSeverityMeta, SEVERITY_TOKENS } from '@/components/alerts/severity-badge';
import { getAiThreatReasoning, parseAlertDescription } from '@/lib/alert-parser';
import { SearchBar } from '@/components/domain/search-bar';
import { StatusPill } from '@/components/domain/status-pill';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  NEW: { icon: <Zap className="w-4 h-4" />, color: '#06b6d4', label: 'New Incidents' },
  INVESTIGATING: { icon: <Eye className="w-4 h-4" />, color: '#f59e0b', label: 'Under Investigation' },
  RESOLVED: { icon: <CheckCircle className="w-4 h-4" />, color: '#10b981', label: 'Resolved Alerts' },
  FALSE_POSITIVE: { icon: <XCircle className="w-4 h-4" />, color: '#94a3b8', label: 'False Positives' },
};

const statusChipConfig: Record<
  string,
  { label: string; text: string; bg: string; border: string; dot: string }
> = {
  NEW: {
    label: 'New Incidents',
    text: '#22d3ee',
    bg: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.35)',
    dot: '#06b6d4',
  },
  INVESTIGATING: {
    label: 'Under Investigation',
    text: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.35)',
    dot: '#f59e0b',
  },
  RESOLVED: {
    label: 'Resolved',
    text: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.35)',
    dot: '#22c55e',
  },
  FALSE_POSITIVE: {
    label: 'False Positive',
    text: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.12)',
    border: 'rgba(148, 163, 184, 0.35)',
    dot: '#64748b',
  },
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
  if (alert.severity && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(alert.severity.toUpperCase())) {
    return alert.severity.toUpperCase();
  }
  const score = Math.round(alert.threatScore || 0);
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
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

const SEVERITY_ORDER = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'priority' | 'time'>('priority');

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
      const res = await api.get<unknown>('/alerts', { limit: 100 });
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

  // Severity counts ensuring Critical + High + Medium + Low = All exactly
  const severityCounts = useMemo(() => {
    const crit = alerts.filter((a) => getEffectiveSeverity(a) === 'CRITICAL').length;
    const high = alerts.filter((a) => getEffectiveSeverity(a) === 'HIGH').length;
    const med = alerts.filter((a) => getEffectiveSeverity(a) === 'MEDIUM').length;
    const low = alerts.filter((a) => getEffectiveSeverity(a) === 'LOW').length;
    return {
      ALL: crit + high + med + low,
      CRITICAL: crit,
      HIGH: high,
      MEDIUM: med,
      LOW: low,
    };
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const list = alerts.filter((alert) => {
      const effectiveSev = getEffectiveSeverity(alert);
      const matchesSeverity = severityFilter === 'ALL' || effectiveSev === severityFilter;
      const matchesStatus = statusFilter === 'ALL' || alert.status === statusFilter;
      const matchesSearch =
        !searchQuery ||
        (alert.title && alert.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (alert.sourceIp && alert.sourceIp.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (alert.type && alert.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (alert.description && alert.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSeverity && matchesStatus && matchesSearch;
    });

    const severityRank: Record<string, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return list.sort((a, b) => {
      if (sortBy === 'priority') {
        const rankDiff = (severityRank[getEffectiveSeverity(b)] || 0) - (severityRank[getEffectiveSeverity(a)] || 0);
        if (rankDiff !== 0) return rankDiff;

        const scoreDiff = (b.threatScore || 0) - (a.threatScore || 0);
        if (scoreDiff !== 0) return scoreDiff;

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [alerts, severityFilter, statusFilter, searchQuery, sortBy]);

  const activeIncidents = useMemo(() => {
    return filteredAlerts.filter(
      (a) => a.status === 'NEW' || a.status === 'INVESTIGATING'
    );
  }, [filteredAlerts]);

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-16 min-w-0 w-full max-w-full">
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
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-rose-500/50 via-cyan-500/30 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

            <div
              className="flex flex-wrap items-center gap-5 pt-3 mt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <StatusPill label="Defense Posture" value="Active Triage" variant="warning" />
              <StatusPill label="Telemetry Stream" value="Connected" variant="success" pulse />
              <StatusPill label="Detection Engine" value="CyberShield AI v2.4" variant="info" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchAlerts}
              disabled={isLoading}
              className="font-mono text-xs gap-2 h-9"
              title="Sync alerts"
            >
              <RefreshCw className={cn('w-3.5 h-3.5 text-cyan-400', isLoading && 'animate-spin')} />
              <span>Sync</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Key Performance Indicators (16px gap from Header Card)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
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
                  padding: '16px 20px',
                  minHeight: '136px',
                  background: isSelected ? 'rgba(6, 182, 212, 0.06)' : 'rgba(13, 17, 23, 0.92)',
                  border: isSelected ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
                  boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.12)' : 'none',
                }}
              >
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
      {/* 3. Controls & View Content (20px gap from KPI cards)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mt-1 min-w-0 w-full max-w-full">
        {/* ROW 1: Search (flex-1) + Severity Segmented Control (h-10 each, gap-3) */}
        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-3 w-full">
          {/* Search Input (height 40px aligned with severity bar) */}
          <SearchBar
            placeholder="Search alerts by title, IP, signature..."
            value={searchQuery}
            onChange={setSearchQuery}
            containerClassName="!h-10 flex-1 max-w-none rounded-[10px]"
          />

          {/* Severity Segmented Control (Container: 40px height, 4px padding, 10px radius) */}
          <div className="flex items-center gap-3 shrink-0 overflow-x-auto md:overflow-visible py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center gap-1.5 text-slate-500 shrink-0 select-none">
              <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-slate-500 font-semibold">
                SEVERITY
              </span>
            </div>

            <div
              role="group"
              aria-label="Filter alerts by severity"
              className="inline-flex items-center h-10 p-1 rounded-[10px] gap-1 shrink-0 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {SEVERITY_ORDER.map((id) => {
                const meta = SEVERITY_TOKENS[id];
                const count = severityCounts[id] ?? 0;
                const isActive = severityFilter === id;
                const [r, g, b] = meta.rgb;
                const isZero = count === 0;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSeverityFilter(id)}
                    className={cn(
                      'h-8 min-w-[88px] px-3 rounded-lg text-[12px] font-mono font-semibold uppercase tracking-[0.06em] flex items-center justify-center gap-1.5 cursor-pointer select-none transition-all duration-[120ms]',
                      'focus:outline-none focus-visible:outline-2 focus-visible:outline-cyan-400 focus-visible:outline-offset-2',
                      isZero && 'opacity-45'
                    )}
                    style={{
                      background: isActive ? `rgba(${r}, ${g}, ${b}, 0.14)` : 'transparent',
                      border: isActive
                        ? `1px solid rgba(${r}, ${g}, ${b}, 0.45)`
                        : '1px solid transparent',
                      color: isActive ? meta.hex : '#94a3b8',
                      boxShadow: isActive
                        ? `inset 0 0 0 1px rgba(${r}, ${g}, ${b}, 0.45), 0 0 0 3px rgba(${r}, ${g}, ${b}, 0.12)`
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = '#e2e8f0';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                    title={`Filter by ${meta.label} severity (${count} alerts)`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: meta.hex }}
                      aria-hidden="true"
                    />
                    <span>{meta.label}</span>
                    <span
                      className="text-[11px] font-mono tabular-nums px-[6px] py-[1px] rounded-[6px] transition-colors"
                      style={{
                        background: isActive
                          ? `rgba(${r}, ${g}, ${b}, 0.22)`
                          : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? meta.hex : '#cbd5e1',
                      }}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 2: View tabs (36px segmented control) + Sort + Synchronized Ingestion (12px gap) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* View tabs segmented control */}
            <div
              role="tablist"
              aria-label="Alert views"
              className="inline-flex items-center h-9 p-0.5 rounded-lg border border-white/[0.08]"
              style={{ background: 'rgba(255, 255, 255, 0.03)' }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'table'}
                onClick={() => setViewMode('table')}
                className={cn(
                  'inline-flex items-center gap-2 h-7 px-3 rounded-[6px] text-[13px] font-mono font-semibold tracking-[0.06em] transition-all cursor-pointer',
                  viewMode === 'table'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                )}
                title="Queue Table: 100 ingested alerts in current batch (out of 110 total system alerts)"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Queue Table</span>
                <span
                  className={cn(
                    'text-[11px] font-mono tabular-nums px-[6px] py-[1px] rounded-[6px]',
                    viewMode === 'table'
                      ? 'bg-cyan-500/30 text-cyan-200'
                      : 'bg-white/[0.06] text-slate-300'
                  )}
                >
                  {filteredAlerts.length}
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={cn(
                  'inline-flex items-center gap-2 h-7 px-3 rounded-[6px] text-[13px] font-mono font-semibold tracking-[0.06em] transition-all cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                )}
                title="Incidents Grid: 85 active incidents requiring triage (NEW or INVESTIGATING) out of 100 alerts"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Incidents Grid</span>
                <span
                  className={cn(
                    'text-[11px] font-mono tabular-nums px-[6px] py-[1px] rounded-[6px]',
                    viewMode === 'grid'
                      ? 'bg-cyan-500/30 text-cyan-200'
                      : 'bg-white/[0.06] text-slate-300'
                  )}
                >
                  {activeIncidents.length}
                </span>
              </button>
            </div>

            {/* Sort Order Button */}
            <button
              type="button"
              onClick={() => setSortBy((prev) => (prev === 'priority' ? 'time' : 'priority'))}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-mono transition-all border border-white/[0.08] hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 bg-white/[0.03] cursor-pointer"
              title="Toggle between Priority ranking and Most Recent timestamp"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Order: <strong className="text-white font-medium">{sortBy === 'priority' ? 'Severity Priority' : 'Most Recent'}</strong></span>
            </button>
          </div>

          {/* Right Ingestion Status */}
          <div
            className="flex items-center gap-2 text-[11px] font-mono text-slate-400 self-start sm:self-center"
            title="Ingestion pipeline synchronized: 100 loaded in active queue · 85 requiring triage · 110 total system-wide"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-medium">Synchronized Ingestion</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300 tabular-nums">{filteredAlerts.length} events active</span>
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
        {/* 4. VIEW: Alert Queue Table (12px gap from View Tabs)          */}
        {/* ───────────────────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <div className="flex flex-col gap-3 min-w-0 w-full max-w-full">
          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-lg animate-pulse"
                  style={{
                    background: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Alert Queue Table */}
          {!isLoading && filteredAlerts.length > 0 && (
            <div
              className="overflow-x-auto w-full max-w-full rounded-xl border border-white/[0.08] bg-[rgba(13,17,23,0.95)] shadow-lg"
              style={{ overflowX: 'auto', width: '100%', maxWidth: '100%' }}
            >
              <Table
                className="w-full text-left text-sm border-collapse min-w-[960px] table-fixed"
                style={{ tableLayout: 'fixed', width: '100%' }}
              >
                <colgroup>
                  <col style={{ width: '110px' }} />
                  <col style={{ width: 'auto', minWidth: '280px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '120px' }} />
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '110px' }} />
                </colgroup>
                <TableHeader className="sticky top-0 z-10 backdrop-blur-md bg-[rgba(13,17,23,0.95)] border-b border-white/[0.08]">
                  <TableRow className="border-b text-[11px] font-mono uppercase tracking-[0.06em] text-slate-400 hover:bg-transparent border-white/[0.08] h-11">
                    <TableHead
                      className="text-center border-r border-white/[0.08] font-semibold text-[11px] font-mono uppercase tracking-[0.06em]"
                      style={{ width: '110px', padding: '0 12px' }}
                    >
                      Severity
                    </TableHead>
                    <TableHead
                      className="font-semibold text-[11px] font-mono uppercase tracking-[0.06em]"
                      style={{ width: 'auto', minWidth: '280px', padding: '0 12px' }}
                    >
                      Incident & Threat Narrative
                    </TableHead>
                    <TableHead
                      className="font-semibold text-[11px] font-mono uppercase tracking-[0.06em]"
                      style={{ width: '150px', padding: '0 12px' }}
                    >
                      Detection Vector
                    </TableHead>
                    <TableHead
                      className="font-semibold text-[11px] font-mono uppercase tracking-[0.06em]"
                      style={{ width: '150px', padding: '0 12px' }}
                    >
                      Source & Origin
                    </TableHead>
                    <TableHead
                      className="text-center font-semibold text-[11px] font-mono uppercase tracking-[0.06em]"
                      style={{ width: '120px', padding: '0 12px' }}
                    >
                      Status
                    </TableHead>
                    <TableHead
                      className="text-right font-semibold text-[11px] font-mono uppercase tracking-[0.06em]"
                      style={{ width: '90px', padding: '0 12px' }}
                    >
                      Risk Score
                    </TableHead>
                    <TableHead
                      className="text-center font-semibold text-[11px] font-mono uppercase tracking-[0.06em]"
                      style={{ width: '110px', padding: '0 12px' }}
                    >
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-white/[0.08]">
                  {filteredAlerts.map((alert) => {
                    const effectiveSev = getEffectiveSeverity(alert);
                    const sevMeta = getSeverityMeta(effectiveSev);
                    const statusChip = statusChipConfig[alert.status] || statusChipConfig.NEW;
                    const isExpanded = expandedId === alert.id;
                    const isSuccess = actionSuccess === alert.id;
                    const isError = actionError === alert.id;
                    const roundedScore = alert.threatScore != null ? Math.round(alert.threatScore) : null;
                    const parsed = parseAlertDescription(alert.description, alert.title, alert.type, alert.sourceIp);

                    return (
                      <Fragment key={alert.id}>
                        <TableRow
                          onClick={() => setExpandedId(isExpanded ? null : alert.id)}
                          className="group cursor-pointer hover:bg-[rgba(34,211,238,0.04)] transition-colors duration-150 h-[64px]"
                          style={{
                            borderLeft: `3px solid ${sevMeta.hex}`,
                            background: isExpanded ? 'rgba(15, 20, 28, 0.98)' : 'transparent',
                          }}
                        >
                          {/* 1. Severity Column (110px) */}
                          <TableCell
                            className="align-middle text-center border-r border-white/[0.08]"
                            style={{ width: '110px', padding: '0 12px' }}
                          >
                            <div className="flex items-center justify-center">
                              <SeverityBadge
                                severity={effectiveSev}
                                threatScore={alert.threatScore}
                              />
                            </div>
                          </TableCell>

                          {/* 2. Incident & Threat Narrative (flexible auto, min 280px) */}
                          <TableCell
                            className="align-middle"
                            style={{ width: 'auto', minWidth: '280px', padding: '0 12px' }}
                          >
                            <div className="min-w-0 w-full overflow-hidden">
                              <div
                                className="font-semibold text-[13px] text-white overflow-hidden text-ellipsis whitespace-nowrap leading-tight"
                                title={alert.title || '—'}
                              >
                                {alert.title || '—'}
                              </div>
                              <div
                                className="text-[12px] text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap mt-0.5 leading-normal"
                                title={parsed.narrative || alert.description || '—'}
                              >
                                {parsed.narrative || alert.description || '—'}
                              </div>
                              <div className="text-[11px] font-mono text-slate-500 mt-0.5 flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                                {alert.assignedTo && (
                                  <span className="flex items-center gap-1 shrink-0">
                                    <User className="w-2.5 h-2.5 text-slate-500" />
                                    <span>{formatAssignee(alert.assignedTo) || '—'}</span>
                                  </span>
                                )}
                                {alert.assignedTo && <span className="text-slate-600 shrink-0">·</span>}
                                <span className="flex items-center gap-1 text-slate-500 shrink-0">
                                  <Clock className="w-2.5 h-2.5 text-slate-500" />
                                  <span>{formatTime(alert.createdAt)}</span>
                                </span>
                              </div>
                            </div>
                          </TableCell>

                          {/* 3. Detection Vector (150px) */}
                          <TableCell
                            className="align-middle"
                            style={{ width: '150px', padding: '0 12px' }}
                          >
                            <div className="min-w-0 w-full overflow-hidden space-y-1">
                              <div
                                className="text-[12px] font-medium text-slate-200 overflow-hidden text-ellipsis whitespace-nowrap"
                                title={formatAlertType(alert.type) || '—'}
                              >
                                {formatAlertType(alert.type) || '—'}
                              </div>
                              {parsed.detector && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                  title={parsed.detector}
                                >
                                  <Shield className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                  <span className="truncate">{parsed.detector}</span>
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* 4. Source & Origin (150px) */}
                          <TableCell
                            className="align-middle"
                            style={{ width: '150px', padding: '0 12px' }}
                          >
                            <div className="min-w-0 w-full overflow-hidden space-y-1">
                              <span
                                className="inline-block font-mono text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 text-[11px] max-w-full overflow-hidden text-ellipsis whitespace-nowrap"
                                title={alert.sourceIp || '—'}
                              >
                                {alert.sourceIp || '—'}
                              </span>
                              {parsed.country && (
                                <div
                                  className="flex items-center gap-1 text-[11px] text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap"
                                  title={parsed.country}
                                >
                                  <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                                  <span className="truncate">{parsed.country}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>

                          {/* 5. Status (120px) */}
                          <TableCell
                            className="align-middle text-center"
                            style={{ width: '120px', padding: '0 12px' }}
                          >
                            <div
                              className="inline-flex items-center justify-center gap-1.5 w-full max-w-full h-[22px] px-2 rounded-[6px] text-[10.5px] font-mono font-medium overflow-hidden text-ellipsis whitespace-nowrap select-none"
                              style={{
                                background: statusChip.bg,
                                border: `1px solid ${statusChip.border}`,
                                color: statusChip.text,
                              }}
                              title={statusChip.label}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: statusChip.dot }}
                              />
                              <span className="truncate whitespace-nowrap">{statusChip.label}</span>
                            </div>
                          </TableCell>

                          {/* 6. Risk Score (90px) */}
                          <TableCell
                            className="align-middle text-right"
                            style={{ width: '90px', padding: '0 12px' }}
                          >
                            <div className="font-mono tabular-nums text-right text-[12px] whitespace-nowrap">
                              <span className="font-bold" style={{ color: sevMeta.varName }}>
                                {roundedScore != null ? roundedScore : '—'}
                              </span>
                              <span className="text-[10px] text-slate-500 font-normal">/100</span>
                            </div>
                          </TableCell>

                          {/* 7. Actions (110px) */}
                          <TableCell
                            className="align-middle text-center"
                            style={{ width: '110px', padding: '0 12px' }}
                          >
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId(isExpanded ? null : alert.id);
                                }}
                                className="inline-flex items-center justify-center gap-1 h-[28px] px-3 rounded-md text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none transition-colors cursor-pointer"
                                title={isExpanded ? 'Collapse incident details' : 'Expand incident details'}
                              >
                                <span>{isExpanded ? 'Close' : 'View ›'}</span>
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Accordion Detail Row */}
                        {isExpanded && (
                          <TableRow
                            className="hover:bg-transparent"
                            style={{
                              background: 'rgba(15, 20, 28, 0.98)',
                              borderLeft: `3px solid ${sevMeta.hex}`,
                            }}
                          >
                            <TableCell colSpan={7} className="p-4 sm:p-5">
                              <div className="space-y-4">
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

                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                                    <Brain className="w-3.5 h-3.5" />
                                    <span>AI Threat Reasoning & Heuristics</span>
                                  </div>
                                  <p className="text-[12.5px] text-slate-300 leading-relaxed font-normal">
                                    {getAiThreatReasoning(alert)}
                                  </p>
                                </div>

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
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredAlerts.length === 0 && (
            <div
              className="p-10 rounded-xl text-center space-y-3"
              style={{
                background: 'rgba(13, 17, 23, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <ShieldAlert className="w-8 h-8 mx-auto text-slate-500" />
              <h3 className="text-sm font-semibold text-white">
                {severityFilter !== 'ALL'
                  ? `No ${severityFilter.toLowerCase()}-severity alerts`
                  : searchQuery
                  ? 'No matching alerts found'
                  : 'No alerts in queue'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                {severityFilter !== 'ALL'
                  ? `There are currently no alerts with ${severityFilter.toLowerCase()} severity level in this view.`
                  : 'No security alerts currently match your active search and filter parameters.'}
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSeverityFilter('ALL');
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12px] font-mono font-semibold text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/40 transition-colors cursor-pointer"
                >
                  Clear filter
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. VIEW: Active Incidents Grid                                */}
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
            <span
              className="text-[11px] font-mono text-slate-400"
              title="85 active incidents (NEW or INVESTIGATING) out of 100 loaded alerts"
            >
              High-priority events requiring immediate triage
            </span>
          </div>

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

          {!isLoading && activeIncidents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeIncidents.map((alert) => {
                const effectiveSev = getEffectiveSeverity(alert);
                const sevMeta = getSeverityMeta(effectiveSev);
                const statusChip = statusChipConfig[alert.status] || statusChipConfig.NEW;
                const isExpanded = expandedId === alert.id;
                const isSuccess = actionSuccess === alert.id;
                const isError = actionError === alert.id;
                const roundedScore = alert.threatScore != null ? Math.round(alert.threatScore) : null;

                return (
                  <div
                    key={alert.id}
                    className="group relative rounded-lg p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 border shadow-lg hover:border-white/[0.22] hover:shadow-cyan-950/20"
                    style={{
                      background: 'rgba(13, 17, 23, 0.96)',
                      borderColor: 'rgba(255, 255, 255, 0.12)',
                      borderLeft: `3px solid ${sevMeta.hex}`,
                    }}
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge
                            severity={effectiveSev}
                            threatScore={alert.threatScore}
                          />
                          <div
                            className="inline-flex items-center justify-center gap-1.5 h-[22px] px-2.5 rounded-[6px] text-[10px] font-mono font-medium"
                            style={{
                              background: statusChip.bg,
                              border: `1px solid ${statusChip.border}`,
                              color: statusChip.text,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: statusChip.dot }}
                            />
                            {statusChip.label}
                          </div>
                        </div>

                        <div
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border shrink-0 font-mono text-[12px]"
                          style={{
                            background: `rgba(${sevMeta.rgb[0]}, ${sevMeta.rgb[1]}, ${sevMeta.rgb[2]}, 0.10)`,
                            borderColor: `rgba(${sevMeta.rgb[0]}, ${sevMeta.rgb[1]}, ${sevMeta.rgb[2]}, 0.35)`,
                          }}
                        >
                          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                            Risk
                          </span>
                          <span
                            className="font-bold tabular-nums"
                            style={{ color: sevMeta.varName }}
                          >
                            {roundedScore != null ? roundedScore : '—'}
                          </span>
                          <span className="text-[10px] text-slate-500">/100</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-[13px] font-semibold text-white tracking-tight line-clamp-1">
                          {alert.title || '—'}
                        </h4>
                        <AlertTelemetryStrip
                          description={alert.description}
                          title={alert.title}
                          alertType={alert.type}
                          sourceIp={alert.sourceIp}
                          mode="compact"
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400 py-2 border-t border-white/[0.08]">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="text-slate-400 whitespace-nowrap">{formatTime(alert.createdAt)}</span>
                          <span className="text-slate-700">•</span>
                          <span className="text-slate-300 truncate">{formatAlertType(alert.type) || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 font-mono text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40 text-[10.5px]">
                          <span>{alert.sourceIp || '—'}</span>
                        </div>
                      </div>
                    </div>

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
    </div>
  );
}
