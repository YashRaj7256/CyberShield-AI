'use client';

import React from 'react';
import { SIMULATION_PRESETS } from './prediction-helpers';
import { SlidersHorizontal, Beaker } from 'lucide-react';

interface PredictionControlsProps {
  windowHours: number;
  onWindowHoursChange: (hours: number) => void;
  inputMode: 'database' | 'simulation';
  onInputModeChange: (mode: 'database' | 'simulation') => void;
  selectedPreset: string | null;
  onSelectPreset: (presetId: string) => void;
  isLoading: boolean;
}

export function PredictionControls({
  windowHours,
  onWindowHoursChange,
  inputMode,
  onInputModeChange,
  selectedPreset,
  onSelectPreset,
  isLoading,
}: PredictionControlsProps) {
  const windowOptions = [6, 12, 24, 48, 72, 168];

  return (
    <div className="space-y-3">
      {/* Parameter Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-900/40 border border-slate-800/70">
        {/* Analysis Window Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Lookback Scope:</span>
          </span>
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-950/70 border border-slate-800/80 gap-1">
            {windowOptions.map((hours) => (
              <button
                key={hours}
                onClick={() => onWindowHoursChange(hours)}
                disabled={isLoading}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-all cursor-pointer ${
                  windowHours === hours
                    ? 'bg-slate-800 text-cyan-400 font-semibold shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {hours === 168 ? '7d' : `${hours}h`}
              </button>
            ))}
          </div>
        </div>

        {/* Telemetry Ingestion Mode */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 shrink-0">
            <Beaker className="w-3.5 h-3.5 text-slate-500" />
            <span>Feed Source:</span>
          </span>
          <div className="inline-flex items-center p-1 rounded-lg bg-slate-950/70 border border-slate-800/80 gap-1">
            <button
              onClick={() => onInputModeChange('database')}
              className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                inputMode === 'database'
                  ? 'bg-slate-800 text-slate-200 font-medium shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Telemetry
            </button>
            <button
              onClick={() => onInputModeChange('simulation')}
              className={`px-3 py-1 rounded-md text-xs transition-all cursor-pointer ${
                inputMode === 'simulation'
                  ? 'bg-slate-800 text-slate-200 font-medium shadow-sm border border-slate-700/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulation Seeds
            </button>
          </div>
        </div>
      </div>

      {/* Simulation Presets (Shown only when in simulation mode) */}
      {inputMode === 'simulation' && (
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/70 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>INJECT PRECURSOR PATTERN SEED:</span>
            <span className="text-[11px] text-slate-500">Injects synthetic multi-stage precursors</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SIMULATION_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset.id)}
                  disabled={isLoading}
                  className={`p-3.5 rounded-xl text-left transition-all border text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/80 border-cyan-500/60 text-white shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/50 border-slate-800/70 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium text-slate-200 mb-1">
                    <Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="font-semibold">{preset.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
