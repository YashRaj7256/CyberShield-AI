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
      className={`glass-card-sm p-5 stat-card-hover relative overflow-hidden ${pulse ? 'animate-border-glow' : ''}`}
      style={{
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.05] blur-[40px]"
        style={{ background: accentColor }}
      />

      <div className="flex items-start justify-between relative">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#71717a' }}>
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className={`text-2xl font-bold ${mounted ? 'animate-counter' : ''}`}
              style={{ color: '#e4e4e7' }}
            >
              {formatValue(displayValue)}
            </span>
            {suffix && (
              <span className="text-sm font-medium" style={{ color: '#71717a' }}>
                {suffix}
              </span>
            )}
          </div>

          {/* Change indicator */}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {isPositiveChange ? (
                <TrendingUp className="w-3 h-3" style={{ color: change > 0 ? '#ef4444' : '#71717a' }} />
              ) : (
                <TrendingDown className="w-3 h-3" style={{ color: '#22c55e' }} />
              )}
              <span
                className="text-xs font-medium"
                style={{ color: isPositiveChange ? (change > 0 ? '#ef4444' : '#71717a') : '#22c55e' }}
              >
                {isPositiveChange ? '+' : ''}
                {change}%
              </span>
              <span className="text-xs" style={{ color: '#71717a' }}>
                vs last week
              </span>
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${accentColor}15`,
            color: accentColor,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
