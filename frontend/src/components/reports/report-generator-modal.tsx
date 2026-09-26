'use client';

import { useState, useEffect } from 'react';
import {
  X,
  FileText,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ReportType, ReportFormat, ReportItem, ReportSummaryData } from '@/types';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportCreated: (newReport: ReportItem) => void;
}

export default function ReportGeneratorModal({
  isOpen,
  onClose,
  onReportCreated,
}: ReportGeneratorModalProps) {
  const [type, setType] = useState<ReportType>('WEEKLY');
  const [format, setFormat] = useState<ReportFormat>('PDF');
  const [title, setTitle] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<ReportSummaryData | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Set default title based on type when title hasn't been manually altered
  useEffect(() => {
    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    if (!title || title.startsWith('Cyber Threat Intelligence')) {
      const typeLabel =
        type === 'DAILY'
          ? 'Daily Threat Intelligence Briefing'
          : type === 'WEEKLY'
          ? 'Weekly SOC Threat Digest'
          : type === 'MONTHLY'
          ? 'Monthly Executive Cyber Brief'
          : 'Critical Incident Post-Mortem';
      setTitle(`Cyber Threat Intelligence — ${typeLabel} (${todayStr})`);
    }
  }, [type]);

  if (!isOpen) return null;

  const handleComputePreview = async () => {
    setIsPreviewing(true);
    setPreviewError(null);
    try {
      const payload: {
        type: ReportType;
        format: ReportFormat;
        title?: string;
        dateRangeStart?: string;
        dateRangeEnd?: string;
      } = {
        type,
        format,
        title: title.trim() || undefined,
      };

      if (useCustomRange && dateRangeStart) {
        payload.dateRangeStart = new Date(dateRangeStart).toISOString();
      }
      if (useCustomRange && dateRangeEnd) {
        payload.dateRangeEnd = new Date(dateRangeEnd).toISOString();
      }

      const res = await api.post<ReportSummaryData>('/reports/preview', payload);
      setPreviewData(res);
    } catch (err) {
      setPreviewError((err as Error).message || 'Failed to compute live telemetry preview');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const payload: {
        type: ReportType;
        format: ReportFormat;
        title: string;
        dateRangeStart?: string;
        dateRangeEnd?: string;
      } = {
        type,
        format,
        title: title.trim() || `Cyber Threat Intelligence ${type} Report`,
      };

      if (useCustomRange && dateRangeStart) {
        payload.dateRangeStart = new Date(dateRangeStart).toISOString();
      }
      if (useCustomRange && dateRangeEnd) {
        payload.dateRangeEnd = new Date(dateRangeEnd).toISOString();
      }

      const newReport = await api.post<ReportItem>('/reports/generate', payload);
      onReportCreated(newReport);
      onClose();
    } catch (err) {
      setGenerateError((err as Error).message || 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden text-slate-200 border flex flex-col max-h-[92vh]"
        style={{
          background: 'rgba(10, 14, 22, 0.98)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.95), 0 0 50px rgba(6, 182, 212, 0.1)',
        }}
      >
        {/* Modal Header */}
        <div
          className="px-7 py-6 border-b flex items-center justify-between shrink-0"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.08)',
            background: 'rgba(14, 19, 30, 0.75)',
          }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Generate Threat Intelligence Report
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/50 font-semibold">
                  LIVE PIPELINE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Compile automated cross-telemetry intelligence reports with PDF and CSV export
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleGenerate} className="p-7 overflow-y-auto space-y-6 flex-1">
          {/* Report Title Field */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold tracking-wider uppercase text-slate-300">
              Report Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cyber Threat Intelligence — Weekly SOC Threat Digest"
              className="w-full h-12 px-4 rounded-xl text-sm font-medium bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all font-sans"
              required
            />
          </div>

          {/* Temporal Scope Selector (Matching Screenshot Style) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Scope / Window:
              </span>
            </div>

            <div
              className="w-full flex items-center p-1 rounded-xl gap-1"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {[
                { id: 'DAILY', label: '24h', sub: 'Daily' },
                { id: 'WEEKLY', label: '7d', sub: 'Weekly' },
                { id: 'MONTHLY', label: '30d', sub: 'Monthly' },
                { id: 'INCIDENT', label: '48h', sub: 'Incident' },
              ].map((opt) => {
                const isSelected = type === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setType(opt.id as ReportType)}
                    className="flex-1 h-9 px-3 rounded-lg text-xs font-mono font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5"
                    style={{
                      background: isSelected ? 'rgba(6, 182, 212, 0.16)' : 'transparent',
                      border: isSelected ? '1px solid #06b6d4' : '1px solid transparent',
                      color: isSelected ? '#06b6d4' : '#94a3b8',
                      boxShadow: isSelected ? '0 0 12px rgba(6, 182, 212, 0.25)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <span className="font-bold">{opt.label}</span>
                    <span className="text-[10px] opacity-70">({opt.sub})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Export Format Selector (Matching Screenshot Style) */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Format:
              </span>
            </div>

            <div
              className="w-full flex items-center p-1 rounded-xl gap-1.5"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {[
                { id: 'PDF', label: 'Executive PDF', desc: 'Formal Briefing' },
                { id: 'CSV', label: 'Structured CSV', desc: 'Audit Spreadsheet' },
              ].map((opt) => {
                const isSelected = format === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormat(opt.id as ReportFormat)}
                    className="flex-1 h-10 px-4 rounded-lg text-xs font-mono font-semibold transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      background: isSelected ? 'rgba(6, 182, 212, 0.16)' : 'transparent',
                      border: isSelected ? '1px solid #06b6d4' : '1px solid transparent',
                      color: isSelected ? '#06b6d4' : '#94a3b8',
                      boxShadow: isSelected ? '0 0 12px rgba(6, 182, 212, 0.25)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <span className="font-bold">{opt.label}</span>
                    <span className="text-[10px] opacity-70">({opt.desc})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Date Range Toggle Bar */}
          <div
            className="p-4 rounded-xl border space-y-3.5"
            style={{
              background: 'rgba(15, 20, 30, 0.5)',
              borderColor: 'rgba(255, 255, 255, 0.07)',
            }}
          >
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-slate-200 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useCustomRange}
                  onChange={(e) => setUseCustomRange(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                Specify Custom Date Range (Optional)
              </label>

              <button
                type="button"
                onClick={handleComputePreview}
                disabled={isPreviewing}
                className="h-8 px-3 rounded-lg text-xs font-mono font-semibold text-cyan-400 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/50 transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isPreviewing ? 'Computing...' : 'Preview Live Metrics'}</span>
              </button>
            </div>

            {useCustomRange && (
              <div className="grid grid-cols-2 gap-4 pt-1 animate-fade-in">
                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1.5 block">START DATE</label>
                  <input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg text-xs bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-400 mb-1.5 block">END DATE</label>
                  <input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="w-full h-10 px-3.5 rounded-lg text-xs bg-slate-900 border border-slate-700/80 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Strip */}
          {previewData && (
            <div
              className="p-4 rounded-xl border space-y-3 animate-fade-in"
              style={{
                background: 'rgba(6, 182, 212, 0.06)',
                borderColor: 'rgba(6, 182, 212, 0.3)',
              }}
            >
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-cyan-400 font-bold">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Pre-computation Live Telemetry
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60">
                  POSTURE: {previewData.metrics.riskPosture}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 pt-1 text-center font-mono">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Logs</div>
                  <div className="text-sm sm:text-base font-bold text-white mt-0.5">{previewData.metrics.totalLogs.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Alerts</div>
                  <div className="text-sm sm:text-base font-bold text-amber-400 mt-0.5">{previewData.metrics.totalAlerts}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Critical</div>
                  <div className="text-sm sm:text-base font-bold text-red-400 mt-0.5">{previewData.metrics.criticalAlerts}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-[11px] text-slate-400 uppercase">Threat Avg</div>
                  <div className="text-sm sm:text-base font-bold text-cyan-400 mt-0.5">{previewData.metrics.averageThreatScore}/100</div>
                </div>
              </div>
            </div>
          )}

          {previewError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-xs sm:text-sm text-red-400 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{previewError}</span>
            </div>
          )}

          {generateError && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 text-xs sm:text-sm text-red-400 flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{generateError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div
            className="pt-5 border-t flex items-center justify-end gap-3.5"
            style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="h-11 inline-flex items-center gap-2.5 px-6 rounded-xl text-xs sm:text-sm font-bold font-sans transition-all cursor-pointer disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#020617',
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)',
              }}
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate & Export {format}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
