'use client';

import React from 'react';
import type { PredictionScenario, LogSeverity } from '@/types';
import { formatAttackTypeName } from './prediction-helpers';
import { ArrowUpRight } from 'lucide-react';

interface ForecastCardProps {
  item: PredictionScenario;
  isSelected: boolean;
  onClick: () => void;
}

const severityConfig: Record<
  LogSeverity,
  { bg: string; border: string; text: string; bar: string }
> = {
  CRITICAL: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
    text: '#f87171',
    bar: '#ef4444',
  },
  HIGH: {
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.25)',
    text: '#fb923c',
    bar: '#f97316',
  },
  MEDIUM: {
    bg: 'rgba(234,179,8,0.12)',
    border: 'rgba(234,179,8,0.25)',
    text: '#facc15',
    bar: '#eab308',
  },
  LOW: {
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.25)',
    text: '#4ade80',
    bar: '#22c55e',
  },
};

export function ForecastCard({
  item,
  isSelected,
  onClick,
}: ForecastCardProps) {
  const probPercent = Math.round(item.probability * 100);
  const confPercent = Math.round(item.confidence * 100);
  const config = severityConfig[item.severity] || severityConfig.MEDIUM;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl cursor-pointer transition-all duration-150 p-4 sm:p-5 flex flex-col justify-between"
      style={{
        background: isSelected ? 'rgba(6, 182, 212, 0.05)' : 'rgba(13, 17, 23, 0.92)',
        border: isSelected
          ? '1px solid rgba(6, 182, 212, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.07)',
        boxShadow: isSelected ? '0 0 16px rgba(6, 182, 212, 0.1)' : 'none',
      }}
    >
      {/* 1. Header: Attack Name & Severity Badge */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <h4 className="text-[14px] sm:text-[15px] font-semibold text-white tracking-tight leading-snug">
          {formatAttackTypeName(item.attack_type)}
        </h4>
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
          style={{
            background: config.bg,
            border: `1px solid ${config.border}`,
            color: config.text,
          }}
        >
          {item.severity}
        </span>
      </div>

      {/* 2. Likelihood readout & slim bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-[12px] font-mono">
          <span className="text-slate-300">{probPercent}% likelihood</span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{ background: 'rgba(255, 255, 255, 0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${probPercent}%`, background: config.bar }}
          />
        </div>
      </div>

      {/* 3. Footer: Confidence, Timeframe & Action */}
      <div
        className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2.5"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        <span>
          {confPercent}% conf · {item.timeframe}
        </span>
        <span
          className="inline-flex items-center gap-1 font-mono transition-colors"
          style={{ color: isSelected ? '#22d3ee' : '#64748b' }}
        >
          <span>Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
