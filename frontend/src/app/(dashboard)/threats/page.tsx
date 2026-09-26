'use client';

import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Globe,
  User,
  Wifi,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  Brain,
  BarChart3,
  LayoutGrid,
  Bell,
  Boxes,
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
} from 'recharts';
import { mockThreatEntities, mockThreatSummary } from '@/lib/mock-data';
import type { ThreatEntity, ThreatCategory } from '@/types';

// ==================== Config ====================
const categoryConfig: Record<ThreatCategory, { color: string; bg: string; border: string; label: string }> = {
  CRITICAL: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.35)',
    label: 'Critical',
  },
  HIGH_RISK: {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.35)',
    label: 'High Risk',
  },
  MEDIUM_RISK: {
    color: '#eab308',
    bg: 'rgba(234, 179, 8, 0.12)',
    border: 'rgba(234, 179, 8, 0.25)',
    label: 'Medium Risk',
  },
  LOW_RISK: {
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.25)',
    label: 'Low Risk',
  },
  SAFE: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
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
};

type SortOption = 'score_desc' | 'score_asc' | 'last_seen' | 'alert_count';

const filterTabs = [
  { key: 'ALL', label: 'All' },
  { key: 'CRITICAL', label: 'Critical' },
  { key: 'HIGH_RISK', label: 'High Risk' },
  { key: 'MEDIUM_RISK', label: 'Medium Risk' },
  { key: 'LOW_RISK', label: 'Low Risk' },
  { key: 'SAFE', label: 'Safe' },
];

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
          color: val >= 80 ? '#ef4444' : val >= 60 ? '#f97316' : val >= 40 ? '#eab308' : '#22c55e',
        }}
      >
        Score: {val}
      </p>
    </div>
  );
}

// ==================== Score Color Helper ====================
function getScoreColor(score: number): string {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 40) return '#eab308';
  if (score >= 20) return '#22c55e';
  return '#10b981';
}

// ==================== Main Component ====================
export default function ThreatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Distribution data strictly in the screenshot order: Safe -> Low Risk -> Medium Risk -> High Risk -> Critical
  const distributionData = useMemo(() => {
    const cats: ThreatCategory[] = ['SAFE', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'];
    return cats.map((cat) => ({
      name: categoryConfig[cat].label,
      count: mockThreatEntities.filter((e) => e.category === cat).length,
      fill: categoryConfig[cat].color,
    }));
  }, []);

  // Filtered + sorted entities
  const filteredEntities = useMemo(() => {
    let entities = mockThreatEntities.filter((entity) => {
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
        entities = [...entities].sort((a, b) => b.score - a.score);
        break;
      case 'score_asc':
        entities = [...entities].sort((a, b) => a.score - b.score);
        break;
      case 'last_seen':
        entities = [...entities].sort(
          (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
        );
        break;
      case 'alert_count':
        entities = [...entities].sort((a, b) => b.alertCount - a.alertCount);
        break;
    }

    return entities;
  }, [categoryFilter, searchQuery, sortBy]);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="space-y-5 animate-fade-in text-zinc-100">
      {/* ==================== 1. Summary KPI Cards ==================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Entities */}
        <div className="bg-[#0b101b]/90 border border-[#1e2738] rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Total Entities
              </p>
              <p className="text-3xl font-bold text-cyan-400 leading-tight mt-0.5">
                {mockThreatSummary.totalEntities}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-cyan-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+7%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 font-medium">vs last 7 days</p>
          </div>
        </div>

        {/* Critical */}
        <div className="bg-[#0b101b]/90 border border-[#1e2738] rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-red-950/40 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Critical
              </p>
              <p className="text-3xl font-bold text-red-500 leading-tight mt-0.5">
                {mockThreatSummary.criticalCount}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-red-500 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+50%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 font-medium">vs last 7 days</p>
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-[#0b101b]/90 border border-[#1e2738] rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-orange-950/40 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                High Risk
              </p>
              <p className="text-3xl font-bold text-orange-500 leading-tight mt-0.5">
                {mockThreatSummary.highRiskCount}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-orange-500 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+33%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 font-medium">vs last 7 days</p>
          </div>
        </div>

        {/* Avg Score */}
        <div className="bg-[#0b101b]/90 border border-[#1e2738] rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-yellow-950/40 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Avg Score
              </p>
              <p className="text-3xl font-bold text-yellow-400 leading-tight mt-0.5">
                {mockThreatSummary.avgScore}
                <span className="text-zinc-500 text-base font-normal">/100</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-emerald-400 text-xs font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-12%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1 font-medium">vs last 7 days</p>
          </div>
        </div>
      </div>

      {/* ==================== 2. Threat Score Distribution Chart ==================== */}
      <div className="bg-[#0b101b]/90 border border-[#1e2738] rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Threat Score Distribution</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Entities by risk category</p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 flex-wrap text-xs">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-zinc-300 font-medium text-[11px]">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 230 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={distributionData}
              margin={{ top: 10, right: 15, left: -25, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2738" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<DistributionTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
                {distributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ==================== 3. Search, Filters & Sort ==================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl flex-1 min-w-[260px] max-w-[420px] bg-[#0b101b] border border-[#1e2738]">
          <Search className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by IP, username, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 w-full focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0b101b] border border-[#1e2738] overflow-x-auto">
          {filterTabs.map((tab) => {
            const isActive = categoryFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setCategoryFilter(tab.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#131b2e]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs font-medium px-4 py-2.5 rounded-xl appearance-none cursor-pointer pr-9 bg-[#0b101b] border border-[#1e2738] text-zinc-300 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="score_desc">Score (High → Low)</option>
            <option value="score_asc">Score (Low → High)</option>
            <option value="last_seen">Last Seen</option>
            <option value="alert_count">Alert Count</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500" />
        </div>
      </div>

      {/* ==================== 4. Entity Cards Grid (3 Columns) ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEntities.map((entity) => {
          const cat = categoryConfig[entity.category];
          const isExpanded = expandedId === entity.id;
          const scoreColor = getScoreColor(entity.score);

          return (
            <div
              key={entity.id}
              className="bg-[#0b101b]/95 rounded-xl p-5 border transition-all duration-200 hover:shadow-lg cursor-pointer"
              style={{
                borderColor: cat.border,
              }}
              onClick={() => setExpandedId(isExpanded ? null : entity.id)}
            >
              {/* Header: Icon + Info + Score */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      entity.entityType === 'IP'
                        ? 'bg-cyan-950/60 border border-cyan-500/20 text-cyan-400'
                        : 'bg-purple-950/60 border border-purple-500/20 text-purple-400'
                    }`}
                  >
                    {entity.entityType === 'IP' ? (
                      <Wifi className="w-5 h-5" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate">
                      {entity.entityValue}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          entity.entityType === 'IP'
                            ? 'bg-[#082f49] text-cyan-400'
                            : 'bg-[#3b0764] text-purple-400'
                        }`}
                      >
                        {entity.entityType}
                      </span>
                      {entity.country && (
                        <span className="flex items-center gap-1.5 text-xs text-zinc-400 truncate">
                          <span>{countryFlags[entity.country] || '🌐'}</span>
                          <span>{entity.country}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Number + Label */}
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black leading-tight" style={{ color: scoreColor }}>
                    {entity.score}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-0.5">
                    SCORE
                  </div>
                </div>
              </div>

              {/* Badges line: Category + Confidence + Alerts + Last Seen */}
              <div className="flex items-center gap-2.5 mt-3.5 mb-4 flex-wrap text-xs">
                <span className="font-bold tracking-wide text-xs" style={{ color: cat.color }}>
                  {cat.label.toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0c2a38] text-cyan-400 border border-cyan-800/40">
                  {entity.confidence}% confidence
                </span>
                {entity.alertCount > 0 && (
                  <span className="flex items-center gap-1 text-zinc-400 text-xs">
                    <Bell className="w-3.5 h-3.5 text-orange-400/80" />
                    <span>{entity.alertCount} alerts</span>
                  </span>
                )}
                <span className="flex items-center gap-1 text-zinc-400 text-xs ml-auto">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
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
                      <span className="text-xs text-zinc-400 w-24 shrink-0 font-normal">
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
                      <span className="text-xs text-zinc-300 w-8 text-right font-medium font-mono">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Chevron toggle */}
              <div className="flex justify-center mt-3 pt-1">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
                )}
              </div>

              {/* ==================== Expanded Detail Section ==================== */}
              {isExpanded && (
                <div
                  className="mt-3 pt-4 border-t border-[#1e2738] animate-fade-in space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Score History Line Chart */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-xs font-semibold text-zinc-300">
                        Score History (7 days)
                      </span>
                    </div>
                    <div style={{ height: 120 }}>
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
                      <span className="text-xs font-semibold text-cyan-400">AI Threat Insight</span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-400">
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
                        <span className="text-xs font-semibold text-zinc-300">
                          Related Alerts ({entity.relatedAlerts.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {entity.relatedAlerts.map((alertId) => (
                          <span
                            key={alertId}
                            className="text-[10px] px-2 py-0.5 rounded font-mono bg-[#141d2e] text-zinc-300 border border-[#1e2738]"
                          >
                            {alertId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Meta + Investigate */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1e2738] text-[11px] text-zinc-500">
                    <span>Model: {entity.modelUsed}</span>
                    <button
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 hover:bg-cyan-900/80 transition-colors flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      Investigate
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ==================== 5. Empty State ==================== */}
      {filteredEntities.length === 0 && (
        <div className="bg-[#0b101b]/90 border border-[#1e2738] rounded-xl p-12 text-center">
          <Filter className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
          <p className="text-sm font-semibold text-zinc-300">
            No threat entities match your filters
          </p>
          <p className="text-xs mt-1 text-zinc-500">
            Try adjusting your search query or category filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
