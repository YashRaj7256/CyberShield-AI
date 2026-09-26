'use client';

import { useState } from 'react';
import {
  X,
  Download,
  Calendar,
  ShieldAlert,
  Clock,
  User,
  Activity,
  Layers,
  Globe,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileSpreadsheet,
  Server,
  Zap,
} from 'lucide-react';
import type { ReportItem, ReportSummaryData } from '@/types';

interface ReportDetailDrawerProps {
  report: ReportItem | null;
  summary: ReportSummaryData | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (report: ReportItem) => void;
  isDownloading?: boolean;
}

const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: 'rgba(239, 68, 68, 0.14)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' },
  HIGH: { bg: 'rgba(249, 115, 22, 0.14)', text: '#fb923c', border: 'rgba(249, 115, 22, 0.3)' },
  MEDIUM: { bg: 'rgba(234, 179, 8, 0.14)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
  LOW: { bg: 'rgba(34, 197, 94, 0.14)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
};

const postureConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  CRITICAL: { color: '#f87171', bg: 'rgba(239, 68, 68, 0.16)', border: 'rgba(239, 68, 68, 0.35)', label: 'CRITICAL RISK' },
  ELEVATED: { color: '#fb923c', bg: 'rgba(249, 115, 22, 0.16)', border: 'rgba(249, 115, 22, 0.35)', label: 'ELEVATED RISK' },
  MODERATE: { color: '#facc15', bg: 'rgba(234, 179, 8, 0.16)', border: 'rgba(234, 179, 8, 0.35)', label: 'MODERATE RISK' },
  NORMAL: { color: '#4ade80', bg: 'rgba(34, 197, 94, 0.16)', border: 'rgba(34, 197, 94, 0.35)', label: 'SECURE POSTURE' },
};

export default function ReportDetailDrawer({
  report,
  summary,
  isOpen,
  onClose,
  onDownload,
  isDownloading,
}: ReportDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'entities' | 'recommendations'>('overview');

  if (!isOpen || !report) return null;

  const effectiveSummary = summary || report.summary;
  const posture = postureConfig[effectiveSummary?.metrics.riskPosture || 'MODERATE'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-md animate-fade-in">
      {/* Backdrop */}
      <div className="flex-1" onClick={onClose} />

      <div
        className="w-full max-w-3xl h-full flex flex-col overflow-hidden text-slate-200 border-l"
        style={{
          background: 'rgba(9, 13, 21, 0.98)',
          borderColor: 'rgba(255, 255, 255, 0.09)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.85)',
        }}
      >
        {/* ─── Drawer Header ─── */}
        <div
          className="p-7 border-b shrink-0 space-y-4"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            background: 'rgba(14, 19, 30, 0.8)',
          }}
        >
          {/* Classification & Actions Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono font-bold tracking-widest text-slate-400 uppercase bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                SOC CONFIDENTIAL
              </span>
              <span
                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold uppercase"
                style={{
                  background: posture.bg,
                  color: posture.color,
                  border: `1px solid ${posture.border}`,
                }}
              >
                {posture.label}
              </span>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onDownload(report)}
                disabled={isDownloading}
                className="h-9 inline-flex items-center gap-2 px-4 rounded-xl text-xs sm:text-sm font-bold font-sans transition-all cursor-pointer disabled:opacity-50"
                style={{
                  background: report.format === 'PDF' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  boxShadow: report.format === 'PDF' ? '0 0 20px rgba(239, 68, 68, 0.35)' : '0 0 20px rgba(16, 185, 129, 0.35)',
                }}
              >
                <Download className="w-4 h-4" />
                <span>{isDownloading ? 'Downloading...' : `Download ${report.format}`}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3.5 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/70 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Title & Metadata */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {report.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2.5 text-xs sm:text-sm font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                {new Date(report.dateRangeStart).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                {' — '}
                {new Date(report.dateRangeEnd).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                {report.generatedBy?.email ? report.generatedBy.email : 'SOC Lead'}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Navigation Tabs as Proper Segmented Button Slider ─── */}
        <div
          className="p-4 border-b shrink-0 bg-slate-950/70"
          style={{ borderColor: 'rgba(255, 255, 255, 0.07)' }}
        >
          <div
            className="flex items-center gap-1.5 p-1.5 rounded-xl"
            style={{
              background: 'rgba(15, 20, 32, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {[
              { id: 'overview', label: 'Executive Summary' },
              { id: 'incidents', label: `Alerts (${effectiveSummary?.recentAlerts?.length || 0})` },
              { id: 'entities', label: 'Threat Origins' },
              { id: 'recommendations', label: 'SOC Action Plan' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className="flex-1 h-9 rounded-lg text-xs sm:text-sm font-mono font-semibold transition-all duration-150 cursor-pointer text-center"
                  style={{
                    background: isActive ? 'rgba(6, 182, 212, 0.22)' : 'transparent',
                    border: isActive ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid transparent',
                    color: isActive ? '#22d3ee' : '#94a3b8',
                    boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.2)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Drawer Scrollable Content ─── */}
        <div className="flex-1 overflow-y-auto p-7 space-y-7">
          {activeTab === 'overview' && (
            <div className="space-y-7">
              {/* Executive KPI Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                  {
                    label: 'TOTAL TELEMETRY',
                    value: (effectiveSummary?.metrics.totalLogs ?? 0).toLocaleString(),
                    sub: 'Ingested Logs',
                    color: '#e2e8f0',
                  },
                  {
                    label: 'ACTIVE INCIDENTS',
                    value: (effectiveSummary?.metrics.activeAlerts ?? 0).toString(),
                    sub: 'Requires Action',
                    color: '#f59e0b',
                  },
                  {
                    label: 'CRITICAL THREATS',
                    value: (effectiveSummary?.metrics.criticalAlerts ?? 0).toString(),
                    sub: 'Score >= 80',
                    color: '#f87171',
                  },
                  {
                    label: 'AVG THREAT INDEX',
                    value: `${effectiveSummary?.metrics.averageThreatScore ?? 0}/100`,
                    sub: 'Composite Score',
                    color: '#06b6d4',
                  },
                ].map((kpi, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl flex flex-col justify-between"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.07)',
                    }}
                  >
                    <span className="text-[11px] font-mono font-medium text-slate-400 tracking-wider">
                      {kpi.label}
                    </span>
                    <span className="text-2xl sm:text-3xl font-bold font-mono my-1.5" style={{ color: kpi.color }}>
                      {kpi.value}
                    </span>
                    <span className="text-xs text-slate-400">{kpi.sub}</span>
                  </div>
                ))}
              </div>

              {/* Severity Breakdown Bar */}
              <div
                className="p-5 rounded-2xl space-y-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider font-mono">
                    Incident Severity Distribution
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-slate-400">
                    {effectiveSummary?.metrics.totalAlerts ?? 0} Total Alerts
                  </span>
                </div>

                <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  {effectiveSummary?.severityBreakdown.map((sev) => (
                    <div
                      key={sev.severity}
                      style={{
                        width: `${sev.percentage}%`,
                        backgroundColor: severityColors[sev.severity]?.text || '#94a3b8',
                      }}
                      title={`${sev.severity}: ${sev.count} (${sev.percentage}%)`}
                    />
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {effectiveSummary?.severityBreakdown.map((sev) => (
                    <div key={sev.severity} className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: severityColors[sev.severity]?.text }}
                      />
                      <span className="text-xs sm:text-sm text-slate-400 font-mono">{sev.severity}:</span>
                      <span className="text-xs sm:text-sm font-bold text-white font-mono">
                        {sev.count} <span className="text-slate-500 font-normal">({sev.percentage}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prominent Attack Vectors */}
              <div
                className="p-5 rounded-2xl space-y-4"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider font-mono">
                  Prominent Attack Vectors Identified
                </span>

                <div className="space-y-2.5">
                  {effectiveSummary?.topThreatTypes && effectiveSummary.topThreatTypes.length > 0 ? (
                    effectiveSummary.topThreatTypes.map((t) => (
                      <div
                        key={t.type}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/70 border border-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0" />
                          <span className="text-sm font-medium text-slate-200">
                            {t.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                          {t.count} alerts
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 italic">No specific attack vectors detected in window.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-3.5">
              <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider font-mono">
                Recent Incident Logs ({effectiveSummary?.recentAlerts?.length || 0})
              </span>

              {effectiveSummary?.recentAlerts && effectiveSummary.recentAlerts.length > 0 ? (
                <div className="space-y-2.5">
                  {effectiveSummary.recentAlerts.map((alert) => {
                    const sevStyle = severityColors[alert.severity] || severityColors.LOW;
                    return (
                      <div
                        key={alert.id}
                        className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start justify-between gap-4"
                      >
                        <div className="space-y-2 min-w-0">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold"
                              style={{ background: sevStyle.bg, color: sevStyle.text, border: `1px solid ${sevStyle.border}` }}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-sm font-semibold text-white truncate">{alert.title}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                            <span>Src: {alert.sourceIp}</span>
                            <span>•</span>
                            <span>Score: {alert.threatScore}</span>
                            <span>•</span>
                            <span>{new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No alert items found in this period.</p>
              )}
            </div>
          )}

          {activeTab === 'entities' && (
            <div className="space-y-7">
              {/* Top Offending IPs */}
              <div className="space-y-3.5">
                <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider font-mono">
                  Top Attacking Source IPs
                </span>
                <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs sm:text-sm font-mono">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">SOURCE IP</th>
                        <th className="p-3.5">COUNTRY</th>
                        <th className="p-3.5">ANOMALY SCORE</th>
                        <th className="p-3.5 text-right">EVENTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {effectiveSummary?.topOffendingIps?.map((ip) => (
                        <tr key={ip.ip} className="hover:bg-slate-800/30">
                          <td className="p-3.5 font-semibold text-slate-200">{ip.ip}</td>
                          <td className="p-3.5 text-slate-400">{ip.country || 'Unknown'}</td>
                          <td className="p-3.5">
                            <span
                              className="font-bold"
                              style={{ color: (ip.avgScore || 0) >= 70 ? '#f87171' : '#38bdf8' }}
                            >
                              {ip.avgScore || 0}/100
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-semibold text-slate-300">
                            {ip.count.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Target Ports */}
              <div className="space-y-3.5">
                <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider font-mono">
                  Most Probed Destination Ports
                </span>
                <div className="grid grid-cols-3 gap-3">
                  {effectiveSummary?.topTargetPorts?.map((port) => (
                    <div
                      key={port.port}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <Server className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs sm:text-sm font-mono font-bold text-white">Port {port.port}</span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{port.count} hits</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <div className="space-y-4">
              <span className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider font-mono">
                SOC Remediation Action Plan
              </span>
              {effectiveSummary?.recommendations?.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-1 rounded text-[11px] font-mono font-bold"
                      style={{
                        background: rec.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.16)' : 'rgba(14, 165, 233, 0.16)',
                        color: rec.priority === 'HIGH' ? '#f87171' : '#38bdf8',
                        border: `1px solid ${rec.priority === 'HIGH' ? 'rgba(239, 68, 68, 0.35)' : 'rgba(14, 165, 233, 0.35)'}`,
                      }}
                    >
                      [{rec.priority} PRIORITY] {rec.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">{rec.id}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{rec.action}</h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{rec.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
