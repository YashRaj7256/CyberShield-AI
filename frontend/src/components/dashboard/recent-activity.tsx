'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Bug,
  Mail,
  Wifi,
  AlertTriangle,
  Lock,
  Zap,
  FileWarning,
  UserCheck,
  Search,
  KeyRound,
  Eye,
  Activity,
  Copy,
  Check,
  ArrowUpRight,
  Terminal,
} from 'lucide-react';
import { mockRecentActivity } from '@/lib/mock-data';
import { formatRelativeTime, getSeverityColor } from '@/lib/format';
import type { LogSeverity, RecentActivity as RecentActivityType } from '@/types';

interface RecentActivityProps {
  data?: RecentActivityType[];
  isLoading?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  BRUTE_FORCE:          <Lock className="w-3.5 h-3.5" />,
  MALWARE:              <Bug className="w-3.5 h-3.5" />,
  PHISHING:             <Mail className="w-3.5 h-3.5" />,
  DDOS:                 <Wifi className="w-3.5 h-3.5" />,
  ANOMALY:              <AlertTriangle className="w-3.5 h-3.5" />,
  UNAUTHORIZED_ACCESS:  <ShieldAlert className="w-3.5 h-3.5" />,
  DATA_EXFILTRATION:    <Zap className="w-3.5 h-3.5" />,
  POLICY_VIOLATION:     <FileWarning className="w-3.5 h-3.5" />,
  SUSPICIOUS_LOGIN:     <Eye className="w-3.5 h-3.5" />,
  PORT_SCAN:            <Search className="w-3.5 h-3.5" />,
  CREDENTIAL_STUFFING:  <KeyRound className="w-3.5 h-3.5" />,
  INSIDER_THREAT:       <ShieldAlert className="w-3.5 h-3.5" />,
  LOGIN_FAILURE:        <Lock className="w-3.5 h-3.5" />,
  LOGIN_SUCCESS:        <UserCheck className="w-3.5 h-3.5" />,
  CONNECTION_ATTEMPT:   <Activity className="w-3.5 h-3.5" />,
};

type SeverityFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

const SEVERITY_FILTER_COLORS: Record<SeverityFilter, { active: string; border: string }> = {
  ALL:      { active: 'rgba(6,182,212,0.15)',  border: 'rgba(6,182,212,0.3)' },
  CRITICAL: { active: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)' },
  HIGH:     { active: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' },
  MEDIUM:   { active: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)' },
  LOW:      { active: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)' },
};

const SEVERITY_TEXT_COLORS: Record<SeverityFilter, string> = {
  ALL:      '#22d3ee',
  CRITICAL: '#f87171',
  HIGH:     '#fb923c',
  MEDIUM:   '#facc15',
  LOW:      '#4ade80',
};

export default function RecentActivity({ data, isLoading }: RecentActivityProps) {
  const [filter, setFilter] = useState<SeverityFilter>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activityData = data ?? mockRecentActivity;

  const filteredData = activityData.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.severity === filter;
    const matchesSearch =
      searchTerm === '' ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceIp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        padding: '24px',
        background: 'rgba(11, 15, 25, 0.92)',
        border: '1px solid rgba(30, 41, 59, 0.9)',
      }}
    >
      {/* Top accent */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[14px] font-semibold text-white tracking-tight">
              Live SOC Telemetry Stream
            </h3>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
              style={{
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.2)',
                color: '#34d399',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Real-time correlation of firewall events, anomalies, and perimeter mitigation traces
          </p>
        </div>

        {/* Filter toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
            <input
              type="text"
              placeholder="Search traces, IPs, tactics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-[12px] font-mono text-white placeholder:text-slate-600 focus:outline-none transition-colors"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            />
          </div>

          {/* Severity pills */}
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-xl overflow-x-auto"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityFilter[]).map((sev) => {
              const isActive = filter === sev;
              const cfg = SEVERITY_FILTER_COLORS[sev];
              return (
                <button
                  key={sev}
                  onClick={() => setFilter(sev)}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-semibold transition-all duration-150 cursor-pointer"
                  style={{
                    background: isActive ? cfg.active : 'transparent',
                    color: isActive ? SEVERITY_TEXT_COLORS[sev] : '#4b5563',
                    border: isActive ? `1px solid ${cfg.border}` : '1px solid transparent',
                  }}
                >
                  {sev}
                </button>
              );
            })}
          </div>

          <Link
            href="/logs"
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-xl text-[11px] font-mono font-medium transition-colors ml-auto lg:ml-0"
            style={{ color: '#22d3ee' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(6,182,212,0.08)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <span>Full Logs</span>
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-0.5">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(30,41,59,0.9)' }}
            >
              <div className="w-8 h-8 rounded-xl shrink-0 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
              <div className="flex-1 min-w-0 space-y-2">
                <div
                  className="h-3.5 rounded-lg animate-pulse"
                  style={{ width: `${75 - i * 8}%`, background: 'rgba(255,255,255,0.05)' }}
                />
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-14 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  <div className="h-2.5 w-20 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
              </div>
            </div>
          ))
        ) : filteredData.length === 0 ? (
          <div
            className="p-10 text-center rounded-xl my-2"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(30,41,59,0.9)' }}
          >
            <Terminal className="w-7 h-7 text-slate-700 mx-auto mb-2.5" />
            <p className="text-[12px] font-mono font-medium text-slate-400">No telemetry events matched</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Try adjusting your query or resetting severity filters
            </p>
          </div>
        ) : (
          filteredData.map((activity) => {
            const color = getSeverityColor(activity.severity as LogSeverity);
            const isCopied = copiedId === activity.id;

            return (
              <div
                key={activity.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(30,41,59,0.9)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
                  e.currentTarget.style.borderColor = 'rgba(51,65,85,0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(30,41,59,0.9)';
                }}
              >
                {/* Left: icon + message + metadata */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: `${color}12`,
                      color: color,
                      border: `1px solid ${color}28`,
                    }}
                  >
                    {typeIcons[activity.type] || <AlertTriangle className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-medium text-slate-200 leading-snug break-words">
                      {activity.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {/* Severity pill */}
                      <span
                        className="px-1.5 py-0.5 rounded font-mono font-bold text-[9px] uppercase"
                        style={{
                          background: `${color}12`,
                          color: color,
                          border: `1px solid ${color}28`,
                        }}
                      >
                        {activity.severity}
                      </span>
                      {/* Event type */}
                      <span
                        className="text-slate-400 font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        {activity.type.replace(/_/g, ' ')}
                      </span>
                      {/* Source IP with copy */}
                      {activity.sourceIp && (
                        <div
                          className="inline-flex items-center gap-1 font-mono text-slate-400 px-1.5 py-0.5 rounded text-[10px]"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <span>{activity.sourceIp}</span>
                          <button
                            onClick={() => handleCopy(activity.id, activity.sourceIp)}
                            title="Copy IP"
                            className="text-slate-600 hover:text-slate-300 transition-colors cursor-pointer"
                          >
                            {isCopied ? (
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-2.5 h-2.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: timestamp + trace link */}
                <div
                  className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0"
                  style={{ borderColor: 'rgba(30,41,59,0.7)' }}
                >
                  <span className="text-[11px] font-mono text-slate-500">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                  <Link
                    href={`/logs?search=${encodeURIComponent(activity.sourceIp || activity.type)}`}
                    className="text-[11px] font-mono font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-0.5 transition-colors"
                  >
                    <span>Trace</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
