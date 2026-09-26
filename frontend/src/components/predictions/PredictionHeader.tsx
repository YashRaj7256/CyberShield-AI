'use client';

import React from 'react';
import {
  RefreshCw,
  Brain,
  Play,
  Database,
  FlaskConical,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SIMULATION_PRESETS } from './prediction-helpers';

interface PredictionHeaderProps {
  inputMode: 'database' | 'simulation';
  onInputModeChange: (mode: 'database' | 'simulation') => void;
  windowHours: number;
  onWindowHoursChange: (hours: number) => void;
  isLoading: boolean;
  onRunPrediction: () => void;
  selectedPreset: string | null;
  onSelectPreset: (presetId: string) => void;
}

function StatusPill({
  label,
  value,
  online = true,
}: {
  label: string;
  value: string;
  online?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: online ? '#34d399' : '#f87171',
        }}
      />
      <span className="text-[11px] font-mono text-slate-500">{label}:</span>
      <span className="text-[11px] font-mono font-medium text-slate-300">
        {value}
      </span>
    </div>
  );
}

export function PredictionHeader({
  inputMode,
  onInputModeChange,
  windowHours,
  onWindowHoursChange,
  isLoading,
  onRunPrediction,
  selectedPreset,
  onSelectPreset,
}: PredictionHeaderProps) {
  const windowOptions = [
    { hours: 6, label: '6h' },
    { hours: 12, label: '12h' },
    { hours: 24, label: '24h' },
    { hours: 48, label: '48h' },
    { hours: 72, label: '72h' },
    { hours: 168, label: '7d' },
  ];

  return (
    <header className="space-y-4">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SOC Command Banner (Matching Overview Page Architecture)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          padding: '18px 22px',
          background: 'rgba(13, 17, 23, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        {/* Top accent — subtle 1px gradient line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/50 via-blue-500/30 to-transparent" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Brand + Status */}
          <div>
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(6,182,212,0.08)',
                  border: '1px solid rgba(6,182,212,0.2)',
                }}
              >
                <Brain className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-white tracking-tight">
                  AI Threat Prediction & Forecasting
                </h2>
                <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/30">
                  ML-PRECURSOR-V2
                </span>
              </div>
            </div>

            {/* System Status Row */}
            <div
              className="flex flex-wrap items-center gap-4 pt-2.5 mt-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
            >
              <StatusPill label="Defense Posture" value="Predictive" online={true} />
              <StatusPill
                label="Ingestion Mode"
                value={inputMode === 'database' ? 'MongoDB Telemetry' : 'Simulation Seed'}
                online={true}
              />
              <StatusPill label="Model Engine" value="CyberShield AI v2.4 (LSTM)" online={true} />
            </div>
          </div>

          {/* Right: Real-time Indicator */}
          <div className="hidden sm:flex items-center gap-2 self-start md:self-center px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-mono text-slate-400">
              Inference Stream Active
            </span>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Analysis Parameters Toolbar (Proper Buttons & Layout)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        style={{
          background: 'rgba(13, 17, 23, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        {/* Left Section: Feed Source Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Source:
            </span>
          </div>
          <div
            className="inline-flex items-center p-1 rounded-lg gap-1"
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            <button
              type="button"
              onClick={() => onInputModeChange('database')}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer"
              style={{
                background:
                  inputMode === 'database'
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'transparent',
                border:
                  inputMode === 'database'
                    ? '1px solid rgba(6, 182, 212, 0.35)'
                    : '1px solid transparent',
                color: inputMode === 'database' ? '#22d3ee' : '#94a3b8',
                boxShadow:
                  inputMode === 'database'
                    ? '0 0 10px rgba(6, 182, 212, 0.12)'
                    : 'none',
              }}
            >
              <Database className="w-3 h-3 shrink-0" />
              <span>Live Telemetry</span>
            </button>
            <button
              type="button"
              onClick={() => onInputModeChange('simulation')}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer"
              style={{
                background:
                  inputMode === 'simulation'
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'transparent',
                border:
                  inputMode === 'simulation'
                    ? '1px solid rgba(6, 182, 212, 0.35)'
                    : '1px solid transparent',
                color: inputMode === 'simulation' ? '#22d3ee' : '#94a3b8',
                boxShadow:
                  inputMode === 'simulation'
                    ? '0 0 10px rgba(6, 182, 212, 0.12)'
                    : 'none',
              }}
            >
              <FlaskConical className="w-3 h-3 shrink-0" />
              <span>Simulation</span>
            </button>
          </div>
        </div>

        {/* Center Section: Proper Segmented Lookback Window Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Window:
            </span>
          </div>

          <div
            className="inline-flex items-center p-1 rounded-lg gap-1.5"
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          >
            {windowOptions.map(({ hours, label }) => {
              const isActive = windowHours === hours;
              return (
                <button
                  key={hours}
                  type="button"
                  onClick={() => onWindowHoursChange(hours)}
                  disabled={isLoading}
                  className="h-8 min-w-[42px] px-2.5 rounded-md text-[12px] font-mono font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50"
                  style={{
                    background: isActive
                      ? 'rgba(6, 182, 212, 0.2)'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(6, 182, 212, 0.45)'
                      : '1px solid transparent',
                    color: isActive ? '#22d3ee' : '#94a3b8',
                    boxShadow: isActive
                      ? '0 0 10px rgba(6, 182, 212, 0.2)'
                      : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#f1f5f9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                  title={`Analyze telemetry over the last ${label}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section: Primary Action Button */}
        <div className="shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={onRunPrediction}
            disabled={isLoading}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[12px] font-mono font-semibold transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: '#22d3ee',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(6, 182, 212, 0.15)';
            }}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-cyan-400 ${
                isLoading ? 'animate-spin' : ''
              }`}
            />
            <span>{isLoading ? 'Forecasting...' : 'Run Prediction'}</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Simulation Presets Panel (Shown only in simulation mode)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {inputMode === 'simulation' && (
        <div
          className="rounded-xl p-4 space-y-3"
          style={{
            background: 'rgba(13, 17, 23, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>SELECT PRECURSOR SCENARIO PATTERN:</span>
            <span className="text-[10px] text-slate-500">
              Injects synthetic multi-stage precursors
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SIMULATION_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectPreset(preset.id)}
                  disabled={isLoading}
                  className="p-3.5 rounded-xl text-left transition-all border text-xs cursor-pointer"
                  style={{
                    background: isSelected
                      ? 'rgba(6,182,212,0.08)'
                      : 'rgba(255,255,255,0.02)',
                    borderColor: isSelected
                      ? 'rgba(6,182,212,0.35)'
                      : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-100 text-[13px] mb-1">
                    <Play className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                    <span>{preset.name}</span>
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
    </header>
  );
}
