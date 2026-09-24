'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { mockTopSources } from '@/lib/mock-data';
import { getSeverityColor } from '@/lib/format';
import type { TopSource } from '@/types';

interface TopSourcesChartProps {
  data?: TopSource[];
  isLoading?: boolean;
}

export default function TopSourcesChart({ data, isLoading }: TopSourcesChartProps) {
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const chartData = data ?? mockTopSources;
  const maxCount = chartData.length > 0 ? Math.max(...chartData.map((s) => s.count)) : 1;

  const handleCopy = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 1800);
  };

  return (
    <div
      className="relative rounded-2xl flex flex-col h-full overflow-hidden"
      style={{
        padding: '24px',
        background: 'rgba(11, 15, 25, 0.92)',
        border: '1px solid rgba(30, 41, 59, 0.9)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(51, 65, 85, 0.9)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(30, 41, 59, 0.9)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-white tracking-tight">
              Top Hostile Source Nodes
            </h3>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Ranked malicious IP infrastructure & threat risk
          </p>
        </div>
        <Link
          href="/logs"
          className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
        >
          <span>All Logs</span>
          <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Sources list */}
      <div className="space-y-2.5 flex-1">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(30,41,59,0.9)' }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className="h-3.5 rounded-lg animate-pulse"
                  style={{ width: `${140 - i * 10}px`, background: 'rgba(255,255,255,0.05)' }}
                />
                <div className="h-3.5 w-12 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
              <div className="h-1.5 rounded-full animate-pulse" style={{ width: `${100 - i * 12}%`, background: 'rgba(255,255,255,0.04)' }} />
            </div>
          ))
        ) : (
          chartData.slice(0, 5).map((source, index) => {
            const color = getSeverityColor(source.threatLevel);
            const width = Math.max(8, (source.count / maxCount) * 100);
            const isCopied = copiedIp === source.ip;

            return (
              <div
                key={index}
                className="group p-3.5 rounded-xl border transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(30,41,59,0.9)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(51,65,85,0.8)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(30,41,59,0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  {/* Left: rank + IP + copy + country */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-slate-600 w-4 text-center shrink-0">
                      #{index + 1}
                    </span>
                    <span className="text-[12px] font-bold font-mono text-slate-100 tracking-wide truncate">
                      {source.ip}
                    </span>
                    <button
                      onClick={() => handleCopy(source.ip)}
                      title="Copy IP Address"
                      className="p-0.5 rounded text-slate-600 hover:text-slate-300 transition-colors cursor-pointer shrink-0"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    <span
                      className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        color: '#64748b',
                      }}
                    >
                      {source.country || 'GLOBAL'}
                    </span>
                  </div>

                  {/* Right: severity + count */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                      style={{
                        background: `${color}12`,
                        color: color,
                        border: `1px solid ${color}28`,
                      }}
                    >
                      {source.threatLevel}
                    </span>
                    <span className="text-[12px] font-mono font-bold text-slate-200 min-w-[40px] text-right tabular-nums">
                      {source.count.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Progress bar — thicker */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${width}%`, background: color }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between text-[10px] text-slate-600 pt-3 mt-3"
        style={{ borderTop: '1px solid rgba(30,41,59,0.7)' }}
      >
        <span className="font-mono uppercase tracking-wider">Threat Reputation: High Risk</span>
        <span className="font-mono">{chartData.length} hostile nodes indexed</span>
      </div>
    </div>
  );
}
