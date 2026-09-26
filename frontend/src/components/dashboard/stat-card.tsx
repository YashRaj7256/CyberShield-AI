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
  sublabel?: string;
}

// ---------------------------------------------------------------------------
// Mini SVG arc gauge — used for the Threat Risk Posture card
// ---------------------------------------------------------------------------

function RiskGauge({ score }: { score: number }) {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));
  // SVG arc parameters — half-circle (180°)
  const R = 38;
  const cx = 56;
  const cy = 46;
  const circumference = Math.PI * R;
  const dashOffset = circumference * (1 - clampedScore / 100);

  // Semantic color ramp: green → yellow → orange → red
  const gaugeColor =
    clampedScore >= 75 ? '#ef4444'
    : clampedScore >= 50 ? '#f97316'
    : clampedScore >= 30 ? '#eab308'
    : '#22c55e';

  const riskLabel =
    clampedScore >= 75 ? 'Elevated'
    : clampedScore >= 50 ? 'Guarded'
    : clampedScore >= 30 ? 'Moderate'
    : 'Low Risk';

  return (
    <div className="flex flex-col items-center justify-center my-auto">
      <div className="relative flex items-center justify-center">
        <svg
          width={112}
          height={56}
          viewBox="0 0 112 56"
          fill="none"
          aria-label={`Risk score ${clampedScore} out of 100`}
        >
          {/* Track arc */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Value arc */}
          <path
            d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
            stroke={gaugeColor}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={dashOffset}
            fill="none"
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
          />
          {/* Prominent score number */}
          <text
            x={cx}
            y={cy - 2}
            textAnchor="middle"
            fontSize="21"
            fontWeight="700"
            fontFamily="ui-monospace, monospace"
            fill="#f8fafc"
          >
            {clampedScore}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fontSize="9"
            fontWeight="500"
            fontFamily="ui-monospace, monospace"
            fill="#64748b"
          >
            /100
          </text>
        </svg>
      </div>

      {/* Prominent severity state */}
      <span
        className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5"
        style={{
          color: gaugeColor,
          background: `${gaugeColor}14`,
          border: `1px solid ${gaugeColor}24`,
        }}
      >
        {riskLabel}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

export default function StatCard({
  label,
  value,
  icon,
  change = 0,
  accentColor,
  format = 'number',
  pulse = false,
  suffix = '',
  sublabel,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const duration = 900;
    const steps = 28;
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

  const isScoreCard = format === 'score';
  const isPositiveChange = change >= 0;

  return (
    <div
      className={`group relative rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-150 ${
        pulse
          ? 'border border-rose-500/35 bg-[rgba(13,17,23,0.92)] shadow-[0_0_16px_rgba(244,63,94,0.08)]'
          : 'border border-white/[0.07] bg-[rgba(13,17,23,0.92)] hover:border-white/[0.12] hover:bg-[rgba(15,20,28,0.95)]'
      }`}
      style={{
        padding: '20px',
        minHeight: '176px',
        height: '100%',
      }}
    >
      {/* 1. Header: Metric Label + Subtle Icon Container */}
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-[12px] font-medium text-slate-400 truncate tracking-normal"
          title={label}
        >
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
          style={{
            background: `${accentColor}0f`,
            color: accentColor,
            border: `1px solid ${accentColor}20`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* 2. Middle Value Area: Primary Metric Number (or centered gauge) */}
      {isScoreCard ? (
        <div className="flex-1 flex items-center justify-center my-auto py-1">
          <RiskGauge score={mounted ? displayValue : 0} />
        </div>
      ) : (
        <div className="flex items-baseline gap-1.5 my-auto py-2">
          <span
            className={`text-[2rem] sm:text-[2.2rem] font-bold font-mono text-white tracking-tight leading-none ${
              mounted ? 'animate-counter' : ''
            }`}
          >
            {formatValue(displayValue)}
          </span>
          {suffix && (
            <span className="text-xs font-mono text-slate-500 leading-none">
              {suffix}
            </span>
          )}
        </div>
      )}

      {/* 3. Divider + 4. Footer: Trend badge & context */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06] mt-auto">
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 font-mono font-medium text-[11px] px-1.5 py-0.5 rounded"
              style={{
                background: isPositiveChange
                  ? change > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(148,163,184,0.06)'
                  : 'rgba(34,197,94,0.08)',
                color: isPositiveChange
                  ? change > 0 ? '#f87171' : '#94a3b8'
                  : '#4ade80',
                border: `1px solid ${
                  isPositiveChange
                    ? change > 0 ? 'rgba(239,68,68,0.18)' : 'rgba(148,163,184,0.12)'
                    : 'rgba(34,197,94,0.18)'
                }`,
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
            <span className="text-slate-500 text-[10px] font-mono">vs 7d</span>
          </div>
        )}
        {sublabel && (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800 ml-auto">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
