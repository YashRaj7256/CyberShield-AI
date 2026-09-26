'use client';

import React from 'react';
import type { PredictionScenario } from '@/types';
import { ForecastCard } from './ForecastCard';
import { Sparkles } from 'lucide-react';

interface ForecastListProps {
  predictions: PredictionScenario[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function ForecastList({
  predictions,
  selectedIndex,
  onSelect,
}: ForecastListProps) {
  return (
    <div className="space-y-3">
      {/* Header matching CyberShield AI Overview section style */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-400">
            Predicted Threats ({predictions.length})
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">
          Ranked by likelihood
        </span>
      </div>

      {/* Cards Queue with comfortable up-down spacing */}
      <div className="space-y-4 sm:space-y-4.5">
        {predictions.map((item, idx) => (
          <ForecastCard
            key={idx}
            item={item}
            isSelected={idx === selectedIndex}
            onClick={() => onSelect(idx)}
          />
        ))}
      </div>
    </div>
  );
}
