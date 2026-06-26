'use client';

import { useState, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  Activity,
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
  ArrowUpRight,
  BarChart3,
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
const categoryConfig: Record<ThreatCategory, { color: string; bg: string; glow: string; label: string }> = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', glow: '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)', label: 'Critical' },
  HIGH_RISK: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', glow: 'none', label: 'High Risk' },
  MEDIUM_RISK: { color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', glow: 'none', label: 'Medium Risk' },
  LOW_RISK: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', glow: 'none', label: 'Low Risk' },
  SAFE: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', glow: 'none', label: 'Safe' },
};

const factorMeta: { key: keyof ThreatEntity['factors']; label: string; color: string }[] = [
  { key: 'anomalyScore', label: 'Anomaly Score', color: '#8b5cf6' },
  { key: 'failedLoginFactor', label: 'Failed Logins', color: '#ef4444' },
  { key: 'countryRisk', label: 'Country Risk', color: '#f97316' },
  { key: 'portRisk', label: 'Port Risk', color: '#eab308' },
  { key: 'severityFactor', label: 'Severity', color: '#06b6d4' },
];

type SortOption = 'score_desc' | 'score_asc' | 'last_seen' | 'alert_count';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'score_desc', label: 'Score (High → Low)' },
  { value: 'score_asc', label: 'Score (Low → High)' },
  { value: 'last_seen', label: 'Last Seen' },
  { value: 'alert_count', label: 'Alert Count' },
];

// ==================== Chart Tooltips ====================
function DistributionTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; fill: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg"
      style={{
        background: 'rgba(17, 17, 24, 0.95)',
        border: '1px solid #2a2a3a',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      <p className="text-xs font-medium mb-1" style={{ color: '#e4e4e7' }}>{label}</p>
      <p className="text-xs" style={{ color: payload[0].fill }}>
        {payload[0].value} entities
      </p>
    </div>
  );
}

function HistoryTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg"
      style={{
        background: 'rgba(17, 17, 24, 0.95)',
        border: '1px solid #2a2a3a',
        backdropFilter: 'blur(20px)',
      }}
    >
      <p className="text-[10px]" style={{ color: '#71717a' }}>{label}</p>
      <p className="text-xs font-bold" style={{ color: payload[0].value >= 80 ? '#ef4444' : payload[0].value >= 60 ? '#f97316' : payload[0].value >= 40 ? '#eab308' : '#22c55e' }}>
        Score: {payload[0].value}
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

// ==================== Component ====================
export default function ThreatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Distribution data for bar chart
  const distributionData = useMemo(() => {
    const cats: ThreatCategory[] = ['SAFE', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'];
    return cats.map(cat => ({
      name: categoryConfig[cat].label,
      count: mockThreatEntities.filter(e => e.category === cat).length,
      fill: categoryConfig[cat].color,
    }));
  }, []);

  // Filtered + sorted entities
  const filteredEntities = useMemo(() => {
    let entities = mockThreatEntities.filter(entity => {
      const matchesCategory = categoryFilter === 'ALL' || entity.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        entity.entityValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entity.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entity.country?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
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
        entities = [...entities].sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
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
    <div className="space-y-6 animate-fade-in">
      {/* ==================== Page Header ==================== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl"
            style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}
          >
            <Shield className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#e4e4e7' }}>Threat Analysis</h1>
            <p className="text-xs" style={{ color: '#71717a' }}>
              {filteredEntities.length} of {mockThreatEntities.length} entities · AI-powered risk scoring
            </p>
          </div>
        </div>
      </div>

      {/* ==================== Summary Stat Cards ==================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Entities */}
        <div className="glass-card-sm p-4 stat-card-hover" style={{ borderTop: '2px solid #06b6d4' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
              <Activity className="w-3.5 h-3.5" style={{ color: '#06b6d4' }} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Total Entities</span>
          </div>
          <p className="text-2xl font-bold animate-counter" style={{ color: '#06b6d4' }}>
            {mockThreatSummary.totalEntities}
          </p>
        </div>

        {/* Critical */}
        <div className="glass-card-sm p-4 stat-card-hover" style={{ borderTop: '2px solid #ef4444' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg animate-pulse-slow" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#ef4444' }} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Critical</span>
          </div>
          <p className="text-2xl font-bold animate-counter animate-pulse-slow" style={{ color: '#ef4444' }}>
            {mockThreatSummary.criticalCount}
          </p>
        </div>

        {/* High Risk */}
        <div className="glass-card-sm p-4 stat-card-hover" style={{ borderTop: '2px solid #f97316' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>High Risk</span>
          </div>
          <p className="text-2xl font-bold animate-counter" style={{ color: '#f97316' }}>
            {mockThreatSummary.highRiskCount}
          </p>
        </div>

        {/* Avg Score */}
        <div className="glass-card-sm p-4 stat-card-hover" style={{ borderTop: `2px solid ${getScoreColor(mockThreatSummary.avgScore)}` }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg" style={{ background: `${getScoreColor(mockThreatSummary.avgScore)}15` }}>
              <BarChart3 className="w-3.5 h-3.5" style={{ color: getScoreColor(mockThreatSummary.avgScore) }} />
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>Avg Score</span>
          </div>
          <p className="text-2xl font-bold animate-counter" style={{ color: getScoreColor(mockThreatSummary.avgScore) }}>
            {mockThreatSummary.avgScore}
            <span className="text-sm font-normal" style={{ color: '#71717a' }}>/100</span>
          </p>
        </div>
      </div>

      {/* ==================== Distribution Chart ==================== */}
      <div className="glass-card-sm p-5" style={{ borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#e4e4e7' }}>Threat Score Distribution</h3>
            <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>Entities by risk category</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {(['SAFE', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK', 'CRITICAL'] as ThreatCategory[]).map(cat => (
              <div key={cat} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: categoryConfig[cat].color }} />
                <span className="text-[10px]" style={{ color: '#71717a' }}>{categoryConfig[cat].label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#2a2a3a' }}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<DistributionTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {distributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ==================== Filters ==================== */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px] max-w-[400px]"
          style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}
        >
          <Search className="w-4 h-4" style={{ color: '#71717a' }} />
          <input
            type="text"
            placeholder="Search by IP, username, or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm flex-1"
            style={{ color: '#e4e4e7', border: 'none', outline: 'none' }}
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: '#111118', border: '1px solid #2a2a3a' }}>
          {['ALL', 'CRITICAL', 'HIGH_RISK', 'MEDIUM_RISK', 'LOW_RISK', 'SAFE'].map((cat) => {
            const isActive = categoryFilter === cat;
            const catColor = cat === 'ALL' ? '#06b6d4' : categoryConfig[cat as ThreatCategory]?.color;
            const catLabel = cat === 'ALL' ? 'All' : categoryConfig[cat as ThreatCategory]?.label;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200"
                style={{
                  background: isActive ? `${catColor}15` : 'transparent',
                  color: isActive ? catColor : '#71717a',
                  border: isActive ? `1px solid ${catColor}30` : '1px solid transparent',
                }}
              >
                {catLabel}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="text-xs font-medium px-3 py-2 rounded-lg appearance-none cursor-pointer pr-8"
            style={{
              background: '#1a1a24',
              border: '1px solid #2a2a3a',
              color: '#a1a1aa',
              outline: 'none',
            }}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown
            className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#71717a' }}
          />
        </div>
      </div>

      {/* ==================== Entity Cards ==================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredEntities.map((entity) => {
          const cat = categoryConfig[entity.category];
          const isExpanded = expandedId === entity.id;
          const scoreColor = getScoreColor(entity.score);
          const isCritical = entity.category === 'CRITICAL';

          return (
            <div
              key={entity.id}
              className="glass-card-sm overflow-hidden transition-all duration-300 stat-card-hover cursor-pointer"
              style={{
                boxShadow: isCritical ? cat.glow : 'none',
                borderColor: isCritical ? 'rgba(239, 68, 68, 0.3)' : undefined,
              }}
              onClick={() => setExpandedId(isExpanded ? null : entity.id)}
            >
              {/* Top accent stripe */}
              <div style={{ height: 2, background: cat.color }} />

              <div className="p-4">
                {/* Header row: entity type + value + score */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Entity type badge */}
                    <div
                      className="p-1.5 rounded-lg shrink-0"
                      style={{
                        background: entity.entityType === 'IP' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                        border: `1px solid ${entity.entityType === 'IP' ? 'rgba(6, 182, 212, 0.25)' : 'rgba(139, 92, 246, 0.25)'}`,
                      }}
                    >
                      {entity.entityType === 'IP' ? (
                        <Wifi className="w-3.5 h-3.5" style={{ color: '#06b6d4' }} />
                      ) : (
                        <User className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#e4e4e7' }}>
                        {entity.entityValue}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                          style={{
                            background: entity.entityType === 'IP' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                            color: entity.entityType === 'IP' ? '#06b6d4' : '#8b5cf6',
                          }}
                        >
                          {entity.entityType}
                        </span>
                        {entity.country && (
                          <span className="flex items-center gap-1 text-[10px]" style={{ color: '#71717a' }}>
                            <Globe className="w-3 h-3" />
                            {entity.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center shrink-0">
                    <div
                      className="text-2xl font-bold leading-none"
                      style={{ color: scoreColor }}
                    >
                      {entity.score}
                    </div>
                    <div className="text-[9px] mt-1 font-medium uppercase tracking-wider" style={{ color: '#71717a' }}>score</div>
                  </div>
                </div>

                {/* Category badge + meta row */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${isCritical ? 'animate-pulse-slow' : ''}`}
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    {cat.label.toUpperCase()}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                    {entity.confidence}% confidence
                  </span>
                  {entity.alertCount > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                      {entity.alertCount} alerts
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] ml-auto" style={{ color: '#71717a' }}>
                    <Clock className="w-3 h-3" />
                    {formatTime(entity.lastSeen)}
                  </span>
                </div>

                {/* Factor breakdown bars */}
                <div className="space-y-1.5">
                  {factorMeta.map((factor) => {
                    const value = entity.factors[factor.key];
                    return (
                      <div key={factor.key} className="flex items-center gap-2">
                        <span className="text-[9px] w-[72px] shrink-0 text-right" style={{ color: '#71717a' }}>
                          {factor.label}
                        </span>
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: '#1a1a24' }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${value * 100}%`,
                              background: factor.color,
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <span className="text-[9px] w-[28px] shrink-0" style={{ color: '#a1a1aa' }}>
                          {Math.round(value * 100)}%
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Expand toggle */}
                <div className="flex items-center justify-center mt-3 pt-2" style={{ borderTop: '1px solid #2a2a3a' }}>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" style={{ color: '#71717a' }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: '#71717a' }} />
                  )}
                </div>

                {/* ==================== Expanded Detail Section ==================== */}
                {isExpanded && (
                  <div className="mt-3 pt-3 animate-fade-in" style={{ borderTop: '1px solid #2a2a3a' }}>
                    {/* Score History Chart */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
                        <span className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>Score History (7 days)</span>
                      </div>
                      <div style={{ height: 120 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={entity.scoreHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id={`grad-${entity.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={scoreColor} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={scoreColor} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: '#71717a', fontSize: 9 }}
                              tickLine={false}
                              axisLine={{ stroke: '#2a2a3a' }}
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
                              dot={{ r: 3, fill: scoreColor, stroke: '#111118', strokeWidth: 2 }}
                              activeDot={{ r: 5, fill: scoreColor, stroke: '#111118', strokeWidth: 2 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* AI Analysis */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-3.5 h-3.5" style={{ color: '#8b5cf6' }} />
                        <span className="text-xs font-semibold" style={{ color: '#8b5cf6' }}>AI Analysis</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: '#a1a1aa' }}>
                        The {entity.modelUsed} model classified this {entity.entityType.toLowerCase()} entity with a{' '}
                        <span style={{ color: scoreColor, fontWeight: 600 }}>{entity.confidence}% confidence</span> threat score of{' '}
                        <span style={{ color: scoreColor, fontWeight: 600 }}>{entity.score}/100</span>.
                        {entity.factors.anomalyScore > 0.7 && ' Significant anomaly patterns were detected in network behavior.'}
                        {entity.factors.failedLoginFactor > 0.7 && ' Elevated failed authentication attempts indicate potential brute-force activity.'}
                        {entity.factors.countryRisk > 0.7 && ` Traffic originating from ${entity.country || 'high-risk region'} contributes to elevated risk.`}
                        {entity.factors.portRisk > 0.6 && ' Suspicious port scanning or exploitation attempts were observed.'}
                        {entity.score >= 80 && ' Immediate investigation is recommended.'}
                        {entity.score >= 60 && entity.score < 80 && ' Continued monitoring advised.'}
                        {entity.score < 40 && ' Entity behavior within acceptable thresholds.'}
                      </p>
                    </div>

                    {/* Related Alerts */}
                    {entity.relatedAlerts.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#f97316' }} />
                          <span className="text-xs font-semibold" style={{ color: '#f97316' }}>
                            Related Alerts ({entity.relatedAlerts.length})
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {entity.relatedAlerts.map(alertId => (
                            <span
                              key={alertId}
                              className="text-[10px] px-2 py-1 rounded-md font-mono"
                              style={{ background: '#1a1a24', color: '#a1a1aa', border: '1px solid #2a2a3a' }}
                            >
                              {alertId}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Model info */}
                    <div className="flex items-center gap-3 flex-wrap pt-2" style={{ borderTop: '1px solid #2a2a3a' }}>
                      <span className="text-[10px] px-2 py-1 rounded-md" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        Model: {entity.modelUsed}
                      </span>
                      <span className="text-[10px]" style={{ color: '#71717a' }}>
                        First seen: {new Date(entity.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        className="ml-auto text-[10px] px-2.5 py-1 rounded-md font-medium transition-all duration-200"
                        style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        Investigate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================== Empty State ==================== */}
      {filteredEntities.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Filter className="w-10 h-10 mx-auto mb-3" style={{ color: '#71717a' }} />
          <p className="text-sm font-medium" style={{ color: '#a1a1aa' }}>No threat entities match your filters</p>
          <p className="text-xs mt-1" style={{ color: '#71717a' }}>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
