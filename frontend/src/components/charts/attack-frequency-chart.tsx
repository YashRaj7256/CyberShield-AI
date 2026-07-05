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
  malware: '#f97316',
  phishing: '#eab308',
  ddos: '#8b5cf6',
  other: '#71717a',
};

const attackLabels: Record<string, string> = {
  bruteForce: 'Brute Force',
  malware: 'Malware',
  phishing: 'Phishing',
  ddos: 'DDoS',
  other: 'Other',
};

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; dataKey: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div
      className="px-4 py-3 rounded-xl"
      style={{
        background: 'rgba(17, 17, 24, 0.95)',
        border: '1px solid #2a2a3a',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
      }}
    >
      <p className="text-xs font-medium mb-2" style={{ color: '#71717a' }}>
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-sm" style={{ background: entry.color }} />
          <span style={{ color: '#a1a1aa' }}>
            {attackLabels[entry.dataKey] || entry.dataKey}:
          </span>
          <span className="font-semibold" style={{ color: '#e4e4e7' }}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AttackFrequencyChart({ data, isLoading }: AttackFrequencyChartProps) {
  const chartData = data ?? mockAttackFrequency;

  return (
    <div className="glass-card-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#e4e4e7' }}>
            Attack Frequency
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>
            Daily attack counts by type (14 days)
          </p>
        </div>
      </div>

      <div className="h-[280px]">
        {isLoading ? (
          <div
            className="w-full h-full rounded-lg animate-pulse"
            style={{ background: 'rgba(26, 26, 36, 0.6)' }}
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: '#2a2a3a' }}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {Object.keys(attackColors).map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={attackLabels[key]}
                  fill={attackColors[key]}
                  stackId="attacks"
                  radius={key === 'other' ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                  maxBarSize={24}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3">
        {Object.entries(attackLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: attackColors[key] }} />
            <span className="text-xs" style={{ color: '#71717a' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
