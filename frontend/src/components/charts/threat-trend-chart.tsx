'use client';

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

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; name: string }>; label?: string }) {
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
        <div key={index} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: '#a1a1aa' }}>{entry.name}:</span>
          <span className="font-semibold" style={{ color: '#e4e4e7' }}>
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ThreatTrendChart({ data, isLoading }: ThreatTrendChartProps) {
  const chartData = data ?? mockThreatTrend;

  return (
    <div
      className="glass-card-sm p-5"
      style={{ borderTop: '1px solid rgba(6, 182, 212, 0.2)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#e4e4e7' }}>
            Threat Activity Trend
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>
            Last 30 days
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#06b6d4' }} />
            <span className="text-xs" style={{ color: '#71717a' }}>Threats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
            <span className="text-xs" style={{ color: '#71717a' }}>Blocked</span>
          </div>
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
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                interval={4}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="threats"
                name="Threats"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="url(#gradientThreats)"
                dot={false}
                activeDot={{ r: 4, fill: '#06b6d4', stroke: '#111118', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="blocked"
                name="Blocked"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradientBlocked)"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', stroke: '#111118', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
