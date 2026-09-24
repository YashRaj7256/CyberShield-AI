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
  const R = 40;
  const cx = 56;
  const cy = 52;
  const circumference = Math.PI * R; // half circle arc length
  const dashOffset = circumference * (1 - clampedScore / 100);

  // Color ramp: green → yellow → orange → red
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
    <div className="flex flex-col items-center mt-2 gap-1">
      <svg
        width={112}
        height={62}
        viewBox="0 0 112 62"
        fill="none"
        aria-label={`Risk score ${clampedScore} out of 100`}
      >
        {/* Track arc */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Value arc */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          stroke={gaugeColor}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={dashOffset}
          fill="none"
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1), stroke 0.4s' }}
        />
        {/* Score label */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="17"
          fontWeight="700"
          fontFamily="ui-monospace, monospace"
          fill="#f1f5f9"
        >
          {clampedScore}
        </text>
        <text
          x={cx}
          y={cy + 11}
          textAnchor="middle"
          fontSize="9"
          fontWeight="600"
          fontFamily="ui-monospace, monospace"
          fill="#64748b"
        >
          /100
        </text>
      </svg>
      {/* Risk label */}
      <span
        className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
        style={{
          color: gaugeColor,
          background: `${gaugeColor}14`,
          border: `1px solid ${gaugeColor}28`,
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
  // For security metrics, "up" = worse (more threats), except risk score where down = better
  const isPositiveChange = change >= 0;

  return (
    <div
      className={`group relative rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-200 ${
        pulse
          ? 'shadow-[0_0_24px_rgba(244,63,94,0.14)] ring-1 ring-rose-500/25'
          : ''
      }`}
      style={{
        padding: isScoreCard ? '24px 24px 20px' : '24px',
        minHeight: isScoreCard ? '210px' : '172px',
        background: 'rgba(11, 15, 25, 0.92)',
        border: pulse
          ? '1px solid rgba(244,63,94,0.35)'
          : '1px solid rgba(30, 41, 59, 0.9)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={(e) => {
        if (!pulse) {
          e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.9)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.28)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!pulse) {
          e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
          e.currentTarget.style.transform = 'none';
        }
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] opacity-80 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentColor} 45%, ${accentColor}88 80%, transparent 100%)`,
        }}
      />

      {/* Header: label + icon */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0 mt-0.5"
            style={{ background: accentColor }}
          />
          <span
            className="text-[11px] font-medium text-slate-400 truncate leading-snug"
            title={label}
          >
            {label}
          </span>
        </div>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
          style={{
            background: `${accentColor}12`,
            color: accentColor,
            border: `1px solid ${accentColor}28`,
          }}
        >
          {icon}
        </div>
      </div>

      {/* Risk gauge for score cards */}
      {isScoreCard ? (
        <div className="flex-1 flex items-center justify-center">
          <RiskGauge score={mounted ? displayValue : 0} />
        </div>
      ) : (
        /* Primary metric value */
        <div className="flex items-baseline gap-1.5 my-3">
          <span
            className={`text-[2.2rem] font-bold font-mono text-white tracking-tight leading-none ${
              mounted ? 'animate-counter' : ''
            }`}
          >
            {formatValue(displayValue)}
          </span>
          {suffix && (
            <span className="text-xs font-mono text-slate-500 leading-none mb-0.5">
              {suffix}
            </span>
          )}
        </div>
      )}

      {/* Footer: trend + sublabel */}
      <div
        className="flex items-center justify-between gap-2 pt-3 border-t"
        style={{ borderColor: 'rgba(30,41,59,0.7)' }}
      >
        {change !== undefined && (
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 font-mono font-semibold text-[11px] px-2 py-0.5 rounded-md"
              style={{
                background: isPositiveChange
                  ? change > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.08)'
                  : 'rgba(34,197,94,0.1)',
                color: isPositiveChange
                  ? change > 0 ? '#f87171' : '#64748b'
                  : '#4ade80',
                border: `1px solid ${
                  isPositiveChange
                    ? change > 0 ? 'rgba(239,68,68,0.22)' : 'rgba(148,163,184,0.15)'
                    : 'rgba(34,197,94,0.22)'
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
            <span className="text-slate-600 text-[10px] font-mono">vs 7d</span>
          </div>
        )}
        {sublabel && (
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 ml-auto">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
