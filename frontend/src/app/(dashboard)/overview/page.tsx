'use client';

import {
  ScrollText,
  Bell,
  AlertTriangle,
  Users,
  ShieldBan,
  Gauge,
  Radio,
  FlaskConical,
} from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import ThreatTrendChart from '@/components/charts/threat-trend-chart';
import SeverityDistributionChart from '@/components/charts/severity-distribution-chart';
import AttackFrequencyChart from '@/components/charts/attack-frequency-chart';
import TopSourcesChart from '@/components/charts/top-sources-chart';
import RecentActivity from '@/components/dashboard/recent-activity';
import { useApi } from '@/hooks/use-api';
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
// Raw backend response shapes (as returned by the API — different from the
// frontend component types above).
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

/** /dashboard/threat-trends returns per-day rows with per-severity counts */
interface RawThreatTrendPoint {
  date: string;
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
  total: number;
}

/** /dashboard/severity-distribution returns {severity, count, percentage} */
interface RawSeverityItem {
  severity: string;
  count: number;
  percentage: number;
}

/** /dashboard/attack-frequency returns per-eventType rows */
interface RawAttackFreqItem {
  eventType: string;
  count: number;
  avgThreatScore: number;
}

/** /dashboard/top-sources returns an object with two sub-arrays */
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

/** /dashboard/recent-activity returns {recentLogs, recentAlerts} */
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
    type: string;
    severity: string;
    description: string;
    sourceIp: string;
  }[];
}

// ---------------------------------------------------------------------------
// Transform functions — map backend shapes → component-expected shapes
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
    // backend has no highRiskUsers field — fall back to 0
    highRiskUsers: 0,
    blockedIps: raw.blockedIps,
    avgThreatScore: raw.averageThreatScore,
  };
}

function transformThreatTrend(raw: RawThreatTrendPoint[]): ThreatTrendPoint[] {
  return raw.map((item) => ({
    date: item.date,
    // "threats" = HIGH + CRITICAL counts
    threats: (item.HIGH ?? 0) + (item.CRITICAL ?? 0),
    // "blocked" = total minus LOW (i.e. everything that triggered action)
    blocked: item.total - (item.LOW ?? 0),
    // "allowed" = LOW-severity events (least dangerous)
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

/**
 * The backend attack-frequency endpoint returns one row per *event type*, not
 * one row per *day*. The AttackFrequencyChart expects daily bars with bucketed
 * attack-type columns. Since the backend doesn't expose that breakdown, we map
 * event types to the nearest bucket and build a synthetic single-day row so
 * the chart still renders real data instead of crashing.
 */
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
    // Infer threat level from avgThreatScore
    let threatLevel: LogSeverity = 'LOW';
    if (ip.avgThreatScore >= 80) threatLevel = 'CRITICAL';
    else if (ip.avgThreatScore >= 60) threatLevel = 'HIGH';
    else if (ip.avgThreatScore >= 40) threatLevel = 'MEDIUM';

    return {
      ip: ip.sourceIp,
      country: ip.country ?? 'Unknown',
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
    message: alert.description ?? '',
    sourceIp: alert.sourceIp ?? '',
  }));

  // Merge and sort by timestamp desc, take top 20
  return [...logs, ...alerts]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);
}

function StatusBadge({ isUsingFallback, isLoading }: { isUsingFallback: boolean; isLoading: boolean }) {
  if (isLoading) return null;

  if (isUsingFallback) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
        style={{
          background: 'rgba(234, 179, 8, 0.1)',
          color: '#eab308',
          border: '1px solid rgba(234, 179, 8, 0.2)',
        }}
      >
        <FlaskConical className="w-3 h-3" />
        DEMO
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{
        background: 'rgba(34, 197, 94, 0.1)',
        color: '#22c55e',
        border: '1px solid rgba(34, 197, 94, 0.2)',
      }}
    >
      <Radio className="w-3 h-3" />
      LIVE
    </span>
  );
}

function StatCardSkeleton() {
  return (
    <div
      className="glass-card-sm p-4 sm:p-4.5 xl:p-5 relative overflow-hidden flex flex-col justify-between min-w-0"
      style={{ borderLeft: '3px solid rgba(42, 42, 58, 0.5)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className="h-3 w-20 rounded animate-pulse"
          style={{ background: 'rgba(26, 26, 36, 0.6)' }}
        />
        <div
          className="w-8 h-8 rounded-xl animate-pulse shrink-0"
          style={{ background: 'rgba(26, 26, 36, 0.6)' }}
        />
      </div>
      <div
        className="h-7 w-24 rounded animate-pulse my-1"
        style={{ background: 'rgba(26, 26, 36, 0.6)' }}
      />
      <div
        className="h-3 w-28 rounded animate-pulse mt-2"
        style={{ background: 'rgba(26, 26, 36, 0.6)' }}
      />
    </div>
  );
}

export default function OverviewPage() {
  // Fetch with raw backend types, then transform before passing to components.
  const rawStats = useApi<RawStats>('/dashboard/stats', undefined, {
    fallbackData: undefined,
  });
  const rawThreatTrend = useApi<RawThreatTrendPoint[]>('/dashboard/threat-trends', undefined, {
    fallbackData: undefined,
  });
  const rawSeverity = useApi<RawSeverityItem[]>('/dashboard/severity-distribution', undefined, {
    fallbackData: undefined,
  });
  const rawAttackFreq = useApi<RawAttackFreqItem[]>('/dashboard/attack-frequency', undefined, {
    fallbackData: undefined,
  });
  const rawTopSources = useApi<RawTopSourcesResponse>('/dashboard/top-sources', undefined, {
    fallbackData: undefined,
  });
  const rawRecentActivity = useApi<RawRecentActivityResponse>('/dashboard/recent-activity', undefined, {
    fallbackData: undefined,
  });

  // Transform API responses → component-expected shapes, fall back to mocks on error.
  const statsData: DashboardStats = rawStats.data
    ? transformStats(rawStats.data)
    : mockDashboardStats;

  const threatTrendData: ThreatTrendPoint[] = rawThreatTrend.data
    ? transformThreatTrend(rawThreatTrend.data)
    : mockThreatTrend;

  const severityData: SeverityDistribution[] = rawSeverity.data
    ? transformSeverityDistribution(rawSeverity.data)
    : mockSeverityDistribution;

  const attackFreqData: AttackFrequency[] = rawAttackFreq.data
    ? transformAttackFrequency(rawAttackFreq.data)
    : mockAttackFrequency;

  const topSourcesData: TopSource[] = rawTopSources.data
    ? transformTopSources(rawTopSources.data)
    : mockTopSources;

  const recentActivityData: RecentActivityType[] = rawRecentActivity.data
    ? transformRecentActivity(rawRecentActivity.data)
    : mockRecentActivity;

  // Determine global fallback status — if any endpoint fell back, show DEMO
  const anyFallback =
    rawStats.isUsingFallback ||
    rawThreatTrend.isUsingFallback ||
    rawSeverity.isUsingFallback ||
    rawAttackFreq.isUsingFallback ||
    rawTopSources.isUsingFallback ||
    rawRecentActivity.isUsingFallback ||
    // Also show DEMO when data is null (error without fallback) for any endpoint
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header with status badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Security Intelligence Console
          </h2>
          <StatusBadge isUsingFallback={anyFallback} isLoading={allLoading} />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Zero-Trust SOC Feed
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        {rawStats.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Logs"
              value={statsData.totalLogs}
              icon={<ScrollText className="w-4 h-4 sm:w-5 sm:h-5" />}
              change={12.5}
              accentColor="#06b6d4"
            />
            <StatCard
              label="Active Alerts"
              value={statsData.totalAlerts}
              icon={<Bell className="w-4 h-4 sm:w-5 sm:h-5" />}
              change={8.3}
              accentColor="#eab308"
            />
            <StatCard
              label="Critical Alerts"
              value={statsData.criticalAlerts}
              icon={<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />}
              change={-15.2}
              accentColor="#ef4444"
              pulse
            />
            <StatCard
              label="High Risk Users"
              value={statsData.highRiskUsers}
              icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />}
              change={3.7}
              accentColor="#f97316"
            />
            <StatCard
              label="Blocked IPs"
              value={statsData.blockedIps}
              icon={<ShieldBan className="w-4 h-4 sm:w-5 sm:h-5" />}
              change={22.1}
              accentColor="#8b5cf6"
            />
            <StatCard
              label="Threat Score"
              value={statsData.avgThreatScore}
              icon={<Gauge className="w-4 h-4 sm:w-5 sm:h-5" />}
              change={-5.4}
              accentColor="#3b82f6"
              format="score"
              suffix="/100"
            />
          </>
        )}
      </div>

      {/* Charts Row 1: Trend + Severity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-w-0">
          <ThreatTrendChart
            data={threatTrendData}
            isLoading={rawThreatTrend.isLoading}
          />
        </div>
        <div className="min-w-0">
          <SeverityDistributionChart
            data={severityData}
            isLoading={rawSeverity.isLoading}
          />
        </div>
      </div>

      {/* Charts Row 2: Attack Frequency + Top Sources */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="min-w-0">
          <AttackFrequencyChart
            data={attackFreqData}
            isLoading={rawAttackFreq.isLoading}
          />
        </div>
        <div className="min-w-0">
          <TopSourcesChart
            data={topSourcesData}
            isLoading={rawTopSources.isLoading}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="min-w-0">
        <RecentActivity
          data={recentActivityData}
          isLoading={rawRecentActivity.isLoading}
        />
      </div>
    </div>
  );
}
