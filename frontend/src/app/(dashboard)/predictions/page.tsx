'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import type { PredictionScenario, PredictionResponse } from '@/types';
import {
  PredictionHeader,
  PredictionMetrics,
  ForecastList,
  ThreatBrief,
  SIMULATION_PRESETS,
} from '@/components/predictions';

export default function PredictionsPage() {
  const [windowHours, setWindowHours] = useState<number>(24);
  const [inputMode, setInputMode] = useState<'database' | 'simulation'>('database');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PredictionResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [resolvedActions, setResolvedActions] = useState<Record<string, boolean>>({});

  // --------------------------------------------------------------------------
  // Execute Prediction API Request
  // --------------------------------------------------------------------------
  const executePrediction = useCallback(
    async (overrideLogs?: Record<string, unknown>[]) => {
      setIsLoading(true);
      setError(null);

      try {
        const payload: {
          windowHours: number;
          useDatabaseLogs: boolean;
          logs?: Record<string, unknown>[];
        } = {
          windowHours,
          useDatabaseLogs: inputMode === 'database' && !overrideLogs,
        };

        if (overrideLogs && overrideLogs.length > 0) {
          payload.logs = overrideLogs;
          payload.useDatabaseLogs = false;
        }

        const res = await api.post<PredictionResponse>('/predictions', payload);

        if (res && res.predictions) {
          setData(res);
          setSelectedIndex(0);
          setResolvedActions({});
        } else {
          throw new Error('Invalid response structure received from prediction engine');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(
          msg.includes('unavailable') || msg.includes('502') || msg.includes('Failed to fetch')
            ? 'Prediction service is currently unavailable. Please verify the ML service is running.'
            : msg
        );
      } finally {
        setIsLoading(false);
      }
    },
    [windowHours, inputMode]
  );

  // Run baseline forecast on mount
  useEffect(() => {
    executePrediction();
  }, [executePrediction]);

  // Handle simulation preset selection
  const handlePresetRun = (presetId: string) => {
    const preset = SIMULATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(presetId);
    executePrediction(preset.logs);
  };

  const handleInputModeChange = (mode: 'database' | 'simulation') => {
    setInputMode(mode);
    if (mode === 'database') {
      setSelectedPreset(null);
    }
  };

  const toggleAction = (actionText: string) => {
    setResolvedActions((prev) => ({
      ...prev,
      [actionText]: !prev[actionText],
    }));
  };

  const activeScenario: PredictionScenario | undefined =
    data?.predictions?.[selectedIndex] || data?.predictions?.[0];

  return (
    <div className="space-y-7 animate-fade-in pb-16">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. SOC Command Header (Matching Overview Design Language)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <PredictionHeader
        inputMode={inputMode}
        onInputModeChange={handleInputModeChange}
        windowHours={windowHours}
        onWindowHoursChange={(hours) => setWindowHours(hours)}
        isLoading={isLoading}
        onRunPrediction={() => executePrediction()}
        selectedPreset={selectedPreset}
        onSelectPreset={handlePresetRun}
      />

      {/* Error Alert Banner */}
      {error && (
        <div
          className="p-4 rounded-xl flex items-center justify-between gap-3 text-xs"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#f87171',
          }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => executePrediction()}
            className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Key Performance Indicators (Matching Overview StatCards)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      {data && (
        <PredictionMetrics
          scenariosCount={data.predictions.length}
          totalLogsAnalyzed={data.total_logs_analyzed}
          windowHours={data.analysis_window_hours}
          processingTimeMs={data.processing_time_ms}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && !data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-pulse pt-2">
          <div className="lg:col-span-5 space-y-3">
            <div
              className="h-28 rounded-xl"
              style={{
                background: 'rgba(13, 17, 23, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            />
            <div
              className="h-28 rounded-xl"
              style={{
                background: 'rgba(13, 17, 23, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            />
            <div
              className="h-28 rounded-xl"
              style={{
                background: 'rgba(13, 17, 23, 0.92)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
              }}
            />
          </div>
          <div
            className="lg:col-span-7 h-[380px] rounded-xl"
            style={{
              background: 'rgba(13, 17, 23, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
            }}
          />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Forecast Workspace: Master-Detail Two Column View          */}
      {/* ───────────────────────────────────────────────────────────── */}
      {data && data.predictions && data.predictions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2 sm:pt-4">
          {/* Left Column: Forecast Scenarios List (~40%) - shifted right from edge */}
          <div className="lg:col-span-5 min-w-0 pl-1 sm:pl-2.5">
            <ForecastList
              predictions={data.predictions}
              selectedIndex={selectedIndex}
              onSelect={(idx) => setSelectedIndex(idx)}
            />
          </div>

          {/* Right Column: Threat Detail Brief (~60%) */}
          {activeScenario && (
            <div className="lg:col-span-7 min-w-0 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[11px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-400">
                    Incident Dossier & Remediation
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  Targeted Analysis
                </span>
              </div>
              <ThreatBrief
                scenario={activeScenario}
                resolvedActions={resolvedActions}
                onToggleAction={toggleAction}
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State when no scenarios are forecasted */}
      {data && data.predictions && data.predictions.length === 0 && (
        <div
          className="p-10 rounded-xl text-center space-y-3"
          style={{
            background: 'rgba(13, 17, 23, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto text-emerald-400 bg-emerald-950/40 border border-emerald-800/40">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            No Threat Precursor Sequences Detected
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Telemetry evaluated over the last {windowHours}h shows normal variance. No anomalous multi-stage attack trajectories currently exceed the projection threshold.
          </p>
        </div>
      )}
    </div>
  );
}
