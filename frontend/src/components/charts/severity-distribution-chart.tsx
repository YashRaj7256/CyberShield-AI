'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { mockSeverityDistribution } from '@/lib/mock-data';
import type { SeverityDistribution } from '@/types';

interface SeverityDistributionChartProps {
  data?: SeverityDistribution[];
  isLoading?: boolean;
}

const SEVERITY_CONFIG: Record<
  string,
  { bg: string; border: string; bar: string; text: string }
> = {
  Critical: { bg: 'rgba(239,68,68,0.07)', border: 'rgba(239,68,68,0.2)', bar: '#ef4444', text: '#f87171' },
  High:     { bg: 'rgba(249,115,22,0.07)', border: 'rgba(249,115,22,0.2)', bar: '#f97316', text: '#fb923c' },
  Medium:   { bg: 'rgba(234,179,8,0.07)',  border: 'rgba(234,179,8,0.2)',  bar: '#eab308', text: '#facc15' },
  Low:      { bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)',  bar: '#22c55e', text: '#4ade80' },
};

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  total: number;
}) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0];
  const pct = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';

  return (
    <div
      className="px-3.5 py-3 rounded-xl backdrop-blur-xl"
      style={{
        background: 'rgba(13, 17, 23, 0.97)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/[0.07]">
        <div className="w-2 h-2 rounded-full" style={{ background: data.payload.color }} />
        <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
          {data.name}
        </span>
      </div>
      <div className="space-y-1 text-[12px]">
        <div className="flex items-center justify-between gap-8">
          <span className="text-slate-400">Count:</span>
          <span className="font-mono font-bold text-white">{data.value.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-slate-400">Share:</span>
          <span className="font-mono font-bold text-cyan-400">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function SeverityDistributionChart({ data, isLoading }: SeverityDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartData = data ?? mockSeverityDistribution;
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className="relative rounded-2xl flex flex-col h-full overflow-hidden"
      style={{
        padding: '24px',
        background: 'rgba(11, 15, 25, 0.92)',
        border: '1px solid rgba(30, 41, 59, 0.9)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.9)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-white tracking-tight">
            Severity Distribution
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Active alerts by triage priority
          </p>
        </div>
        <span
          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded shrink-0"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#64748b',
          }}
        >
          4 TIERS
        </span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="relative h-[190px] w-[190px] mx-auto rounded-full animate-pulse border-[10px] border-slate-800 flex items-center justify-center">
            <span className="text-[11px] font-mono text-slate-600">Loading…</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[60px] rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Donut Chart */}
          <div className="relative h-[185px] w-full min-w-0 my-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      style={{
                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.45,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        filter: activeIndex === index ? `drop-shadow(0 0 8px ${entry.color}80)` : 'none',
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[26px] font-bold text-white font-mono tracking-tight leading-none">
                {total.toLocaleString()}
              </span>
              <span className="text-[9px] uppercase font-mono font-semibold tracking-wider text-slate-500 mt-1">
                Total Incidents
              </span>
            </div>
          </div>

          {/* Severity breakdown */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {chartData.map((item) => {
              const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
              const cfg = SEVERITY_CONFIG[item.name] ?? {
                bg: 'rgba(255,255,255,0.02)',
                border: 'rgba(255,255,255,0.07)',
                bar: item.color,
                text: item.color,
              };

              return (
                <div
                  key={item.name}
                  className="p-3 rounded-xl border transition-all duration-150"
                  style={{ background: cfg.bg, borderColor: cfg.border }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-[11px] font-medium text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="text-[11px] font-mono font-bold ml-1" style={{ color: cfg.text }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="text-[13px] font-mono font-bold text-white mb-2 leading-none">
                    {item.value.toLocaleString()}
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, background: cfg.bar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
