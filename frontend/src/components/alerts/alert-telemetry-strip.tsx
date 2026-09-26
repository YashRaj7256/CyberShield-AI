'use client';

import React from 'react';
import { Shield, Globe, Terminal, Clock } from 'lucide-react';
import { parseAlertDescription, ParsedAlertDescription } from '@/lib/alert-parser';

interface AlertTelemetryStripProps {
  description?: string;
  title?: string;
  alertType?: string;
  sourceIp?: string;
  mode?: 'full' | 'compact';
}

export default function AlertTelemetryStrip({
  description,
  title,
  alertType,
  sourceIp,
  mode = 'full',
}: AlertTelemetryStripProps) {
  const parsed: ParsedAlertDescription = parseAlertDescription(description, title, alertType, sourceIp);

  if (mode === 'compact') {
    return (
      <div className="space-y-1.5">
        <p className="text-[12px] text-slate-300 line-clamp-2 leading-relaxed font-normal">
          {parsed.narrative}
        </p>

        {parsed.hasStructuredData && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {parsed.detector && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                <Shield className="w-2.5 h-2.5 text-cyan-400" />
                {parsed.detector}
              </span>
            )}
            {parsed.country && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                <Globe className="w-2.5 h-2.5 text-emerald-400" />
                {parsed.country}
              </span>
            )}
            {parsed.sourceIp && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800/60 text-slate-300 border border-white/[0.08]">
                <Terminal className="w-2.5 h-2.5 text-amber-400" />
                {parsed.sourceIp}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Narrative sentence */}
      <p className="text-[12.5px] text-slate-200 leading-relaxed font-normal">
        {parsed.narrative}
      </p>

      {/* Telemetry metadata grid */}
      {parsed.hasStructuredData && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {parsed.detector && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.08]">
              <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Sensor</div>
                <div className="text-[11px] font-mono text-cyan-300 font-medium truncate">{parsed.detector}</div>
              </div>
            </div>
          )}

          {parsed.country && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.08]">
              <div className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Origin</div>
                <div className="text-[11px] font-medium text-emerald-300 truncate">{parsed.country}</div>
              </div>
            </div>
          )}

          {parsed.sourceIp && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.08]">
              <div className="p-1 rounded bg-amber-500/10 text-amber-400">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Source IP</div>
                <div className="text-[11px] font-mono text-amber-300 truncate">{parsed.sourceIp}</div>
              </div>
            </div>
          )}

          {parsed.timestamp && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.08]">
              <div className="p-1 rounded bg-purple-500/10 text-purple-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Detected At</div>
                <div className="text-[11px] font-mono text-slate-300 truncate">{parsed.timestamp}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
