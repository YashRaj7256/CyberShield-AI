'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
  ArrowUpRight,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { mockAlerts } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { Alert } from '@/types';

const severityConfig: Record<string, { color: string; bg: string; glow: string }> = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', glow: '0 0 20px rgba(239, 68, 68, 0.2)' },
  HIGH: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', glow: 'none' },
  MEDIUM: { color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', glow: 'none' },
  LOW: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', glow: 'none' },
};

const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  NEW: { icon: <Zap className="w-3.5 h-3.5" />, color: '#3b82f6', label: 'New' },
  INVESTIGATING: { icon: <Eye className="w-3.5 h-3.5" />, color: '#eab308', label: 'Investigating' },
  RESOLVED: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: '#22c55e', label: 'Resolved' },
  FALSE_POSITIVE: { icon: <XCircle className="w-3.5 h-3.5" />, color: '#71717a', label: 'False Positive' },
};

const typeIcons: Record<string, string> = {
  BRUTE_FORCE: '🔓',
  MALWARE: '🦠',
  PHISHING: '🎣',
  DATA_EXFILTRATION: '📤',
  DDOS: '🌊',
  UNAUTHORIZED_ACCESS: '🚫',
  ANOMALY: '⚡',
  POLICY_VIOLATION: '📋',
  SUSPICIOUS_LOGIN: '👤',
  PORT_SCAN: '🔍',
  CREDENTIAL_STUFFING: '🔑',
  INSIDER_THREAT: '🕵️',
};

const alertTypeLabels: Record<string, string> = {
  BRUTE_FORCE: 'Authentication Brute Force',
  SUSPICIOUS_LOGIN: 'Suspicious Login',
  PORT_SCAN: 'Port Scanning',
  DDOS: 'DDoS',
  MALWARE: 'Malware',
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

function formatAssignee(assignedTo: Alert['assignedTo']): string | null {
  if (!assignedTo) return null;
  if (typeof assignedTo === 'object') {
    const fullName = `${assignedTo.firstName || ''} ${assignedTo.lastName || ''}`.trim();
    return fullName || assignedTo.email || assignedTo.id || 'Assigned';
  }
  return String(assignedTo);
}

export default function AlertsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [alertsResult, statsResult] = await Promise.all([
        // Backend returns { alerts: [...], pagination: { total, page, limit, totalPages } }
        api.get<{
          alerts: Alert[];
          pagination: { total: number; page: number; limit: number; totalPages: number };
        }>('/alerts', {
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          page: 1,
          limit: 50,
        }),
        // Backend returns { total, bySeverity, byStatus: [{status, count}], byType, recentAlerts, averageThreatScore }
        api.get<{
          total: number;
          byStatus: { status: string; count: number }[];
        }>('/alerts/stats'),
      ]);

      // Normalise alerts list — backend uses { alerts, pagination }
      const alertData = Array.isArray(alertsResult)
        ? alertsResult
        : Array.isArray((alertsResult as { alerts?: Alert[] }).alerts)
          ? (alertsResult as { alerts: Alert[] }).alerts
          : [];
      setAlerts(alertData);

      // Normalise status counts — backend returns byStatus as an array of {status, count}
      const byStatusArray = Array.isArray(statsResult.byStatus) ? statsResult.byStatus : [];
      const counts: Record<string, number> = {};
      for (const item of byStatusArray) {
        counts[item.status] = item.count;
      }
      setStatusCounts({
        NEW: counts.NEW ?? 0,
        INVESTIGATING: counts.INVESTIGATING ?? 0,
        RESOLVED: counts.RESOLVED ?? 0,
        FALSE_POSITIVE: counts.FALSE_POSITIVE ?? 0,
      });
      setIsDemo(false);
    } catch {
      // Fallback to mock data
      setAlerts(mockAlerts);
      setStatusCounts({
        NEW: mockAlerts.filter((a) => a.status === 'NEW').length,
        INVESTIGATING: mockAlerts.filter((a) => a.status === 'INVESTIGATING').length,
        RESOLVED: mockAlerts.filter((a) => a.status === 'RESOLVED').length,
        FALSE_POSITIVE: mockAlerts.filter((a) => a.status === 'FALSE_POSITIVE').length,
      });
      setIsDemo(true);
    } finally {
      setIsLoading(false);
    }
  }, [severityFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Wire action buttons
  const handleAlertAction = async (alertId: string, newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const prevAlerts = [...alerts];
    const prevCounts = { ...statusCounts };

    // Optimistic update — alert status
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: newStatus as Alert['status'] } : a))
    );

    // Optimistic update — status counts
    const oldAlert = alerts.find((a) => a.id === alertId);
    if (oldAlert) {
      setStatusCounts((prev) => ({
        ...prev,
        [oldAlert.status]: Math.max(0, (prev[oldAlert.status] ?? 0) - 1),
        [newStatus]: (prev[newStatus] ?? 0) + 1,
      }));
    }

    try {
      await api.patch(`/alerts/${alertId}`, { status: newStatus });

      // Refetch real stats from server
      try {
        const stats = await api.get<{ byStatus: { status: string; count: number }[] }>('/alerts/stats');
        const byStatusArray = Array.isArray(stats.byStatus) ? stats.byStatus : [];
        const counts: Record<string, number> = {};
        for (const item of byStatusArray) counts[item.status] = item.count;
        setStatusCounts({
          NEW: counts.NEW ?? 0,
          INVESTIGATING: counts.INVESTIGATING ?? 0,
          RESOLVED: counts.RESOLVED ?? 0,
          FALSE_POSITIVE: counts.FALSE_POSITIVE ?? 0,
        });
      } catch {
        // Keep optimistic counts if stats refetch fails
      }

      // Show success
      setActionSuccess(alertId);
      setTimeout(() => setActionSuccess(null), 1500);
    } catch {
      // Revert on failure
      setAlerts(prevAlerts);
      setStatusCounts(prevCounts);
      setActionError(alertId);
      setTimeout(() => setActionError(null), 3000);
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
      const matchesSearch =
        !searchQuery ||
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.sourceIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
  }, [alerts, severityFilter, searchQuery]);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // ---- Skeleton card component ----
  const SkeletonCard = () => (
    <div className="glass-card-sm overflow-hidden" style={{ opacity: 0.7 }}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="flex">
        <div
          className="w-1 shrink-0"
          style={{
            background: 'linear-gradient(90deg, #1a1a24 25%, #2a2a3a 50%, #1a1a24 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {/* Icon placeholder */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #1a1a24 25%, #222230 50%, #1a1a24 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                {/* Title */}
                <div
                  style={{
                    height: 14,
                    width: '60%',
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #1a1a24 25%, #222230 50%, #1a1a24 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    marginBottom: 8,
                  }}
                />
                {/* Description */}
                <div
                  style={{
                    height: 10,
                    width: '85%',
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #1a1a24 25%, #222230 50%, #1a1a24 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    marginBottom: 12,
                  }}
                />
                {/* Badges row */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {[50, 70, 60].map((w, i) => (
                    <div
                      key={i}
                      style={{
                        height: 18,
                        width: w,
                        borderRadius: 9,
                        background: 'linear-gradient(90deg, #1a1a24 25%, #222230 50%, #1a1a24 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Score placeholder */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(90deg, #1a1a24 25%, #222230 50%, #1a1a24 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
          >
            <ShieldAlert className="w-5 h-5" style={{ color: '#ef4444' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="text-xl font-bold" style={{ color: '#e4e4e7' }}>Security Alerts</h1>
              {/* DEMO / LIVE badge */}
              {isDemo ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#f59e0b',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  DEMO
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(34, 197, 94, 0.15)',
                    color: '#22c55e',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#22c55e',
                      display: 'inline-block',
                      animation: 'pulse 2s infinite',
                      boxShadow: '0 0 6px rgba(34, 197, 94, 0.6)',
                    }}
                  />
                  LIVE
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: '#71717a' }}>
              {isLoading ? 'Loading alerts...' : `${filteredAlerts.length} alerts · ${statusCounts.NEW ?? 0} require attention`}
            </p>
          </div>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div
            key={key}
            className="glass-card-sm p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 stat-card-hover"
            style={{
              borderColor: severityFilter === key ? config.color : undefined,
            }}
            onClick={() => setSeverityFilter(severityFilter === key ? 'ALL' : key)}
          >
            <div
              className="p-2 rounded-lg"
              style={{ background: `${config.color}15`, color: config.color }}
            >
              {config.icon}
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#e4e4e7' }}>
                {statusCounts[key as keyof typeof statusCounts] ?? 0}
              </p>
              <p className="text-xs" style={{ color: '#71717a' }}>{config.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px] max-w-[400px]"
          style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}
        >
          <Search className="w-4 h-4" style={{ color: '#71717a' }} />
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm flex-1"
            style={{ color: '#e4e4e7' }}
          />
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#111118', border: '1px solid #2a2a3a' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
            const isActive = severityFilter === sev;
            const sevColor = sev === 'ALL' ? '#06b6d4' : severityConfig[sev]?.color;
            return (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                style={{
                  background: isActive ? `${sevColor}15` : 'transparent',
                  color: isActive ? sevColor : '#71717a',
                  border: isActive ? `1px solid ${sevColor}30` : '1px solid transparent',
                }}
              >
                {sev === 'ALL' ? 'All' : sev.charAt(0) + sev.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error State */}
      {fetchError && (
        <div
          className="glass-card p-6 text-center animate-fade-in"
          style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: '#ef4444' }} />
          <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
            Failed to load alerts
          </p>
          <p className="text-xs mt-1 mb-4" style={{ color: '#71717a' }}>{fetchError}</p>
          <button
            onClick={fetchAlerts}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: 'rgba(6, 182, 212, 0.1)',
              color: '#06b6d4',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            <RefreshCw className="w-3 h-3 inline mr-1.5" />
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Alert Cards */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredAlerts.map((alert) => {
            const sev = severityConfig[alert.severity] || severityConfig.LOW;
            const status = statusConfig[alert.status] || statusConfig.NEW;
            const isExpanded = expandedId === alert.id;
            const isSuccess = actionSuccess === alert.id;
            const isError = actionError === alert.id;

            return (
              <div
                key={alert.id}
                className="glass-card-sm overflow-hidden transition-all duration-200 stat-card-hover cursor-pointer"
                style={{ boxShadow: alert.severity === 'CRITICAL' ? sev.glow : 'none' }}
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              >
                <div className="flex">
                  {/* Severity Stripe */}
                  <div className="w-1 shrink-0" style={{ background: sev.color }} />

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-xl shrink-0 mt-0.5">{typeIcons[alert.type] || '⚠️'}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold truncate" style={{ color: '#e4e4e7' }}>
                              {alert.title}
                            </h3>
                            {alert.severity === 'CRITICAL' && (
                              <span className="animate-pulse-slow text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: sev.bg, color: sev.color }}>
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-1 line-clamp-1" style={{ color: '#a1a1aa' }}>
                            {alert.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span
                              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.25)' }}
                            >
                              {typeIcons[alert.type] || '⚠️'} {formatAlertType(alert.type)}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: sev.bg, color: sev.color }}>
                              {alert.severity}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: `${status.color}15`, color: status.color }}>
                              {status.icon} {status.label}
                            </span>
                            <span className="text-[10px]" style={{ color: '#71717a' }}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatTime(alert.createdAt)}
                            </span>
                            <span className="text-[10px]" style={{ color: '#71717a' }}>
                              {alert.sourceIp}
                            </span>
                            {formatAssignee(alert.assignedTo) && (
                              <span className="text-[10px]" style={{ color: '#06b6d4' }}>
                                → {formatAssignee(alert.assignedTo)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Threat Score */}
                        <div className="text-center">
                          <div
                            className="text-lg font-bold"
                            style={{
                              color: alert.threatScore >= 80 ? '#ef4444' : alert.threatScore >= 60 ? '#f97316' : alert.threatScore >= 40 ? '#eab308' : '#22c55e',
                            }}
                          >
                            {alert.threatScore}
                          </div>
                          <div className="text-[10px]" style={{ color: '#71717a' }}>score</div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" style={{ color: '#71717a' }} />
                        ) : (
                          <ChevronDown className="w-4 h-4" style={{ color: '#71717a' }} />
                        )}
                      </div>
                    </div>

                    {/* Expanded AI Explanation */}
                    {isExpanded && (
                      <div
                        className="mt-4 pt-4 animate-fade-in"
                        style={{ borderTop: '1px solid #2a2a3a' }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="w-4 h-4" style={{ color: '#8b5cf6' }} />
                          <span className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>
                            AI Threat Analysis & Classification
                          </span>
                        </div>
                        <p className="text-xs mb-3" style={{ color: '#a1a1aa' }}>
                          {alert.aiExplanation || `${formatAlertType(alert.type)} incident detected from ${alert.sourceIp}. ${alert.description}`}
                        </p>
                        <div className="space-y-1.5">
                          {Array.isArray(alert.reasons) &&
                            alert.reasons.map((reason: unknown, idx: number) => (
                              <div key={idx} className="flex items-start gap-2">
                                <ArrowUpRight className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#f97316' }} />
                                <span className="text-xs" style={{ color: '#a1a1aa' }}>
                                  {typeof reason === 'string' ? reason : JSON.stringify(reason)}
                                </span>
                              </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 mt-4">
                          {/* Success / Error feedback */}
                          {isSuccess && (
                            <span
                              className="text-xs font-semibold animate-fade-in"
                              style={{ color: '#22c55e', marginRight: 4 }}
                            >
                              ✓ Done
                            </span>
                          )}
                          {isError && (
                            <span
                              className="text-xs font-semibold animate-fade-in"
                              style={{ color: '#ef4444', marginRight: 4 }}
                            >
                              ✗ Action failed
                            </span>
                          )}

                          {!isSuccess && (
                            <>
                              <button
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                                onClick={(e) => handleAlertAction(alert.id, 'RESOLVED', e)}
                              >
                                <CheckCircle className="w-3 h-3 inline mr-1" /> Resolve
                              </button>
                              <button
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.2)' }}
                                onClick={(e) => handleAlertAction(alert.id, 'INVESTIGATING', e)}
                              >
                                <Eye className="w-3 h-3 inline mr-1" /> Investigate
                              </button>
                              <button
                                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                                style={{ background: 'rgba(113, 113, 122, 0.1)', color: '#71717a', border: '1px solid rgba(113, 113, 122, 0.2)' }}
                                onClick={(e) => handleAlertAction(alert.id, 'FALSE_POSITIVE', e)}
                              >
                                <XCircle className="w-3 h-3 inline mr-1" /> False Positive
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && filteredAlerts.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Filter className="w-10 h-10 mx-auto mb-3" style={{ color: '#71717a' }} />
          <p className="text-sm font-medium" style={{ color: '#a1a1aa' }}>No alerts match your filters</p>
          <p className="text-xs mt-1" style={{ color: '#71717a' }}>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
