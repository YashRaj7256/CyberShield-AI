'use client';

import { useState, useMemo, useEffect, useCallback, Fragment } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Globe,
  User,
  Wifi,
  Clock,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  Eye,
  Brain,
  BarChart3,
  LayoutGrid,
  Bell,
  Boxes,
  RefreshCw,
  Shield,
  Layers,
  Table as TableIcon,
  Activity,
  CheckCircle,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  LabelList,
} from 'recharts';
import { mockThreatEntities, mockThreatSummary } from '@/lib/mock-data';
import { api } from '@/lib/api';
import type { ThreatEntity, ThreatCategory, ThreatAnalysisSummary } from '@/types';
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

// ==================== Config ====================
const categoryConfig: Record<ThreatCategory, { color: string; bg: string; border: string; glow: string; label: string }> = {
  CRITICAL: {
    color: '#f87171',
    bg: 'rgba(239, 68, 68, 0.14)',
    border: 'rgba(239, 68, 68, 0.45)',
    glow: 'rgba(239, 68, 68, 0.16)',
    label: 'Critical',
  },
  HIGH_RISK: {
    color: '#fb923c',
    bg: 'rgba(249, 115, 22, 0.14)',
    border: 'rgba(249, 115, 22, 0.45)',
    glow: 'rgba(249, 115, 22, 0.16)',
    label: 'High Risk',
  },
  MEDIUM_RISK: {
    color: '#facc15',
    bg: 'rgba(234, 179, 8, 0.14)',
    border: 'rgba(234, 179, 8, 0.45)',
    glow: 'rgba(234, 179, 8, 0.16)',
    label: 'Medium Risk',
  },
  LOW_RISK: {
    color: '#4ade80',
    bg: 'rgba(34, 197, 94, 0.14)',
    border: 'rgba(34, 197, 94, 0.45)',
    glow: 'rgba(34, 197, 94, 0.16)',
    label: 'Low Risk',
  },
  SAFE: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.14)',
    border: 'rgba(16, 185, 129, 0.45)',
    glow: 'rgba(16, 185, 129, 0.16)',
    label: 'Safe',
  },
};

const factorMeta: { key: keyof ThreatEntity['factors']; label: string; color: string }[] = [
  { key: 'anomalyScore', label: 'Anomaly Score', color: '#f43f5e' },
  { key: 'failedLoginFactor', label: 'Failed Logins', color: '#ef4444' },
  { key: 'countryRisk', label: 'Country Risk', color: '#f97316' },
  { key: 'portRisk', label: 'Port Risk', color: '#eab308' },
  { key: 'severityFactor', label: 'Severity', color: '#06b6d4' },
];

const countryFlags: Record<string, string> = {
  Russia: '🇷🇺',
  China: '🇨🇳',
  Ukraine: '🇺🇦',
  Netherlands: '🇳🇱',
  Germany: '🇩🇪',
  'United States': '🇺🇸',
  India: '🇮🇳',
  Brazil: '🇧🇷',
  Singapore: '🇸🇬',
  Japan: '🇯🇵',
  France: '🇫🇷',
  'United Kingdom': '🇬🇧',
  Iran: '🇮🇷',
  'North Korea': '🇰🇵',
  Nigeria: '🇳🇬',
};

type SortOption = 'score_desc' | 'score_asc' | 'last_seen' | 'alert_count';

// ==================== Chart Tooltips ====================
function DistributionTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg"
      style={{
        background: 'rgba(11, 16, 27, 0.95)',
        border: '1px solid #1e2738',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      <p className="text-xs font-medium mb-1 text-zinc-300">{label}</p>
      <p className="text-xs font-bold" style={{ color: payload[0].fill }}>
        {payload[0].value} entities
      </p>
    </div>
  );
}

function HistoryTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      className="px-3 py-2 rounded-lg"
      style={{
        background: 'rgba(11, 16, 27, 0.95)',
        border: '1px solid #1e2738',
      }}
    >
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p
        className="text-xs font-bold"
        style={{
          color: val >= 80 ? '#f87171' : val >= 60 ? '#fb923c' : val >= 40 ? '#facc15' : '#4ade80',
        }}
      >
        Score: {val}
      </p>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#f87171';
  if (score >= 60) return '#fb923c';
  if (score >= 40) return '#facc15';
  if (score >= 20) return '#4ade80';
  return '#10b981';
}

// ==================== Main Component ====================
export default function ThreatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Live backend data state with offline fallback
  const [entities, setEntities] = useState<ThreatEntity[]>(mockThreatEntities);
  const [summary, setSummary] = useState<ThreatAnalysisSummary>(mockThreatSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchThreats = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await api.get<{
        entities: ThreatEntity[];
        summary: ThreatAnalysisSummary;
        pagination?: { total: number };
      }>('/threats', { limit: 200 });

      if (res && Array.isArray(res.entities) && res.entities.length > 0) {
        setEntities(res.entities);
        if (res.summary) {
          setSummary(res.summary);
        }
        setIsDemo(false);
      } else {
        setEntities(mockThreatEntities);
        setSummary(mockThreatSummary);
        setIsDemo(true);
      }
    } catch (err: unknown) {
      setEntities(mockThreatEntities);
      setSummary(mockThreatSummary);
      setIsDemo(true);
      if (err instanceof Error) {
        setFetchError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, searchQuery, sortBy, viewMode]);

  // Real-time category counts
  const categoryCounts = useMemo(() => {
    return {
      ALL: summary.totalEntities || entities.length,
      CRITICAL: summary.criticalCount || entities.filter((e) => e.category === 'CRITICAL').length,
      HIGH_RISK: summary.highRiskCount || entities.filter((e) => e.category === 'HIGH_RISK').length,
      MEDIUM_RISK: summary.mediumRiskCount || entities.filter((e) => e.category === 'MEDIUM_RISK').length,
      LOW_RISK: summary.lowRiskCount || entities.filter((e) => e.category === 'LOW_RISK').length,
      SAFE: summary.safeCount || entities.filter((e) => e.category === 'SAFE').length,
    };
  }, [summary, entities]);

  // Distribution data strictly in standard order with counts
  const distributionData = useMemo(() => {
    return [
      {
        name: 'Safe',
        count: summary.safeCount || entities.filter((e) => e.category === 'SAFE').length,
        fill: categoryConfig.SAFE.color,
      },
      {
        name: 'Low Risk',
        count: summary.lowRiskCount || entities.filter((e) => e.category === 'LOW_RISK').length,
        fill: categoryConfig.LOW_RISK.color,
      },
      {
        name: 'Medium Risk',
        count: summary.mediumRiskCount || entities.filter((e) => e.category === 'MEDIUM_RISK').length,
        fill: categoryConfig.MEDIUM_RISK.color,
      },
      {
        name: 'High Risk',
        count: summary.highRiskCount || entities.filter((e) => e.category === 'HIGH_RISK').length,
        fill: categoryConfig.HIGH_RISK.color,
      },
      {
        name: 'Critical',
        count: summary.criticalCount || entities.filter((e) => e.category === 'CRITICAL').length,
        fill: categoryConfig.CRITICAL.color,
      },
    ];
  }, [summary, entities]);

  // Filtered + sorted entities
  const filteredEntities = useMemo(() => {
    let list = entities.filter((entity) => {
      const matchesCategory = categoryFilter === 'ALL' || entity.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        entity.entityValue.toLowerCase().includes(q) ||
        entity.entityType.toLowerCase().includes(q) ||
        (entity.country?.toLowerCase().includes(q) ?? false);
      return matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case 'score_desc':
        list = [...list].sort((a, b) => b.score - a.score);
        break;
      case 'score_asc':
        list = [...list].sort((a, b) => a.score - b.score);
        break;
      case 'last_seen':
        list = [...list].sort(
          (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
        );
        break;
      case 'alert_count':
        list = [...list].sort((a, b) => b.alertCount - a.alertCount);
        break;
    }

    return list;
  }, [entities, categoryFilter, searchQuery, sortBy]);

  // Pagination calculation
  const pageSize = viewMode === 'grid' ? 12 : 20;
  const totalPages = Math.ceil(filteredEntities.length / pageSize) || 1;
  const paginatedEntities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEntities.slice(start, start + pageSize);
  }, [filteredEntities, currentPage, pageSize]);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="flex flex-col gap-4 animate-fade-in text-zinc-100 pb-16 min-w-0 w-full max-w-full">
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
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/50 via-rose-500/30 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(6, 182, 212, 0.08)',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                <Brain className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-[16px] font-semibold text-white tracking-tight">
                  Threat Entity Analysis & Anomaly Scoring
                </h1>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/30 tracking-wider">
                  {summary.totalEntities} ENTITIES
                </span>
                {isDemo ? (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-800/30 tracking-wider">
                    DEMO DATA
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/30 tracking-wider">
                    LIVE POSTGRESQL
                  </span>
                )}
              </div>
            </div>

            {/* System Status Row */}
            <div
              className="flex flex-wrap items-center gap-5 pt-3 mt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <StatusPill label="Anomaly Engine" value="v1.4 Ensemble" variant="info" />
              <StatusPill label="Entity Registry" value={`${summary.totalEntities} Monitored`} variant="success" pulse />
              <StatusPill label="High Risk Actors" value={summary.criticalCount + summary.highRiskCount} variant="danger" />
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchThreats}
              disabled={isLoading}
              className="font-mono text-xs gap-2 h-9"
              title="Sync threat entities"
            >
              <RefreshCw className={cn('w-3.5 h-3.5 text-cyan-400', isLoading && 'animate-spin')} />
              <span>Sync</span>
            </Button>
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
            <span>Failed to load live threat scores: {fetchError}</span>
          </div>
          <button
            onClick={fetchThreats}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Key Performance Indicators                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Entities */}
        <div
          onClick={() => setCategoryFilter('ALL')}
          className="group relative rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-150 cursor-pointer"
          style={{
            padding: '16px 20px',
            minHeight: '136px',
            background: categoryFilter === 'ALL' ? 'rgba(6, 182, 212, 0.06)' : 'rgba(13, 17, 23, 0.92)',
            border: categoryFilter === 'ALL' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow: categoryFilter === 'ALL' ? '0 0 16px rgba(6, 182, 212, 0.12)' : 'none',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-slate-400 tracking-wide">Total Entities</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-cyan-950/40 text-cyan-400 border border-cyan-800/40">
              <LayoutGrid className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center my-auto py-1">
            <span className="text-[2rem] sm:text-[2.2rem] font-bold font-mono text-white tracking-tight leading-none">
              {summary.totalEntities}
            </span>
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-cyan-400 mt-1">
              Active Registry
            </span>
          </div>
          <div className="text-center mt-auto pt-1">
            <span className="text-slate-500 text-[10px] font-mono">
              {categoryFilter === 'ALL' ? '✓ Showing All' : 'Click to filter'}
            </span>
          </div>
        </div>

        {/* Critical */}
        <div
          onClick={() => setCategoryFilter(categoryFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className="group relative rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-150 cursor-pointer"
          style={{
            padding: '16px 20px',
            minHeight: '136px',
            background: categoryFilter === 'CRITICAL' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(13, 17, 23, 0.92)',
            border: categoryFilter === 'CRITICAL' ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow: categoryFilter === 'CRITICAL' ? '0 0 16px rgba(239, 68, 68, 0.16)' : 'none',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-slate-400 tracking-wide">Critical Threats</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-red-950/40 text-red-400 border border-red-800/40">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center my-auto py-1">
            <span className="text-[2rem] sm:text-[2.2rem] font-bold font-mono text-red-400 tracking-tight leading-none">
              {summary.criticalCount}
            </span>
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-red-400 mt-1">
              Immediate Triage
            </span>
          </div>
          <div className="text-center mt-auto pt-1">
            <span className="text-slate-500 text-[10px] font-mono">
              {categoryFilter === 'CRITICAL' ? '✓ Active Filter' : 'Click to filter'}
            </span>
          </div>
        </div>

        {/* High Risk */}
        <div
          onClick={() => setCategoryFilter(categoryFilter === 'HIGH_RISK' ? 'ALL' : 'HIGH_RISK')}
          className="group relative rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-150 cursor-pointer"
          style={{
            padding: '16px 20px',
            minHeight: '136px',
            background: categoryFilter === 'HIGH_RISK' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(13, 17, 23, 0.92)',
            border: categoryFilter === 'HIGH_RISK' ? '1px solid rgba(249, 115, 22, 0.45)' : '1px solid rgba(255, 255, 255, 0.07)',
            boxShadow: categoryFilter === 'HIGH_RISK' ? '0 0 16px rgba(249, 115, 22, 0.16)' : 'none',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-slate-400 tracking-wide">High Risk Entities</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-orange-950/40 text-orange-400 border border-orange-800/40">
              <Boxes className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center my-auto py-1">
            <span className="text-[2rem] sm:text-[2.2rem] font-bold font-mono text-orange-400 tracking-tight leading-none">
              {summary.highRiskCount}
            </span>
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-orange-400 mt-1">
              Elevated Risk
            </span>
          </div>
          <div className="text-center mt-auto pt-1">
            <span className="text-slate-500 text-[10px] font-mono">
              {categoryFilter === 'HIGH_RISK' ? '✓ Active Filter' : 'Click to filter'}
            </span>
          </div>
        </div>

        {/* Avg Score */}
        <div
          className="group relative rounded-xl flex flex-col justify-between overflow-hidden"
          style={{
            padding: '16px 20px',
            minHeight: '136px',
            background: 'rgba(13, 17, 23, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-slate-400 tracking-wide">Platform Risk Average</span>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-yellow-950/40 text-yellow-400 border border-yellow-800/40">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center my-auto py-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[2rem] sm:text-[2.2rem] font-bold font-mono text-yellow-400 tracking-tight leading-none">
                {summary.avgScore}
              </span>
              <span className="text-slate-500 text-xs font-mono">/100</span>
            </div>
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-yellow-400 mt-1">
              {summary.avgScore >= 60 ? 'High Baseline' : summary.avgScore >= 40 ? 'Moderate Baseline' : 'Healthy Baseline'}
            </span>
          </div>
          <div className="text-center mt-auto pt-1">
            <span className="text-slate-500 text-[10px] font-mono">
              Across {summary.totalEntities} entities
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Threat Score Distribution Chart                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-5 sm:p-6"
        style={{
          background: 'rgba(13, 17, 23, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Threat Score Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Entities categorized by composite risk model</p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3.5 flex-wrap text-xs">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-slate-300 font-mono text-[11px] font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={distributionData}
              margin={{ top: 20, right: 15, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2738" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(dataMax + 10, 60)]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<DistributionTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
                {distributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="#cbd5e1"
                  fontSize={11}
                  fontWeight={600}
                  fontFamily="monospace"
                  offset={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Toolbar & Entity Views (20px gap from cards, 12px to view) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mt-1 min-w-0 w-full max-w-full">
        {/* Toolbar Controls */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Search + Category Filter Capsule (h-10 each, gap-3) */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 w-full">
            {/* SearchBar Domain Component */}
            <SearchBar
              placeholder="Search by IP, username, or country..."
              value={searchQuery}
              onChange={setSearchQuery}
              containerClassName="!h-10 flex-1 max-w-none lg:max-w-md rounded-xl"
            />

            {/* Category Filter Capsule (h-10) */}
            <div
              className="inline-flex items-center h-10 p-1 rounded-xl gap-1 overflow-x-auto shrink-0 max-w-full"
              style={{
                background: 'rgba(13, 17, 23, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            >
              {[
                { id: 'ALL', label: 'All', count: categoryCounts.ALL, color: '#22d3ee', bg: 'rgba(6, 182, 212, 0.16)', border: 'rgba(6, 182, 212, 0.45)' },
                { id: 'CRITICAL', label: 'Critical', count: categoryCounts.CRITICAL, color: '#f87171', bg: 'rgba(239, 68, 68, 0.16)', border: 'rgba(239, 68, 68, 0.45)' },
                { id: 'HIGH_RISK', label: 'High', count: categoryCounts.HIGH_RISK, color: '#fb923c', bg: 'rgba(249, 115, 22, 0.16)', border: 'rgba(249, 115, 22, 0.45)' },
                { id: 'MEDIUM_RISK', label: 'Medium', count: categoryCounts.MEDIUM_RISK, color: '#facc15', bg: 'rgba(234, 179, 8, 0.16)', border: 'rgba(234, 179, 8, 0.45)' },
                { id: 'LOW_RISK', label: 'Low', count: categoryCounts.LOW_RISK, color: '#4ade80', bg: 'rgba(34, 197, 94, 0.16)', border: 'rgba(34, 197, 94, 0.45)' },
                { id: 'SAFE', label: 'Safe', count: categoryCounts.SAFE, color: '#10b981', bg: 'rgba(16, 185, 129, 0.16)', border: 'rgba(16, 185, 129, 0.45)' },
              ].map(({ id, label, count, color, bg, border }) => {
                const isActive = categoryFilter === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategoryFilter(id)}
                    className="h-8 min-w-[56px] px-2.5 rounded-lg text-[11px] font-mono font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                    style={{
                      background: isActive ? bg : 'transparent',
                      border: isActive ? `1px solid ${border}` : '1px solid rgba(255, 255, 255, 0.06)',
                      color: isActive ? color : '#94a3b8',
                      boxShadow: isActive ? `0 0 10px ${border}` : 'none',
                    }}
                  >
                    {id !== 'ALL' && (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: color, boxShadow: isActive ? `0 0 6px ${color}` : 'none' }}
                      />
                    )}
                    <span>{label}</span>
                    <span className={cn('text-[10px] font-mono opacity-80', isActive ? 'text-white' : 'text-slate-500')}>
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Mode & Sort Sub-Toolbar (h-10 each, gap-3) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            <div className="inline-flex items-center h-10 p-1 rounded-xl bg-black/40 border border-white/[0.12] shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards Grid ({filteredEntities.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Matrix Table</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-400 shrink-0">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-10 text-xs font-mono font-medium px-3 rounded-xl appearance-none cursor-pointer pr-8 bg-black/40 border border-white/[0.12] text-slate-200 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="score_desc">Threat Score (High → Low)</option>
                  <option value="score_asc">Threat Score (Low → High)</option>
                  <option value="last_seen">Most Recently Seen</option>
                  <option value="alert_count">Most Correlated Alerts</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
              </div>
            </div>
          </div>
        </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. VIEW: Cards Grid (12px gap from Toolbar)                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="flex flex-col gap-4 w-full">
          {/* Skeleton Loaders */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl animate-pulse"
                  style={{
                    background: 'rgba(13, 17, 23, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Cards Grid */}
          {!isLoading && paginatedEntities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedEntities.map((entity) => {
                const cat = categoryConfig[entity.category];
                const isExpanded = expandedId === entity.id;
                const scoreColor = getScoreColor(entity.score);

                return (
                  <div
                    key={entity.id}
                    className="rounded-xl p-5 border transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col justify-between"
                    style={{
                      background: 'rgba(13, 17, 23, 0.95)',
                      borderColor: cat.border,
                      borderLeft: `4px solid ${cat.color}`,
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : entity.id)}
                  >
                    <div>
                      {/* Header: Icon + Info + Score */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              entity.entityType === 'IP'
                                ? 'bg-cyan-950/60 border border-cyan-500/20 text-cyan-400'
                                : entity.entityType === 'USER'
                                ? 'bg-purple-950/60 border border-purple-500/20 text-purple-400'
                                : 'bg-emerald-950/60 border border-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {entity.entityType === 'IP' ? (
                              <Wifi className="w-5 h-5" />
                            ) : entity.entityType === 'USER' ? (
                              <User className="w-5 h-5" />
                            ) : (
                              <Layers className="w-5 h-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white tracking-tight truncate font-mono">
                              {entity.entityValue}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono ${
                                  entity.entityType === 'IP'
                                    ? 'bg-[#082f49] text-cyan-400'
                                    : entity.entityType === 'USER'
                                    ? 'bg-[#3b0764] text-purple-400'
                                    : 'bg-emerald-950/80 text-emerald-400'
                                }`}
                              >
                                {entity.entityType}
                              </span>
                              {entity.country && (
                                <span className="flex items-center gap-1.5 text-xs text-slate-400 truncate">
                                  <span>{countryFlags[entity.country] || '🌐'}</span>
                                  <span>{entity.country}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Score Number + Label */}
                        <div className="text-right shrink-0">
                          <div className="text-2xl font-black font-mono leading-tight" style={{ color: scoreColor }}>
                            {entity.score}
                          </div>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-0.5 font-mono">
                            SCORE
                          </div>
                        </div>
                      </div>

                      {/* Badges line: Category + Confidence + Alerts + Last Seen */}
                      <div className="flex items-center gap-2.5 mt-3.5 mb-4 flex-wrap text-xs">
                        <span className="font-bold tracking-wide text-xs font-mono uppercase" style={{ color: cat.color }}>
                          {cat.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#0c2a38] text-cyan-400 border border-cyan-800/40">
                          {entity.confidence}% confidence
                        </span>
                        {entity.alertCount > 0 && (
                          <span className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                            <Bell className="w-3.5 h-3.5 text-orange-400/80" />
                            <span>{entity.alertCount} alerts</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400 text-xs ml-auto font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{formatTime(entity.lastSeen)}</span>
                        </span>
                      </div>

                      {/* Factor Breakdown Bars */}
                      <div className="space-y-2 mt-2">
                        {factorMeta.map((factor) => {
                          const value = entity.factors[factor.key];
                          const pct = Math.round(value * 100);
                          return (
                            <div key={factor.key} className="flex items-center gap-3">
                              <span className="text-xs text-slate-400 w-24 shrink-0 font-normal">
                                {factor.label}
                              </span>
                              <div className="flex-1 h-2 rounded-full overflow-hidden bg-[#141d2e]">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: factor.color,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-slate-300 w-8 text-right font-medium font-mono">
                                {pct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Chevron toggle */}
                    <div className="flex justify-center mt-3 pt-2 border-t border-white/[0.06]">
                      <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                        <span>{isExpanded ? 'Hide Details' : 'View Intelligence'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </div>

                    {/* Expanded Detail Section */}
                    {isExpanded && (
                      <div
                        className="mt-3 pt-4 border-t border-white/[0.08] animate-fade-in space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Score History Line Chart */}
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-xs font-semibold text-slate-300 font-mono">
                              Score History (7 days)
                            </span>
                          </div>
                          <div style={{ height: 110 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={entity.scoreHistory}
                                margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e2738" vertical={false} />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fill: '#71717a', fontSize: 9 }}
                                  tickLine={false}
                                  axisLine={{ stroke: '#1e2738' }}
                                  tickFormatter={(v: string) => {
                                    const d = new Date(v);
                                    return `${d.getMonth() + 1}/${d.getDate()}`;
                                  }}
                                />
                                <YAxis
                                  domain={[0, 100]}
                                  tick={{ fill: '#71717a', fontSize: 9 }}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <Tooltip content={<HistoryTooltip />} />
                                <Line
                                  type="monotone"
                                  dataKey="score"
                                  stroke={scoreColor}
                                  strokeWidth={2}
                                  dot={{ r: 3, fill: scoreColor, stroke: '#0b101b', strokeWidth: 2 }}
                                  activeDot={{ r: 5, fill: scoreColor, stroke: '#0b101b', strokeWidth: 2 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* AI Analysis */}
                        <div className="bg-[#111726]/80 p-3 rounded-lg border border-[#1e2738]">
                          <div className="flex items-center gap-2 mb-1.5">
                            <Brain className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-xs font-semibold text-cyan-400 font-mono">AI Threat Insight</span>
                          </div>
                          <p className="text-xs leading-relaxed text-slate-300">
                            The {entity.modelUsed} classified this {entity.entityType.toLowerCase()}{' '}
                            entity with a{' '}
                            <span className="font-semibold" style={{ color: scoreColor }}>
                              {entity.confidence}% confidence
                            </span>{' '}
                            threat score of{' '}
                            <span className="font-semibold" style={{ color: scoreColor }}>
                              {entity.score}/100
                            </span>
                            .
                            {entity.factors.anomalyScore > 0.7 &&
                              ' Significant anomaly patterns were detected in network behavior.'}
                            {entity.factors.failedLoginFactor > 0.7 &&
                              ' Elevated failed authentication attempts indicate potential brute-force activity.'}
                            {entity.factors.countryRisk > 0.7 &&
                              ` Traffic originating from ${
                                entity.country || 'high-risk region'
                              } contributes to elevated risk.`}
                            {entity.factors.portRisk > 0.6 &&
                              ' Suspicious port scanning or exploitation attempts were observed.'}
                            {entity.score >= 80 && ' Immediate SOC containment is recommended.'}
                            {entity.score >= 60 &&
                              entity.score < 80 &&
                              ' Heightened surveillance and telemetry capture recommended.'}
                            {entity.score < 40 && ' Entity behavior within baseline normal limits.'}
                          </p>
                        </div>

                        {/* Related Alerts */}
                        {entity.relatedAlerts.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                              <span className="text-xs font-semibold text-slate-300 font-mono">
                                Related Alerts ({entity.relatedAlerts.length})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {entity.relatedAlerts.map((alertId) => (
                                <span
                                  key={alertId}
                                  className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#141d2e] text-slate-300 border border-[#1e2738]"
                                >
                                  {alertId.slice(0, 13)}...
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer Meta + Investigate */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#1e2738] text-[11px] text-slate-500 font-mono">
                          <span>Model: {entity.modelUsed}</span>
                          <span className="text-cyan-400 font-semibold">Active Monitoring</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. VIEW: High-Density SOC Matrix Table                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-white/[0.08] bg-[rgba(13,17,23,0.95)] shadow-lg overflow-x-auto">
          <Table className="w-full text-left text-sm border-collapse">
            <TableHeader className="bg-white/[0.03]">
              <TableRow
                className="border-b text-[10.5px] font-mono uppercase tracking-wider text-slate-400 hover:bg-transparent"
                style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <TableHead className="py-3 px-3.5 w-[140px] text-center border-r border-white/[0.08] font-semibold">
                  Category
                </TableHead>
                <TableHead className="py-3 px-3 min-w-[240px] font-semibold">Threat Entity & Type</TableHead>
                <TableHead className="py-3 px-3 w-[110px] text-right font-semibold">Risk Score</TableHead>
                <TableHead className="py-3 px-3 w-[130px] font-semibold">AI Confidence</TableHead>
                <TableHead className="py-3 px-3 w-[150px] font-semibold">Origin & Geo</TableHead>
                <TableHead className="py-3 px-3 w-[120px] font-semibold">Related Alerts</TableHead>
                <TableHead className="py-3 px-3 w-[120px] text-right font-semibold">Last Seen</TableHead>
                <TableHead className="py-3 pl-2 pr-4 w-[90px] text-center font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y" style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
              {paginatedEntities.map((entity) => {
                const cat = categoryConfig[entity.category];
                const scoreColor = getScoreColor(entity.score);
                const isExpanded = expandedId === entity.id;

                return (
                  <Fragment key={entity.id}>
                    <TableRow
                      onClick={() => setExpandedId(isExpanded ? null : entity.id)}
                      className="group cursor-pointer hover:bg-white/[0.04] transition-colors"
                      style={{
                        borderLeft: `4px solid ${cat.color}`,
                        background: isExpanded ? 'rgba(15, 20, 28, 0.98)' : 'transparent',
                      }}
                    >
                      {/* Category */}
                      <TableCell className="py-2.5 px-3 align-middle text-center border-r border-white/[0.08]">
                        <div
                          className="inline-flex items-center justify-center gap-1.5 w-[110px] h-7 px-2.5 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider"
                          style={{
                            background: cat.bg,
                            border: `1px solid ${cat.border}`,
                            color: cat.color,
                            boxShadow: `0 0 10px ${cat.glow}`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ background: cat.color }}
                          />
                          <span>{cat.label}</span>
                        </div>
                      </TableCell>

                      {/* Entity & Type */}
                      <TableCell className="py-2.5 px-3 align-middle">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ${
                              entity.entityType === 'IP'
                                ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                                : entity.entityType === 'USER'
                                ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40'
                                : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            }`}
                          >
                            {entity.entityType}
                          </span>
                          <span className="font-mono font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {entity.entityValue}
                          </span>
                        </div>
                      </TableCell>

                      {/* Score */}
                      <TableCell className="py-2.5 px-3 align-middle text-right">
                        <div
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[12px] font-bold"
                          style={{
                            background: `${cat.color}10`,
                            borderColor: `${cat.color}35`,
                            color: scoreColor,
                          }}
                        >
                          <span>{entity.score}</span>
                          <span className="text-[9px] text-slate-500 font-normal">/100</span>
                        </div>
                      </TableCell>

                      {/* AI Confidence */}
                      <TableCell className="py-2.5 px-3 align-middle font-mono text-[11px] text-cyan-300">
                        <span>{entity.confidence}% confidence</span>
                      </TableCell>

                      {/* Origin & Geo */}
                      <TableCell className="py-2.5 px-3 align-middle text-xs text-slate-300">
                        {entity.country ? (
                          <div className="flex items-center gap-1.5">
                            <span>{countryFlags[entity.country] || '🌐'}</span>
                            <span>{entity.country}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">Internal Network</span>
                        )}
                      </TableCell>

                      {/* Alerts */}
                      <TableCell className="py-2.5 px-3 align-middle font-mono text-xs">
                        {entity.alertCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-orange-400">
                            <Bell className="w-3 h-3" />
                            <span>{entity.alertCount} events</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">0 events</span>
                        )}
                      </TableCell>

                      {/* Last Seen */}
                      <TableCell className="py-2.5 px-3 align-middle text-right font-mono text-[11px] text-slate-400">
                        {formatTime(entity.lastSeen)}
                      </TableCell>

                      {/* Action */}
                      <TableCell className="py-2.5 pl-2 pr-4 align-middle text-center">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </TableCell>
                    </TableRow>

                    {/* Table Row Drawer */}
                    {isExpanded && (
                      <TableRow
                        className="hover:bg-transparent"
                        style={{
                          background: 'rgba(15, 20, 28, 0.98)',
                          borderLeft: `4px solid ${cat.color}`,
                        }}
                      >
                        <TableCell colSpan={8} className="p-4 sm:p-5">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Factors */}
                              <div className="space-y-2">
                                <span className="text-[11px] font-mono uppercase font-semibold text-slate-400">
                                  Model Feature Contributions
                                </span>
                                {factorMeta.map((factor) => {
                                  const value = entity.factors[factor.key];
                                  const pct = Math.round(value * 100);
                                  return (
                                    <div key={factor.key} className="flex items-center gap-3">
                                      <span className="text-xs text-slate-400 w-28 shrink-0 font-normal">
                                        {factor.label}
                                      </span>
                                      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[#141d2e]">
                                        <div
                                          className="h-full rounded-full"
                                          style={{
                                            width: `${pct}%`,
                                            backgroundColor: factor.color,
                                          }}
                                        />
                                      </div>
                                      <span className="text-xs text-slate-300 w-8 text-right font-mono">
                                        {pct}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* AI Analysis */}
                              <div className="bg-[#111726]/90 p-4 rounded-lg border border-[#1e2738] flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-2 text-cyan-400 font-mono text-xs font-semibold">
                                    <Brain className="w-4 h-4" />
                                    <span>AI Diagnostics & Behavioral Synthesis</span>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                                    Entity evaluated by <strong className="text-white">{entity.modelUsed}</strong>.
                                    Assigned risk rating of <strong style={{ color: scoreColor }}>{entity.score}/100</strong> with{' '}
                                    <strong>{entity.confidence}%</strong> model confidence.
                                    {entity.score >= 80 && ' High severity indicators warrant containment measures.'}
                                  </p>
                                </div>
                                <div className="mt-3 pt-2 border-t border-white/[0.08] text-[11px] font-mono text-slate-400 flex items-center justify-between">
                                  <span>ID: {entity.id.slice(0, 16)}</span>
                                  <span className="text-cyan-400">SOC Monitored</span>
                                </div>
                              </div>
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

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 7. Pagination Footer                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!isLoading && filteredEntities.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div>
            Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-white">{Math.min(currentPage * pageSize, filteredEntities.length)}</strong> of{' '}
            <strong className="text-white">{filteredEntities.length}</strong> entities
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-black/30 hover:border-cyan-500/40 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-black/40 text-cyan-300 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-black/30 hover:border-cyan-500/40 text-slate-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 8. Empty State                                                */}
      {/* ───────────────────────────────────────────────────────────── */}
      {!isLoading && filteredEntities.length === 0 && (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            background: 'rgba(13, 17, 23, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Filter className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-white">No threat entities match your filters</p>
          <p className="text-xs mt-1 text-slate-400">
            Try adjusting your search query or category filter criteria
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
