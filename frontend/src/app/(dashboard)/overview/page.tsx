'use client';

import {
  ScrollText,
  Bell,
  AlertTriangle,
  Users,
  ShieldBan,
  Gauge,
} from 'lucide-react';
import StatCard from '@/components/dashboard/stat-card';
import ThreatTrendChart from '@/components/charts/threat-trend-chart';
import SeverityDistributionChart from '@/components/charts/severity-distribution-chart';
import AttackFrequencyChart from '@/components/charts/attack-frequency-chart';
import TopSourcesChart from '@/components/charts/top-sources-chart';
import RecentActivity from '@/components/dashboard/recent-activity';
import { mockDashboardStats } from '@/lib/mock-data';

export default function OverviewPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Logs"
          value={mockDashboardStats.totalLogs}
          icon={<ScrollText className="w-5 h-5" />}
          change={12.5}
          accentColor="#06b6d4"
        />
        <StatCard
          label="Active Alerts"
          value={mockDashboardStats.totalAlerts}
          icon={<Bell className="w-5 h-5" />}
          change={8.3}
          accentColor="#eab308"
        />
        <StatCard
          label="Critical Alerts"
          value={mockDashboardStats.criticalAlerts}
          icon={<AlertTriangle className="w-5 h-5" />}
          change={-15.2}
          accentColor="#ef4444"
          pulse
        />
        <StatCard
          label="High Risk Users"
          value={mockDashboardStats.highRiskUsers}
          icon={<Users className="w-5 h-5" />}
          change={3.7}
          accentColor="#f97316"
        />
        <StatCard
          label="Blocked IPs"
          value={mockDashboardStats.blockedIps}
          icon={<ShieldBan className="w-5 h-5" />}
          change={22.1}
          accentColor="#8b5cf6"
        />
        <StatCard
          label="Threat Score"
          value={mockDashboardStats.avgThreatScore}
          icon={<Gauge className="w-5 h-5" />}
          change={-5.4}
          accentColor="#3b82f6"
          format="score"
          suffix="/100"
        />
      </div>

      {/* Charts Row 1: Trend + Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatTrendChart />
        </div>
        <div>
          <SeverityDistributionChart />
        </div>
      </div>

      {/* Charts Row 2: Attack Frequency + Top Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttackFrequencyChart />
        <TopSourcesChart />
      </div>

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
