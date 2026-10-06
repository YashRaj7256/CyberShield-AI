'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Trash2,
  Clock,
  User,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import ReportGeneratorModal from '@/components/reports/report-generator-modal';
import ReportDetailDrawer from '@/components/reports/report-detail-drawer';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/use-api';
import { mockReports, mockReportsStats } from '@/lib/mock-data';
import type {
  ReportItem,
  ReportsStats,
  ReportType,
  ReportFormat,
  ReportSummaryData,
} from '@/types';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const typeConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DAILY: { label: 'Daily (24h)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.14)', border: 'rgba(56, 189, 248, 0.3)' },
  WEEKLY: { label: 'Weekly (7d)', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.14)', border: 'rgba(45, 212, 191, 0.3)' },
  MONTHLY: { label: 'Monthly (30d)', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.14)', border: 'rgba(192, 132, 252, 0.3)' },
  INCIDENT: { label: 'Incident (48h)', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.14)', border: 'rgba(251, 146, 60, 0.3)' },
};

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quickGenerating, setQuickGenerating] = useState<string | null>(null);

  // Modals & Drawer state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [selectedReportSummary, setSelectedReportSummary] = useState<ReportSummaryData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch reports list & stats from backend
  const {
    data: reportsData,
    refetch: refetchReports,
  } = useApi<{ reports: ReportItem[]; total: number }>('/reports', undefined, {
    fallbackData: { reports: mockReports, total: mockReports.length },
  });

  const {
    data: statsData,
    refetch: refetchStats,
  } = useApi<ReportsStats>('/reports/stats', undefined, {
    fallbackData: mockReportsStats,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchReports(), refetchStats()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Inspect / View report in drawer
  const handleInspect = async (report: ReportItem) => {
    setSelectedReport(report);
    setSelectedReportSummary(null);
    setIsDrawerOpen(true);

    try {
      const detailed = await api.get<ReportItem & { summary?: ReportSummaryData }>(`/reports/${report.id}`);
      if (detailed?.summary) {
        setSelectedReportSummary(detailed.summary);
      }
    } catch {
      // Fallback: drawer uses report.summary if present
    }
  };

  // Download report file directly with JWT authentication
  const handleDownload = async (report: ReportItem) => {
    try {
      setDownloadingId(report.id);
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const ext = report.format === 'CSV' ? 'csv' : 'pdf';

      const response = await fetch(`${baseUrl}/reports/${report.id}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitized = (report.title || 'report').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      a.download = `${sanitized}-${report.id.slice(0, 8)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToastMessage({ text: `Downloaded ${report.format} report successfully`, type: 'success' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Download error:', err);
      setToastMessage({ text: `Error downloading report: ${(err as Error).message}`, type: 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setDownloadingId(null);
    }
  };

  // Delete report
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this threat intelligence report?')) return;

    try {
      await api.delete(`/reports/${id}`);
      setToastMessage({ text: 'Report successfully deleted from archive.', type: 'success' });
      await handleRefresh();
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      setToastMessage({ text: `Failed to delete report: ${(err as Error).message}`, type: 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Quick generate preset action
  const handleQuickPreset = async (presetType: ReportType, presetFormat: ReportFormat, presetKey: string) => {
    setQuickGenerating(presetKey);
    try {
      const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const label =
        presetType === 'DAILY'
          ? 'Daily Threat Intelligence Briefing'
          : presetType === 'WEEKLY'
          ? 'Weekly SOC Threat Digest'
          : presetType === 'INCIDENT'
          ? 'Critical Incident Post-Mortem'
          : 'Telemetry Audit Log';

      const res = await api.post<ReportItem>('/reports/generate', {
        type: presetType,
        format: presetFormat,
        title: `Cyber Threat Intelligence — ${label} (${todayStr})`,
      });

      await handleRefresh();
      setToastMessage({ text: `Generated new ${presetFormat} report.`, type: 'success' });
      setTimeout(() => setToastMessage(null), 3000);
      handleInspect(res);
    } catch (err) {
      setToastMessage({ text: `Generation error: ${(err as Error).message}`, type: 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setQuickGenerating(null);
    }
  };

  // Filtered reports
  const allReports = reportsData?.reports || mockReports;
  const filteredReports = useMemo(() => {
    return allReports.filter((rep) => {
      const matchesSearch =
        searchQuery === '' ||
        rep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rep.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (rep.generatedBy?.email || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'ALL' || rep.type === selectedType;
      const matchesFormat = selectedFormat === 'ALL' || rep.format === selectedFormat;

      return matchesSearch && matchesType && matchesFormat;
    });
  }, [allReports, searchQuery, selectedType, selectedFormat]);

  const currentStats = statsData || mockReportsStats;

  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-20 min-w-0 w-full max-w-full">
      {/* ================================================================= */}
      {/* 1. CLEAN SOC COMMAND HEADER (NO STATUS PILLS UNDER TITLE)          */}
      {/* ================================================================= */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          padding: '26px 32px',
          background: 'rgba(11, 15, 25, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Subtle top cyan line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-500/60 via-blue-500/30 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Brand + Clean Title */}
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
              }}
            >
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Security Intelligence Reports
                </h1>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-cyan-950/70 text-cyan-400 border border-cyan-800/40 tracking-wider">
                  PHASE 3
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Automated cross-telemetry intelligence reporting with PDF/CSV export and live metrics
              </p>
            </div>
          </div>

          {/* Right: Actions with 20% LARGER PROPER BUTTONS */}
          <div className="flex items-center gap-3 self-start lg:self-center">
            {/* Proper Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-11 px-5 rounded-xl text-sm font-mono font-semibold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer inline-flex items-center gap-2.5 disabled:opacity-50"
              title="Refresh reports archive"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Proper Generate Primary Button */}
            <button
              type="button"
              onClick={() => setIsGeneratorOpen(true)}
              className="h-11 px-6 rounded-xl text-sm font-bold font-sans transition-all cursor-pointer inline-flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
                color: '#020617',
                boxShadow: '0 0 24px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Generate New Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm font-mono animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800/70 text-emerald-300'
              : 'bg-red-950/70 border-red-800/70 text-red-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-sans text-xs px-2.5 py-1 rounded bg-slate-900 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. EXECUTIVE METRICS STRIP (20% LARGER STAT CARDS)                 */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col justify-between"
          style={{
            padding: '24px 26px',
            minHeight: '190px',
            background: 'rgba(11, 15, 25, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm font-medium text-slate-400">Total Reports Generated</span>
            <div className="w-10 h-10 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
            {currentStats.totalReports}
          </div>
          <div
            className="flex items-center justify-between pt-3.5 border-t mt-auto text-xs font-mono text-slate-400"
            style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
          >
            <span>AUDIT TRAIL</span>
            <span className="text-cyan-400 font-bold">100% PERSISTED</span>
          </div>
        </div>

        {/* PDF Briefs */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col justify-between"
          style={{
            padding: '24px 26px',
            minHeight: '190px',
            background: 'rgba(11, 15, 25, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm font-medium text-slate-400">Executive PDF Briefs</span>
            <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-red-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
            {currentStats.pdfReports}
          </div>
          <div
            className="flex items-center justify-between pt-3.5 border-t mt-auto text-xs font-mono text-slate-400"
            style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
          >
            <span>CISO & BOARD READY</span>
            <span className="text-red-400 font-bold">PDFKIT ENGINE</span>
          </div>
        </div>

        {/* CSV Telemetry Exports */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col justify-between"
          style={{
            padding: '24px 26px',
            minHeight: '190px',
            background: 'rgba(11, 15, 25, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-sm font-medium text-slate-400">CSV Telemetry Exports</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
            {currentStats.csvReports}
          </div>
          <div
            className="flex items-center justify-between pt-3.5 border-t mt-auto text-xs font-mono text-slate-400"
            style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
          >
            <span>RAW DATA LAKE</span>
            <span className="text-emerald-400 font-bold">CSV STREAM</span>
          </div>
        </div>

        {/* Latest Archive Status */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col justify-between"
          style={{
            padding: '24px 26px',
            minHeight: '190px',
            background: 'rgba(11, 15, 25, 0.94)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-sm font-medium text-slate-400">Latest Intelligence Report</span>
            <Clock className="w-5 h-5 text-purple-400 shrink-0" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-2 mb-1">
              {currentStats.lastReportTitle || 'Cyber Threat Intelligence Briefing'}
            </div>
            <div className="text-xs font-mono text-slate-400">
              {currentStats.lastGeneratedAt
                ? new Date(currentStats.lastGeneratedAt).toLocaleString()
                : 'Ready for generation'}
            </div>
          </div>
          <div
            className="flex items-center justify-between pt-3.5 border-t mt-auto text-xs font-mono text-purple-400"
            style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}
          >
            <span>STATUS</span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ARCHIVED
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. QUICK REPORT DISPATCHER (4 PROPER BUTTONS)                      */}
      {/* ================================================================= */}
      <div
        className="p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: 'rgba(11, 15, 25, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white font-sans">Quick Dispatch Presets</div>
            <div className="text-xs text-slate-400">1-click automated intelligence compilation</div>
          </div>
        </div>

        {/* 4 Proper Preset Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleQuickPreset('DAILY', 'PDF', 'daily-pdf')}
            disabled={quickGenerating !== null}
            className="h-10 px-4 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer inline-flex items-center gap-2.5 border bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:text-cyan-400 disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>24h Daily Brief</span>
            {quickGenerating === 'daily-pdf' && <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />}
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset('WEEKLY', 'PDF', 'weekly-pdf')}
            disabled={quickGenerating !== null}
            className="h-10 px-4 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer inline-flex items-center gap-2.5 border bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:text-cyan-400 disabled:opacity-50"
          >
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <span>7d Weekly Digest</span>
            {quickGenerating === 'weekly-pdf' && <span className="w-3.5 h-3.5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />}
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset('INCIDENT', 'PDF', 'incident-pdf')}
            disabled={quickGenerating !== null}
            className="h-10 px-4 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer inline-flex items-center gap-2.5 border bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:text-amber-400 disabled:opacity-50"
          >
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Incident Triage</span>
            {quickGenerating === 'incident-pdf' && <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />}
          </button>

          <button
            type="button"
            onClick={() => handleQuickPreset('WEEKLY', 'CSV', 'weekly-csv')}
            disabled={quickGenerating !== null}
            className="h-10 px-4 rounded-xl text-xs sm:text-sm font-mono font-semibold transition-all cursor-pointer inline-flex items-center gap-2.5 border bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-200 hover:text-emerald-400 disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Telemetry CSV</span>
            {quickGenerating === 'weekly-csv' && <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />}
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. REPOSITORIES TOOLBAR & REPOSITORY TABLE (20px gap, 12px to table) */}
      {/* ================================================================= */}
      <div className="flex flex-col gap-3 mt-1 min-w-0 w-full max-w-full">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full">
          {/* Search bar (h-10) */}
          <div
            className="flex items-center h-10 gap-3 px-3.5 rounded-xl flex-1 max-w-lg"
            style={{
              background: 'rgba(11, 15, 25, 0.94)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Search className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search reports by title, operator, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs sm:text-[13px] font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none flex-1"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer px-2 py-0.5 rounded bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* EXACT BUTTON SLIDERS FOR SCOPE & FORMAT (MATCHING SCREENSHOT) */}
          <div className="flex flex-wrap items-center gap-3">
          {/* Scope Button Slider */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Scope:
              </span>
            </div>

            <div
              className="inline-flex items-center h-10 p-1 rounded-xl gap-1 shrink-0"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {[
                { id: 'ALL', label: 'All' },
                { id: 'DAILY', label: '24h' },
                { id: 'WEEKLY', label: '7d' },
                { id: 'MONTHLY', label: '30d' },
                { id: 'INCIDENT', label: '48h' },
              ].map(({ id, label }) => {
                const isActive = selectedType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedType(id)}
                    className="h-8 min-w-[44px] px-3.5 rounded-lg text-[12px] font-mono font-semibold transition-all duration-150 cursor-pointer"
                    style={{
                      background: isActive ? 'rgba(6, 182, 212, 0.16)' : 'transparent',
                      border: isActive ? '1px solid #06b6d4' : '1px solid transparent',
                      color: isActive ? '#06b6d4' : '#94a3b8',
                      boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.25)' : 'none',
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
                    title={`Filter by ${label} scope`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Format Button Slider */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                Format:
              </span>
            </div>

            <div
              className="inline-flex items-center h-10 p-1 rounded-xl gap-1 shrink-0"
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {[
                { id: 'ALL', label: 'All' },
                { id: 'PDF', label: 'PDF' },
                { id: 'CSV', label: 'CSV' },
              ].map(({ id, label }) => {
                const isActive = selectedFormat === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedFormat(id)}
                    className="h-8 min-w-[44px] px-3.5 rounded-lg text-[12px] font-mono font-semibold transition-all duration-150 cursor-pointer"
                    style={{
                      background: isActive ? 'rgba(6, 182, 212, 0.16)' : 'transparent',
                      border: isActive ? '1px solid #06b6d4' : '1px solid transparent',
                      color: isActive ? '#06b6d4' : '#94a3b8',
                      boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.25)' : 'none',
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
                    title={`Filter by ${label} format`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 5. REPORTS REPOSITORY TABLE (20% LARGER ROWS & PROPER BUTTONS)    */}
      {/* ================================================================= */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(11, 15, 25, 0.94)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead
              className="text-slate-400 font-mono border-b"
              style={{
                background: 'rgba(15, 20, 32, 0.75)',
                borderColor: 'rgba(255, 255, 255, 0.07)',
              }}
            >
              <tr>
                <th className="py-4 px-6 font-semibold">REPORT TITLE & ID</th>
                <th className="py-4 px-5 font-semibold">SCOPE</th>
                <th className="py-4 px-5 font-semibold">FORMAT</th>
                <th className="py-4 px-5 font-semibold">COVERAGE WINDOW</th>
                <th className="py-4 px-5 font-semibold">OPERATOR</th>
                <th className="py-4 px-5 font-semibold">CREATED</th>
                <th className="py-4 px-6 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-sans">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => {
                  const typeStyle = typeConfig[report.type] || typeConfig.WEEKLY;
                  const isPdf = report.format === 'PDF';

                  return (
                    <tr
                      key={report.id}
                      onClick={() => handleInspect(report)}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                    >
                      {/* Title & ID */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                            style={{
                              background: isPdf ? 'rgba(239, 68, 68, 0.14)' : 'rgba(16, 185, 129, 0.14)',
                              border: `1px solid ${isPdf ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                            }}
                          >
                            {isPdf ? (
                              <FileText className="w-4.5 h-4.5 text-red-400" />
                            ) : (
                              <FileSpreadsheet className="w-4.5 h-4.5 text-emerald-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <div className="font-semibold text-white tracking-tight truncate group-hover:text-cyan-400 transition-colors">
                              {report.title}
                            </div>
                            <div className="text-xs font-mono text-slate-500 truncate mt-0.5">
                              UUID: {report.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Scope Badge */}
                      <td className="py-5 px-5">
                        <span
                          className="px-3 py-1 rounded-md text-xs font-mono font-bold inline-block"
                          style={{
                            background: typeStyle.bg,
                            color: typeStyle.color,
                            border: `1px solid ${typeStyle.border}`,
                          }}
                        >
                          {report.type}
                        </span>
                      </td>

                      {/* Format Badge */}
                      <td className="py-5 px-5 font-mono text-xs">
                        <span
                          className="px-2.5 py-1 rounded font-bold"
                          style={{
                            background: isPdf ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                            color: isPdf ? '#f87171' : '#34d399',
                            border: `1px solid ${isPdf ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                          }}
                        >
                          {report.format}
                        </span>
                      </td>

                      {/* Coverage Window */}
                      <td className="py-5 px-5 font-mono text-slate-300 text-xs sm:text-sm whitespace-nowrap">
                        {new Date(report.dateRangeStart).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {' — '}
                        {new Date(report.dateRangeEnd).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Operator */}
                      <td className="py-5 px-5 font-mono text-slate-300 text-xs sm:text-sm">
                        {report.generatedBy?.email
                          ? report.generatedBy.email.split('@')[0]
                          : 'SOC Admin'}
                      </td>

                      {/* Created */}
                      <td className="py-5 px-5 font-mono text-slate-400 text-xs whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {', '}
                        {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* PROPER ACTION BUTTONS IN EVERY ROW */}
                      <td className="py-5 px-6 text-right">
                        <div
                          className="inline-flex items-center gap-2.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Proper View Button */}
                          <button
                            type="button"
                            onClick={() => handleInspect(report)}
                            className="h-8 px-3.5 rounded-lg text-xs font-mono font-semibold text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/50 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            title="Inspect Intelligence Report"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {/* Proper Download Button */}
                          <button
                            type="button"
                            onClick={() => handleDownload(report)}
                            disabled={downloadingId === report.id}
                            className="h-8 px-3.5 rounded-lg text-xs font-mono font-semibold text-emerald-400 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title={`Download ${report.format} File`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{downloadingId === report.id ? 'Saving...' : report.format}</span>
                          </button>

                          {/* Proper Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => handleDelete(report.id, e)}
                            className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-400 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-800/50 transition-colors inline-flex items-center justify-center cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500 font-mono">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-slate-600 opacity-60" />
                    <p className="text-base text-slate-400">No threat intelligence reports match your current filter.</p>
                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => setIsGeneratorOpen(true)}
                        className="h-10 px-5 rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Generate a new report now</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* ================================================================= */}
      {/* 6. MODALS & DRAWERS                                               */}
      {/* ================================================================= */}
      <ReportGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onReportCreated={(newRep) => {
          handleRefresh();
          handleInspect(newRep);
        }}
      />

      <ReportDetailDrawer
        isOpen={isDrawerOpen}
        report={selectedReport}
        summary={selectedReportSummary}
        onClose={() => setIsDrawerOpen(false)}
        onDownload={handleDownload}
        isDownloading={downloadingId === selectedReport?.id}
      />
    </div>
  );
}
