'use client';

import React from 'react';
import { Brain, ScrollText, Clock, Cpu, Database } from 'lucide-react';

interface PredictionMetricsProps {
  scenariosCount: number;
  totalLogsAnalyzed: number;
  windowHours: number;
  processingTimeMs: number;
}

export function PredictionMetrics({
  scenariosCount,
  totalLogsAnalyzed,
  windowHours,
  processingTimeMs,
}: PredictionMetricsProps) {
  const cards = [
    {
      label: 'Forecast Scenarios',
      value: scenariosCount.toString(),
      icon: <Brain className="w-4 h-4" />,
      accentColor: '#06b6d4',
      badge: 'Active Threats',
    },
    {
      label: 'Ingested Telemetry Logs',
      value: totalLogsAnalyzed >= 1000 ? `${(totalLogsAnalyzed / 1000).toFixed(1)}K` : totalLogsAnalyzed.toString(),
      icon: <ScrollText className="w-4 h-4" />,
      accentColor: '#3b82f6',
      badge: 'Evaluated',
    },
    {
      label: 'Lookback Window',
      value: `${windowHours}h`,
      icon: <Clock className="w-4 h-4" />,
      accentColor: '#f59e0b',
      badge: 'Temporal Scope',
    },
    {
      label: 'Inference Latency',
      value: `${processingTimeMs}ms`,
      icon: <Cpu className="w-4 h-4" />,
      accentColor: '#10b981',
      badge: 'FastAPI Stream',
    },
  ];

  return (
    <div className="space-y-3">
      {/* Section Header matching Overview */}
      <div className="flex items-center gap-2">
        <Database className="w-3 h-3 text-slate-500" />
        <span className="text-[11px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-400">
          Key Performance Indicators
        </span>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="group relative rounded-xl flex flex-col justify-between overflow-hidden transition-all duration-150"
            style={{
              padding: '20px',
              minHeight: '160px',
              background: 'rgba(13, 17, 23, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            {/* 1. Header: Label + Accent Icon */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[12px] font-medium text-slate-400 truncate tracking-normal">
                {card.label}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                style={{
                  background: `${card.accentColor}0f`,
                  color: card.accentColor,
                  border: `1px solid ${card.accentColor}20`,
                }}
              >
                {card.icon}
              </div>
            </div>

            {/* 2. Middle: Large Monospace Value */}
            <div className="flex items-baseline gap-1.5 my-auto py-2">
              <span className="text-[2rem] sm:text-[2.2rem] font-bold font-mono text-white tracking-tight leading-none">
                {card.value}
              </span>
            </div>

            {/* 3. Footer: Divider + Context Badge */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.06] mt-auto">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-800">
                {card.badge}
              </span>
              <span className="text-slate-500 text-[10px] font-mono">Real-time</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
