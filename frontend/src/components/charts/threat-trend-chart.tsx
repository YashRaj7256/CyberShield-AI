'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockThreatTrend } from '@/lib/mock-data';
import type { ThreatTrendPoint } from '@/types';

interface ThreatTrendChartProps {
  data?: ThreatTrendPoint[];
  isLoading?: boolean;
}

type ViewMode = 'all' | 'threats' | 'blocked';

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; name: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const dateObj = label ? new Date(label) : new Date();
  const formattedDate = isNaN(dateObj.getTime())
    ? label
    : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="px-3.5 py-3 rounded-xl backdrop-blur-xl"
      style={{
        background: 'rgba(13, 17, 23, 0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center justify-between gap-6 mb-2.5 pb-2 border-b border-white/[0.07]">
        <span className="text-[11px] font-semibold text-slate-300 font-mono">{formattedDate}</span>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/50 text-cyan-400 border border-cyan-800/40">
          Telemetry
        </span>
      </div>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-8 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full ring-1 ring-white/10" style={{ background: entry.color }} />
              <span className="text-slate-400">{entry.name}:</span>
            </div>
            <span className="font-mono font-bold text-white">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ThreatTrendChart({ data, isLoading }: ThreatTrendChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const chartData = data ?? mockThreatTrend;

  const totalThreats = chartData.reduce((acc, curr) => acc + curr.threats, 0);
  const totalBlocked = chartData.reduce((acc, curr) => acc + curr.blocked, 0);
  const mitigationRate = totalThreats > 0 ? Math.min(100, Math.round((totalBlocked / totalThreats) * 100)) : 94;

  return (
    <div
      className="relative rounded-xl flex flex-col h-full overflow-hidden"
      style={{
        padding: '20px',
        background: 'rgba(13, 17, 23, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
      }}
    >
      {/* Top subtle line */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-semibold text-white tracking-tight">
              Threat Activity & Mitigation Trend
            </h3>
            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/30">
              30-DAY
            </span>
          </div>
          {/* Summary stats */}
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[12px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Detected: <strong className="text-slate-200 font-mono font-medium">{totalThreats.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Mitigated: <strong className="text-slate-200 font-mono font-medium">{totalBlocked.toLocaleString()}</strong></span>
            </div>
            <span
              className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border"
              style={{
                background: 'rgba(52,211,153,0.06)',
                color: '#34d399',
                borderColor: 'rgba(52,211,153,0.18)',
              }}
            >
              {mitigationRate}% Defended
            </span>
          </div>
        </div>

        {/* View mode segmented control */}
        <div
          className="flex items-center gap-0.5 p-0.5 rounded-lg self-start sm:self-auto shrink-0 bg-slate-900/60"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {(['all', 'threats', 'blocked'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition-all duration-150 cursor-pointer capitalize"
              style={{
                background: viewMode === mode ? 'rgba(6,182,212,0.14)' : 'transparent',
                color: viewMode === mode ? '#22d3ee' : '#64748b',
                border: viewMode === mode ? '1px solid rgba(6,182,212,0.25)' : '1px solid transparent',
              }}
            >
              {mode === 'all' ? 'Combined' : mode === 'threats' ? 'Threats' : 'Mitigated'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[320px] w-full min-w-0">
        {isLoading ? (
          <div className="w-full h-full rounded-xl animate-pulse flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-[12px] font-mono text-slate-600">Loading telemetry data…</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -12, bottom: 4 }}>
              <defs>
                <linearGradient id="cyberThreatsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="65%" stopColor="#06b6d4" stopOpacity={0.04} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cyberBlockedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="65%" stopColor="#3b82f6" stopOpacity={0.03} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return isNaN(d.getTime()) ? v : `${d.getMonth() + 1}/${d.getDate()}`;
                }}
                interval="preserveStartEnd"
                minTickGap={32}
              />
              <YAxis
                width={34}
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {(viewMode === 'all' || viewMode === 'threats') && (
                <Area
                  type="monotone"
                  dataKey="threats"
                  name="Detected Threats"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#cyberThreatsGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#06b6d4', stroke: '#090b12', strokeWidth: 2 }}
                />
              )}

              {(viewMode === 'all' || viewMode === 'blocked') && (
                <Area
                  type="monotone"
                  dataKey="blocked"
                  name="Mitigated"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#cyberBlockedGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6', stroke: '#090b12', strokeWidth: 2 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
