'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  change?: number;
  accentColor: string;
  format?: 'number' | 'score';
  pulse?: boolean;
  suffix?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  change = 0,
  accentColor,
  format = 'number',
  pulse = false,
  suffix = '',
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Animated counter
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, value);
      setDisplayValue(Math.floor(current));

      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatValue = (v: number) => {
    if (format === 'score') return v.toFixed(1);
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return v.toLocaleString();
  };

  const isPositiveChange = change >= 0;

  return (
    <div
      className={`glass-card-sm p-4 sm:p-5 stat-card-hover relative overflow-hidden flex flex-col justify-between rounded-2xl border border-white/[0.08] transition-all min-w-0 ${
        pulse ? 'animate-border-glow' : ''
      }`}
      style={{
        borderLeft: `4px solid ${accentColor}`,
        background: '#0d121f',
      }}
    >
      {/* Subtle accent glow in top right */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-15 blur-2xl pointer-events-none"
        style={{ background: accentColor }}
      />

      {/* Top Header: Label & Icon */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span
          className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate flex-1 min-w-0"
          title={label}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${accentColor}18`,
            color: accentColor,
            border: `1px solid ${accentColor}30`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Main Value */}
      <div className="flex items-baseline gap-1.5 my-1">
        <span
          className={`text-2xl lg:text-3xl font-extrabold tracking-tight text-white ${
            mounted ? 'animate-counter' : ''
          }`}
        >
          {formatValue(displayValue)}
        </span>
        {suffix && (
          <span className="text-xs font-semibold text-slate-400">
            {suffix}
          </span>
        )}
      </div>

      {/* Bottom Trend indicator */}
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-white/[0.06] text-[11px]">
          <span
            className="inline-flex items-center gap-0.5 font-bold shrink-0"
            style={{
              color: isPositiveChange ? (change > 0 ? '#ef4444' : '#94a3b8') : '#22c55e',
            }}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-3 h-3 shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 shrink-0" />
            )}
            <span>
              {isPositiveChange ? '+' : ''}
              {change}%
            </span>
          </span>
          <span className="text-slate-500 text-[10px] tracking-tight truncate">vs last week</span>
        </div>
      )}
    </div>
  );
}
