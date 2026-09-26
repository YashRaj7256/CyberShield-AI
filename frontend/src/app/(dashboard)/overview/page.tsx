'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ScrollText,
  Bell,
  AlertTriangle,
  Users,
  ShieldBan,
  Gauge,
  FlaskConical,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Database,
  Cpu,
} from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import ThreatTrendChart from '@/components/charts/threat-trend-chart';
import SeverityDistributionChart from '@/components/charts/severity-distribution-chart';
import AttackFrequencyChart from '@/components/charts/attack-frequency-chart';
import TopSourcesChart from '@/components/charts/top-sources-chart';
import RecentActivity from '@/components/dashboard/recent-activity';
import { useApi } from '@/hooks/use-api';
import telemetryStore from '@/lib/telemetry-store';
import { parseAlertDescription } from '@/lib/alert-parser';
import {
  mockDashboardStats,
  mockThreatTrend,
  mockSeverityDistribution,
  mockAttackFrequency,
  mockTopSources,
  mockRecentActivity,
} from '@/lib/mock-data';
import type {
  DashboardStats,
  ThreatTrendPoint,
  SeverityDistribution,
  AttackFrequency,
  TopSource,
  RecentActivity as RecentActivityType,
  LogSeverity,
} from '@/types';

// ---------------------------------------------------------------------------
// Raw backend response shapes
// ---------------------------------------------------------------------------

interface RawStats {
  totalLogs: number;
  logsLast24h: number;
  totalAlerts: number;
  alertsLast24h: number;
  activeAlerts: number;
  criticalAlerts: number;
  totalUsers: number;
  blockedIps: number;
  totalThreatScores: number;
  averageThreatScore: number;
}

interface RawThreatTrendPoint {
  date: string;
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
  total: number;
}

interface RawSeverityItem {
  severity: string;
  count: number;
  percentage: number;
}

interface RawAttackFreqItem {
  eventType: string;
  count: number;
  avgThreatScore: number;
}

interface RawTopSourcesResponse {
  topIps: {
    sourceIp: string;
    count: number;
    country: string | null;
    lastSeen: string;
    avgThreatScore: number;
  }[];
  topCountries: {
    country: string;
    totalEvents: number;
    maliciousEvents: number;
  }[];
}

interface RawRecentActivityResponse {
  recentLogs: {
    _id: string;
    timestamp: string;
    eventType: string;
    severity: string;
    message: string;
    sourceIp: string;
  }[];
  recentAlerts: {
    id: string;
    createdAt: string;
    title?: string;
    type: string;
    severity: string;
    description: string;
    sourceIp: string;
  }[];
}

// ---------------------------------------------------------------------------
// Transform functions — unchanged from original
// ---------------------------------------------------------------------------

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

function transformStats(raw: RawStats): DashboardStats {
  return {
    totalLogs: raw.totalLogs,
    totalAlerts: raw.totalAlerts,
    criticalAlerts: raw.criticalAlerts,
    highRiskUsers: 0,
    blockedIps: raw.blockedIps,
    avgThreatScore: raw.averageThreatScore,
  };
}

function transformThreatTrend(raw: RawThreatTrendPoint[]): ThreatTrendPoint[] {
  return raw.map((item) => ({
    date: item.date,
    threats: (item.HIGH ?? 0) + (item.CRITICAL ?? 0),
    blocked: item.total - (item.LOW ?? 0),
    allowed: item.LOW ?? 0,
  }));
}

function transformSeverityDistribution(raw: RawSeverityItem[]): SeverityDistribution[] {
  return raw.map((item) => ({
    name: item.severity.charAt(0) + item.severity.slice(1).toLowerCase(),
    value: item.count,
    color: SEVERITY_COLORS[item.severity] ?? '#71717a',
  }));
}

function transformAttackFrequency(raw: RawAttackFreqItem[]): AttackFrequency[] {
  const buckets: AttackFrequency = {
    date: new Date().toISOString().split('T')[0],
    bruteForce: 0,
    malware: 0,
    phishing: 0,
    ddos: 0,
    other: 0,
  };

  for (const item of raw) {
    const et = (item.eventType ?? '').toUpperCase();
    if (et.includes('BRUTE') || et.includes('SSH') || et.includes('LOGIN')) {
      buckets.bruteForce += item.count;
    } else if (et.includes('MALWARE') || et.includes('VIRUS') || et.includes('RANSOMWARE')) {
      buckets.malware += item.count;
    } else if (et.includes('PHISH') || et.includes('SPOOF')) {
      buckets.phishing += item.count;
    } else if (et.includes('DDOS') || et.includes('DOS') || et.includes('FLOOD')) {
      buckets.ddos += item.count;
    } else {
      buckets.other += item.count;
    }
  }

  return [buckets];
}

function transformTopSources(raw: RawTopSourcesResponse): TopSource[] {
  return raw.topIps.map((ip) => {
    let threatLevel: LogSeverity = 'LOW';
    if (ip.avgThreatScore >= 80) threatLevel = 'CRITICAL';
    else if (ip.avgThreatScore >= 60) threatLevel = 'HIGH';
    else if (ip.avgThreatScore >= 40) threatLevel = 'MEDIUM';

    return {
      ip: ip.sourceIp,
      country: ip.country ?? 'GLOBAL',
      count: ip.count,
      threatLevel,
    };
  });
}

function transformRecentActivity(raw: RawRecentActivityResponse): RecentActivityType[] {
  const logs: RecentActivityType[] = (raw.recentLogs ?? []).map((log) => ({
    id: String(log._id),
    timestamp: log.timestamp,
    type: log.eventType ?? 'ANOMALY',
    severity: (log.severity as LogSeverity) ?? 'LOW',
    message: log.message ?? '',
    sourceIp: log.sourceIp ?? '',
  }));

  const alerts: RecentActivityType[] = (raw.recentAlerts ?? []).map((alert) => ({
    id: alert.id,
    timestamp: alert.createdAt,
    type: alert.type ?? 'ANOMALY',
    severity: (alert.severity as LogSeverity) ?? 'LOW',
    message: parseAlertDescription(alert.description, alert.title, alert.type, alert.sourceIp).narrative,
    sourceIp: alert.sourceIp ?? '',
  }));

  return [...logs, ...alerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ isUsingFallback, isLoading }: { isUsingFallback: boolean; isLoading: boolean }) {
  if (isLoading) return null;

  if (isUsingFallback) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-amber-950/40 text-amber-400 border border-amber-800/50">
        <FlaskConical className="w-3 h-3" />
        SANDBOX MODE
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      LIVE TELEMETRY
    </span>
  );
}

function StatCardSkeleton() {
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        padding: '20px',
        minHeight: '176px',
        background: 'rgba(13, 17, 23, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-slate-800/80" />
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="h-3.5 w-28 rounded-md animate-pulse bg-slate-800" />
        <div className="w-7 h-7 rounded-lg animate-pulse bg-slate-800 shrink-0" />
      </div>
      {/* Value */}
      <div className="h-8 w-24 rounded-lg animate-pulse my-4 bg-slate-800" />
      {/* Footer */}
      <div
        className="flex items-center gap-2 pt-3 border-t mt-auto"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="h-4 w-14 rounded animate-pulse bg-slate-800" />
        <div className="h-3 w-10 rounded animate-pulse bg-slate-800" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// System status pill
// ---------------------------------------------------------------------------

function StatusPill({ label, value, online = true }: { label: string; value: string; online?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: online ? '#34d399' : '#f87171',
        }}
      />
      <span className="text-[11px] font-mono text-slate-500">{label}:</span>
      <span className="text-[11px] font-mono font-medium text-slate-300">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OverviewPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [telemetryVersion, setTelemetryVersion] = useState(0);

  // Listen for local telemetry updates (e.g. log uploaded from logs page)
  useEffect(() => {
    const handleUpdate = () => setTelemetryVersion((v) => v + 1);
    window.addEventListener('telemetry-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('telemetry-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // ── API calls — ALL UNCHANGED ────────────────────────────────────────────
  const rawStats        = useApi<RawStats>('/dashboard/stats', undefined, { fallbackData: undefined });
  const rawThreatTrend  = useApi<RawThreatTrendPoint[]>('/dashboard/threat-trends', undefined, { fallbackData: undefined });
  const rawSeverity     = useApi<RawSeverityItem[]>('/dashboard/severity-distribution', undefined, { fallbackData: undefined });
  const rawAttackFreq   = useApi<RawAttackFreqItem[]>('/dashboard/attack-frequency', undefined, { fallbackData: undefined });
  const rawTopSources   = useApi<RawTopSourcesResponse>('/dashboard/top-sources', undefined, { fallbackData: undefined });
  const rawRecentActivity = useApi<RawRecentActivityResponse>('/dashboard/recent-activity', undefined, { fallbackData: undefined });

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    rawStats.refetch();
    rawThreatTrend.refetch();
    rawSeverity.refetch();
    rawAttackFreq.refetch();
    rawTopSources.refetch();
    rawRecentActivity.refetch();
    setTelemetryVersion((v) => v + 1);
    setTimeout(() => setIsRefreshing(false), 700);
  };

  // ── Data transforms — ALL UNCHANGED ─────────────────────────────────────
  const baseStats: DashboardStats = rawStats.data
    ? transformStats(rawStats.data)
    : mockDashboardStats;

  const statsData: DashboardStats = telemetryStore.getSynchronizedStats(baseStats);

  const threatTrendData: ThreatTrendPoint[] = rawThreatTrend.data
    ? transformThreatTrend(rawThreatTrend.data)
    : mockThreatTrend;

  const baseSeverity: SeverityDistribution[] = rawSeverity.data
    ? transformSeverityDistribution(rawSeverity.data)
    : mockSeverityDistribution;

  const severityData: SeverityDistribution[] = telemetryStore.getSynchronizedSeverityDistribution(baseSeverity);

  const attackFreqData: AttackFrequency[] = rawAttackFreq.data
    ? transformAttackFrequency(rawAttackFreq.data)
    : mockAttackFrequency;

  const baseTopSources: TopSource[] = rawTopSources.data
    ? transformTopSources(rawTopSources.data)
    : mockTopSources;

  const topSourcesData: TopSource[] = telemetryStore.getSynchronizedTopSources(baseTopSources);

  const baseRecentActivity: RecentActivityType[] = rawRecentActivity.data
    ? transformRecentActivity(rawRecentActivity.data)
    : mockRecentActivity;

  const recentActivityData: RecentActivityType[] = telemetryStore.getSynchronizedRecentActivity(baseRecentActivity);

  const anyFallback =
    rawStats.isUsingFallback ||
    rawThreatTrend.isUsingFallback ||
    rawSeverity.isUsingFallback ||
    rawAttackFreq.isUsingFallback ||
    rawTopSources.isUsingFallback ||
    rawRecentActivity.isUsingFallback ||
    !rawStats.data ||
    !rawThreatTrend.data ||
    !rawSeverity.data ||
    !rawAttackFreq.data ||
    !rawTopSources.data ||
    !rawRecentActivity.data;

  const allLoading =
    rawStats.isLoading &&
    rawThreatTrend.isLoading &&
    rawSeverity.isLoading &&
    rawAttackFreq.isLoading &&
    rawTopSources.isLoading &&
    rawRecentActivity.isLoading;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-7 animate-fade-in">

      {/* ================================================================= */}
      {/* 1. SOC COMMAND HEADER                                              */}
      {/* ================================================================= */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          padding: '20px 24px',
          background: 'rgba(13, 17, 23, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        {/* Top accent — subtle 1px line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/50 via-blue-500/30 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

          {/* Left: brand + status */}
          <div>
            {/* Title row */}
            <div className="flex items-center gap-3 mb-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(6,182,212,0.08)',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-[16px] font-semibold text-white tracking-tight">
                    Security Operations Center
                  </h2>
                  <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/30">
                    ENCLAVE-01
                  </span>
                </div>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Unified threat intelligence, perimeter mitigation & incident telemetry
                </p>
              </div>
            </div>

            {/* System status row */}
            <div
              className="flex flex-wrap items-center gap-4 pt-2.5 mt-1"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <StatusPill label="Defense Posture" value="Optimal" online={true} />
              <StatusPill label="Ingestion" value="Active" online={true} />
              <StatusPill label="Detection Engine" value="CyberShield AI v2.4" online={true} />
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <StatusBadge isUsingFallback={anyFallback} isLoading={allLoading} />

            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-mono font-medium transition-all cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
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
              title="Sync telemetry"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Sync</span>
            </button>

            <Link
              href="/alerts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-mono font-medium transition-all"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Alerts ({statsData.criticalAlerts})</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. KPI CARDS — 3 × 2 responsive grid                              */}
      {/* ================================================================= */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-3 h-3 text-slate-500" />
          <span className="text-[11px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-400">
            Key Performance Indicators
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {rawStats.isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Ingested Telemetry Logs"
                value={statsData.totalLogs}
                icon={<ScrollText className="w-4 h-4" />}
                change={12.5}
                accentColor="#06b6d4"
              />
              <StatCard
                label="Active Triage Incidents"
                value={statsData.totalAlerts}
                icon={<Bell className="w-4 h-4" />}
                change={8.3}
                accentColor="#f59e0b"
              />
              <StatCard
                label="Critical Threat Alerts"
                value={statsData.criticalAlerts}
                icon={<AlertTriangle className="w-4 h-4" />}
                change={-15.2}
                accentColor="#ef4444"
                pulse={statsData.criticalAlerts > 0}
              />
              <StatCard
                label="High Risk Identities"
                value={statsData.highRiskUsers}
                icon={<Users className="w-4 h-4" />}
                change={3.7}
                accentColor="#f97316"
              />
              <StatCard
                label="Perimeter Blocked Nodes"
                value={statsData.blockedIps}
                icon={<ShieldBan className="w-4 h-4" />}
                change={22.1}
                accentColor="#a855f7"
              />
              <StatCard
                label="Threat Risk Posture"
                value={statsData.avgThreatScore}
                icon={<Gauge className="w-4 h-4" />}
                change={-5.4}
                accentColor="#38bdf8"
                format="score"
                suffix="/100"
                sublabel={
                  statsData.avgThreatScore >= 70
                    ? 'Elevated'
                    : statsData.avgThreatScore >= 40
                    ? 'Guarded'
                    : 'Low Risk'
                }
              />
            </>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. PRIMARY THREAT INTELLIGENCE — trend + severity                 */}
      {/* ================================================================= */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cpu className="w-3 h-3 text-slate-500" />
          <span className="text-[11px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-400">
            Threat Intelligence
          </span>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3.5 items-stretch">
          <div className="xl:col-span-2 min-w-0">
            <ThreatTrendChart data={threatTrendData} isLoading={rawThreatTrend.isLoading} />
          </div>
          <div className="min-w-0">
            <SeverityDistributionChart data={severityData} isLoading={rawSeverity.isLoading} />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. ATTACK VECTORS & GEOGRAPHIC SOURCES                            */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3.5 items-stretch">
        <div className="min-w-0">
          <AttackFrequencyChart data={attackFreqData} isLoading={rawAttackFreq.isLoading} />
        </div>
        <div className="min-w-0">
          <TopSourcesChart data={topSourcesData} isLoading={rawTopSources.isLoading} />
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5. LIVE TELEMETRY STREAM                                          */}
      {/* ================================================================= */}
      <div className="min-w-0">
        <RecentActivity data={recentActivityData} isLoading={rawRecentActivity.isLoading} />
      </div>
    </div>
  );
}
