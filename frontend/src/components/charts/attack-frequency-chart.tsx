'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { mockAttackFrequency } from '@/lib/mock-data';
import type { AttackFrequency } from '@/types';

interface AttackFrequencyChartProps {
  data?: AttackFrequency[];
  isLoading?: boolean;
}

const attackColors: Record<string, string> = {
  bruteForce: '#ef4444',
  malware:    '#f97316',
  phishing:   '#eab308',
  ddos:       '#8b5cf6',
  other:      '#06b6d4',
};

const attackLabels: Record<string, string> = {
  bruteForce: 'Brute Force',
  malware:    'Malware',
  phishing:   'Phishing',
  ddos:       'DDoS / Flood',
  other:      'Other Tactics',
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; color: string; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;

  const totalEvents = payload.reduce((acc, curr) => acc + (curr.value || 0), 0);

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
        <span className="text-[11px] font-semibold text-slate-300 font-mono">{label}</span>
        <span className="text-[11px] font-mono text-slate-400">
          Total: <span className="text-white font-bold">{totalEvents}</span>
        </span>
      </div>
      <div className="space-y-1.5">
        {payload.map((entry, index) => {
          const pct = totalEvents > 0 ? Math.round((entry.value / totalEvents) * 100) : 0;
          return (
            <div key={index} className="flex items-center justify-between gap-8 text-[12px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm" style={{ background: entry.color }} />
                <span className="text-slate-400">{attackLabels[entry.dataKey] || entry.dataKey}:</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-white">{entry.value}</span>
                <span className="text-[10px] text-slate-500">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AttackFrequencyChart({ data, isLoading }: AttackFrequencyChartProps) {
  const chartData = data ?? mockAttackFrequency;

  const vectorTotals: Record<string, number> = {
    bruteForce: 0,
    malware:    0,
    phishing:   0,
    ddos:       0,
    other:      0,
  };

  chartData.forEach((row) => {
    vectorTotals.bruteForce += row.bruteForce || 0;
    vectorTotals.malware    += row.malware    || 0;
    vectorTotals.phishing   += row.phishing   || 0;
    vectorTotals.ddos       += row.ddos       || 0;
    vectorTotals.other      += row.other      || 0;
  });

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
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-white tracking-tight">
            Attack Frequency by Vector
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Exploits categorized by MITRE ATT&CK taxonomy
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
          5 VECTORS
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full min-w-0 flex-1">
        {isLoading ? (
          <div className="w-full h-full rounded-xl animate-pulse flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <span className="text-[12px] font-mono text-slate-600">Loading vectors…</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={chartData} margin={{ top: 12, right: 8, left: -12, bottom: 4 }}>
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
              />
              <YAxis
                width={34}
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {Object.keys(attackColors).map((key, index, arr) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={attackLabels[key]}
                  fill={attackColors[key]}
                  stackId="attacks"
                  radius={index === arr.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Vector legend */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-4 pt-4"
        style={{ borderTop: '1px solid rgba(30,41,59,0.7)' }}
      >
        {Object.entries(attackLabels).map(([key, label]) => {
          const color = attackColors[key];
          const count = vectorTotals[key] || 0;

          return (
            <div
              key={key}
              className="p-2.5 rounded-xl transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(30,41,59,0.9)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(51,65,85,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(30,41,59,0.9)'; }}
            >
              <div className="flex items-center gap-1.5 mb-1.5 min-w-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] font-medium text-slate-400 truncate">{label}</span>
              </div>
              <div className="text-[13px] font-mono font-bold text-slate-200">
                {count.toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
