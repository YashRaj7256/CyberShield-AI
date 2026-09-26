'use client';

import React, { useState } from 'react';
import type { PredictionScenario, LogSeverity } from '@/types';
import { formatAttackTypeName, getMitreTechnique } from './prediction-helpers';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ThreatBriefProps {
  scenario: PredictionScenario;
  resolvedActions: Record<string, boolean>;
  onToggleAction: (actionText: string) => void;
}

const severityConfig: Record<
  LogSeverity,
  { bg: string; border: string; text: string }
> = {
  CRITICAL: {
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
    text: '#f87171',
  },
  HIGH: {
    bg: 'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.25)',
    text: '#fb923c',
  },
  MEDIUM: {
    bg: 'rgba(234,179,8,0.12)',
    border: 'rgba(234,179,8,0.25)',
    text: '#facc15',
  },
  LOW: {
    bg: 'rgba(34,197,94,0.12)',
    border: 'rgba(34,197,94,0.25)',
    text: '#4ade80',
  },
};

export function ThreatBrief({
  scenario,
  resolvedActions,
  onToggleAction,
}: ThreatBriefProps) {
  const [showTechnical, setShowTechnical] = useState<boolean>(false);

  const probPercent = Math.round(scenario.probability * 100);
  const confPercent = Math.round(scenario.confidence * 100);
  const sev = severityConfig[scenario.severity] || severityConfig.MEDIUM;
  const mitre = getMitreTechnique(scenario.attack_type);

  const completedCount = scenario.countermeasures.filter(
    (cm) => !!resolvedActions[cm]
  ).length;

  return (
    <div
      className="relative rounded-xl overflow-hidden space-y-5 lg:sticky lg:top-6"
      style={{
        padding: '22px 24px',
        background: 'rgba(13, 17, 23, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      {/* Top accent — subtle 1px gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/50 via-blue-500/30 to-transparent" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Header: Threat Name & Clean Status Meta Strip              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="space-y-2 pb-3.5"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
      >
        <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight leading-snug">
          {formatAttackTypeName(scenario.attack_type)}
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{
              background: sev.bg,
              border: `1px solid ${sev.border}`,
              color: sev.text,
            }}
          >
            {scenario.severity}
          </span>
          <span className="text-slate-600 font-mono">·</span>
          <span className="text-[12px] font-mono font-semibold text-slate-200">
            {probPercent}% likelihood
          </span>
          <span className="text-slate-600 font-mono">·</span>
          <span className="text-[11px] font-mono text-slate-400">
            {scenario.timeframe} window
          </span>
          <span className="text-slate-600 font-mono">·</span>
          <span className="text-[11px] font-mono text-slate-500">
            {confPercent}% confidence
          </span>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Narrative Summary                                          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-500">
          Why this prediction?
        </span>
        <p className="text-[13px] text-slate-300 leading-relaxed font-normal">
          {scenario.description}
        </p>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. Observed Evidence (Clean Bulleted List, not heavy boxes)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="space-y-2 pt-3"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-500">
            Observed Precursor Evidence ({scenario.indicators.length})
          </span>
          <span className="text-[10px] font-mono text-slate-500">Telemetry Ingestion</span>
        </div>

        <ul className="space-y-1.5 pl-0.5">
          {scenario.indicators && scenario.indicators.length > 0 ? (
            scenario.indicators.map((ind, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-[12px] leading-relaxed text-slate-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <span className="flex-1">{ind}</span>
              </li>
            ))
          ) : (
            <li className="text-[12px] text-slate-500 italic">
              No specific precursor telemetry logged.
            </li>
          )}
        </ul>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. Affected Assets (Clean, Compact Monospace Tags)            */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="space-y-2 pt-3"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-500">
            Affected Targets ({scenario.affected_assets?.length || 0})
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {scenario.affected_assets && scenario.affected_assets.length > 0 ? (
            scenario.affected_assets.map((asset, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                {asset}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-500 font-mono">
              Perimeter-wide threat (No specific host isolated)
            </span>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. Recommended Actions (Clean Interactive Checklist)          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="space-y-2 pt-3"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold tracking-[0.14em] uppercase text-slate-500">
            Recommended SOC Actions
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {completedCount} / {scenario.countermeasures.length} Done
          </span>
        </div>

        <div className="space-y-1">
          {scenario.countermeasures.map((cm, i) => {
            const isDone = !!resolvedActions[cm];
            const checkboxId = `action-${i}`;
            return (
              <label
                key={i}
                htmlFor={checkboxId}
                className="flex items-start gap-2.5 py-1.5 px-2 rounded-md hover:bg-white/[0.03] transition-colors cursor-pointer"
              >
                <div className="mt-0.5 shrink-0">
                  <Checkbox
                    id={checkboxId}
                    checked={isDone}
                    onCheckedChange={() => onToggleAction(cm)}
                  />
                </div>
                <span
                  className={`text-[12px] leading-relaxed cursor-pointer select-none ${
                    isDone ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {cm}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 6. Expandable: Technical Metadata (MITRE ATT&CK)               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="pt-2.5"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        <button
          type="button"
          onClick={() => setShowTechnical(!showTechnical)}
          className="flex items-center gap-1.5 text-[11px] font-mono transition-colors cursor-pointer py-1"
          style={{ color: '#22d3ee' }}
        >
          {showTechnical ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
          <span>{showTechnical ? 'Hide Technical Metadata' : 'View Technical Metadata (MITRE ATT&CK)'}</span>
        </button>

        {showTechnical && (
          <div
            className="mt-2.5 p-3 rounded-lg space-y-1.5 text-[11px] font-mono text-slate-300"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
              <span className="text-slate-500">MITRE Technique:</span>
              <span className="text-cyan-400 font-semibold">
                {mitre.id} — {mitre.name}
              </span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
              <span className="text-slate-500">Tactic:</span>
              <span className="text-white">{mitre.tactic}</span>
            </div>
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.04]">
              <span className="text-slate-500">Model Confidence:</span>
              <span className="text-white">{confPercent}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Internal ID:</span>
              <span className="text-slate-400">{scenario.attack_type}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
