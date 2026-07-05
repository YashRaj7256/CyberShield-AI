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
} from '@/types';

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
      className="glass-card-sm p-5 relative overflow-hidden"
      style={{ borderLeft: '3px solid rgba(42, 42, 58, 0.5)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div
            className="h-3 w-20 rounded animate-pulse mb-3"
            style={{ background: 'rgba(26, 26, 36, 0.6)' }}
          />
          <div
            className="h-7 w-24 rounded animate-pulse mb-2"
            style={{ background: 'rgba(26, 26, 36, 0.6)' }}
          />
          <div
            className="h-3 w-28 rounded animate-pulse"
            style={{ background: 'rgba(26, 26, 36, 0.6)' }}
          />
        </div>
        <div
          className="w-10 h-10 rounded-xl animate-pulse shrink-0"
          style={{ background: 'rgba(26, 26, 36, 0.6)' }}
        />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const stats = useApi<DashboardStats>('/dashboard/stats', undefined, {
    fallbackData: mockDashboardStats,
  });
  const threatTrend = useApi<ThreatTrendPoint[]>('/dashboard/threat-trends', undefined, {
    fallbackData: mockThreatTrend,
  });
  const severity = useApi<SeverityDistribution[]>('/dashboard/severity-distribution', undefined, {
    fallbackData: mockSeverityDistribution,
  });
  const attackFreq = useApi<AttackFrequency[]>('/dashboard/attack-frequency', undefined, {
    fallbackData: mockAttackFrequency,
  });
  const topSources = useApi<TopSource[]>('/dashboard/top-sources', undefined, {
    fallbackData: mockTopSources,
  });
  const recentActivity = useApi<RecentActivityType[]>('/dashboard/recent-activity', undefined, {
    fallbackData: mockRecentActivity,
  });

  // Determine global fallback status — if any endpoint fell back, show DEMO
  const anyFallback =
    stats.isUsingFallback ||
    threatTrend.isUsingFallback ||
    severity.isUsingFallback ||
    attackFreq.isUsingFallback ||
    topSources.isUsingFallback ||
    recentActivity.isUsingFallback;

  const allLoading =
    stats.isLoading &&
    threatTrend.isLoading &&
    severity.isLoading &&
    attackFreq.isLoading &&
    topSources.isLoading &&
    recentActivity.isLoading;

  const dashboardData = stats.data ?? mockDashboardStats;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header with status badge */}
      <div className="flex items-center gap-3">
        <StatusBadge isUsingFallback={anyFallback} isLoading={allLoading} />
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Logs"
              value={dashboardData.totalLogs}
              icon={<ScrollText className="w-5 h-5" />}
              change={12.5}
              accentColor="#06b6d4"
            />
            <StatCard
              label="Active Alerts"
              value={dashboardData.totalAlerts}
              icon={<Bell className="w-5 h-5" />}
              change={8.3}
              accentColor="#eab308"
            />
            <StatCard
              label="Critical Alerts"
              value={dashboardData.criticalAlerts}
              icon={<AlertTriangle className="w-5 h-5" />}
              change={-15.2}
              accentColor="#ef4444"
              pulse
            />
            <StatCard
              label="High Risk Users"
              value={dashboardData.highRiskUsers}
              icon={<Users className="w-5 h-5" />}
              change={3.7}
              accentColor="#f97316"
            />
            <StatCard
              label="Blocked IPs"
              value={dashboardData.blockedIps}
              icon={<ShieldBan className="w-5 h-5" />}
              change={22.1}
              accentColor="#8b5cf6"
            />
            <StatCard
              label="Threat Score"
              value={dashboardData.avgThreatScore}
              icon={<Gauge className="w-5 h-5" />}
              change={-5.4}
              accentColor="#3b82f6"
              format="score"
              suffix="/100"
            />
          </>
        )}
      </div>

      {/* Charts Row 1: Trend + Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatTrendChart
            data={threatTrend.data ?? undefined}
            isLoading={threatTrend.isLoading}
          />
        </div>
        <div>
          <SeverityDistributionChart
            data={severity.data ?? undefined}
            isLoading={severity.isLoading}
          />
        </div>
      </div>

      {/* Charts Row 2: Attack Frequency + Top Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttackFrequencyChart
          data={attackFreq.data ?? undefined}
          isLoading={attackFreq.isLoading}
        />
        <TopSourcesChart
          data={topSources.data ?? undefined}
          isLoading={topSources.isLoading}
        />
      </div>

      {/* Recent Activity */}
      <RecentActivity
        data={recentActivity.data ?? undefined}
        isLoading={recentActivity.isLoading}
      />
    </div>
  );
}
