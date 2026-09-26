'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { mockSecurityLogs } from '@/lib/mock-data';
import { api } from '@/lib/api';
import telemetryStore, { BASE_TOTAL_LOGS } from '@/lib/telemetry-store';
import { useDebounce } from '@/hooks/use-debounce';
import LogTable from '@/components/logs/log-table';
import LogFilters from '@/components/logs/log-filters';
import LogDetailDrawer from '@/components/logs/log-detail-drawer';
import type { SecurityLog, LogSeverity, LogSource, LogAction, LogProtocol } from '@/types';
import {
  ScrollText,
  Upload,
  AlertTriangle,
  RefreshCw,
  X,
  CheckCircle,
  FileJson,
  FilePlus,
  Database,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';

// ──────────────────────────────────────────────
// Skeleton Table (loading placeholder)
// ──────────────────────────────────────────────
function SkeletonTable() {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
              {[
                { h: 'Timestamp', w: 'w-[140px]' },
                { h: 'Source → Destination', w: 'w-[250px]' },
                { h: 'Event & Payload', w: 'min-w-[260px]' },
                { h: 'Protocol', w: 'w-[80px]' },
                { h: 'Action', w: 'w-[85px]' },
                { h: 'Severity', w: 'w-[105px]' },
                { h: 'Source', w: 'w-[100px]' },
                { h: 'Location', w: 'w-[110px]' },
              ].map(({ h, w }, idx) => (
                <th
                  key={h}
                  className={`py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 ${
                    idx === 0 ? 'pl-5 pr-4' : idx === 7 ? 'pl-4 pr-5' : 'px-4'
                  } ${w}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {Array.from({ length: 8 }).map((_, j) => (
                  <td
                    key={j}
                    className={`py-3.5 ${
                      j === 0 ? 'pl-5 pr-4' : j === 7 ? 'pl-4 pr-5' : 'px-4'
                    }`}
                  >
                    <div
                      className="rounded bg-white/[0.04]"
                      style={{
                        height: 12,
                        width: j === 0 ? 100 : j === 1 ? 180 : j === 2 ? 220 : j === 3 ? 45 : 65,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Toast component
// ──────────────────────────────────────────────
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium animate-fade-in"
      style={{
        background:
          type === 'success'
            ? 'rgba(34, 197, 94, 0.15)'
            : 'rgba(239, 68, 68, 0.15)',
        border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
        color: type === 'success' ? '#22c55e' : '#ef4444',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 32px ${type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
      }}
    >
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <AlertTriangle className="w-4 h-4" />
      )}
      {message}
      <button onClick={onClose} style={{ marginLeft: 8, opacity: 0.7 }}>
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────
// Upload Modal
// ──────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: '#1a1a24',
  border: '1px solid #2a2a3a',
  color: '#e4e4e7',
  width: '100%',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none' as const,
};

const severityOptions: LogSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const sourceOptions: LogSource[] = [
  'FIREWALL', 'IDS', 'ANTIVIRUS', 'SERVER', 'APPLICATION', 'CLOUD', 'NETWORK', 'MANUAL', 'WINDOWS_SECURITY',
];
const actionOptions: LogAction[] = ['ALLOW', 'DENY', 'DROP', 'ALERT'];
const protocolOptions: LogProtocol[] = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'SSH'];
const eventTypeOptions = [
  'Connection Attempt', 'Port Scan', 'Login Failure', 'Malware Detected',
  'Policy Violation', 'Data Transfer', 'DNS Query', 'File Access',
];

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onToast: (msg: string, type: 'success' | 'error') => void;
}

function UploadModal({ onClose, onSuccess, onToast }: UploadModalProps) {
  const [tab, setTab] = useState<'single' | 'bulk'>('single');
  const [submitting, setSubmitting] = useState(false);

  // Single log form state
  const [singleForm, setSingleForm] = useState({
    sourceIp: '',
    destinationIp: '',
    sourcePort: '',
    destinationPort: '',
    protocol: 'TCP' as LogProtocol,
    action: 'DENY' as LogAction,
    severity: 'MEDIUM' as LogSeverity,
    source: 'FIREWALL' as LogSource,
    eventType: 'Connection Attempt',
    message: '',
    country: '',
  });

  // Bulk JSON state
  const [bulkJson, setBulkJson] = useState('');

  const updateField = (field: string, value: string) => {
    setSingleForm((prev) => ({ ...prev, [field]: value }));
  };

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSingleSubmit = async () => {
    if (!singleForm.sourceIp || !singleForm.destinationIp || !singleForm.message) {
      onToast('Please fill in Source IP, Destination IP, and Message', 'error');
      return;
    }
    setSubmitting(true);
    try {
      try {
        await api.post('/logs', {
          ...singleForm,
          sourcePort: Number(singleForm.sourcePort) || 0,
          destinationPort: Number(singleForm.destinationPort) || 0,
        });
      } catch {
        // Backend offline or fallback mode
      }

      // Persist in unified telemetry store so it updates the 1.2M scale dashboard & logs table
      telemetryStore.ingestLog({
        ...singleForm,
        sourcePort: Number(singleForm.sourcePort) || 0,
        destinationPort: Number(singleForm.destinationPort) || 0,
      });
      onToast('Log ingested successfully into telemetry stream', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to submit log', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    let rawParsed: unknown;
    try {
      rawParsed = JSON.parse(bulkJson);
    } catch {
      onToast('Invalid JSON — please paste a valid JSON array or object', 'error');
      return;
    }

    let parsedList: Partial<SecurityLog>[] = [];
    if (Array.isArray(rawParsed)) {
      parsedList = rawParsed;
    } else if (rawParsed && typeof rawParsed === 'object') {
      const obj = rawParsed as Record<string, unknown>;
      if (Array.isArray(obj.logs)) {
        parsedList = obj.logs as Partial<SecurityLog>[];
      } else if (Array.isArray(obj.data)) {
        parsedList = obj.data as Partial<SecurityLog>[];
      }
    }

    if (!parsedList || parsedList.length === 0) {
      onToast('Please provide a non-empty array of log objects', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Ingest into backend in batches of 100
      try {
        const cleanedForBackend = parsedList.map((l) => ({
          sourceIp: l.sourceIp || '192.168.1.100',
          destinationIp: l.destinationIp || '10.0.0.1',
          sourcePort: Number(l.sourcePort) || 0,
          destinationPort: Number(l.destinationPort) || 0,
          protocol: l.protocol || 'TCP',
          action: l.action || 'DENY',
          severity: l.severity || 'HIGH',
          source: l.source || 'FIREWALL',
          eventType: l.eventType || 'SECURITY_EVENT',
          message: l.message || 'Imported security event',
          country: l.country || undefined,
          city: l.city || undefined,
          latitude: l.latitude != null ? Number(l.latitude) : undefined,
          longitude: l.longitude != null ? Number(l.longitude) : undefined,
          userId: l.userId || undefined,
          userName: l.userName || undefined,
          deviceType: l.deviceType || undefined,
          browser: l.browser || undefined,
          os: l.os || undefined,
          timestamp: l.timestamp ? new Date(l.timestamp).toISOString() : new Date().toISOString(),
          threatScore: l.threatScore != null ? Number(l.threatScore) : undefined,
          anomalyScore: l.anomalyScore != null ? Number(l.anomalyScore) : undefined,
          rawData: l.rawData || undefined,
          metadata: l.metadata || undefined,
        }));

        const BATCH_SIZE = 100;
        for (let i = 0; i < cleanedForBackend.length; i += BATCH_SIZE) {
          const chunk = cleanedForBackend.slice(i, i + BATCH_SIZE);
          await api.post('/logs/bulk', { logs: chunk });
        }
      } catch (backendErr) {
        console.warn('Backend bulk upload chunk warning:', backendErr);
      }

      // 2. Persist in unified telemetry store so it updates the 1.2M scale dashboard & logs table
      telemetryStore.ingestBulkLogs(parsedList);
      onToast(`${parsedList.length} logs ingested successfully into telemetry stream`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Bulk upload failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const tabButtonStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px 0',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    color: active ? '#06b6d4' : '#71717a',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #06b6d4' : '2px solid transparent',
    transition: 'all 0.2s',
  });

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-[61] left-1/2 top-1/2 animate-fade-in"
        style={{
          transform: 'translate(-50%, -50%)',
          width: 560,
          maxWidth: '92vw',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: 'rgba(17, 17, 24, 0.95)',
          border: '1px solid rgba(42, 42, 58, 0.8)',
          borderRadius: 16,
          backdropFilter: 'blur(24px)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.06)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #2a2a3a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
              }}
            >
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 style={{ color: '#e4e4e7', fontSize: 15, fontWeight: 600, margin: 0 }}>
                Ingest Security Logs
              </h3>
              <p style={{ color: '#71717a', fontSize: 11, margin: 0, marginTop: 2 }}>
                Submit new log entries to the system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#71717a',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2a3a' }}>
          <button style={tabButtonStyle(tab === 'single')} onClick={() => setTab('single')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FilePlus className="w-3.5 h-3.5" /> Single Log
            </span>
          </button>
          <button style={tabButtonStyle(tab === 'bulk')} onClick={() => setTab('bulk')}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <FileJson className="w-3.5 h-3.5" /> Bulk JSON
            </span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {tab === 'single' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Row: Source IP / Dest IP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Source IP *">
                  <input
                    className="px-3 py-2 rounded-lg text-xs"
                    style={inputStyle}
                    placeholder="192.168.1.100"
                    value={singleForm.sourceIp}
                    onChange={(e) => updateField('sourceIp', e.target.value)}
                  />
                </FormField>
                <FormField label="Destination IP *">
                  <input
                    className="px-3 py-2 rounded-lg text-xs"
                    style={inputStyle}
                    placeholder="10.0.0.1"
                    value={singleForm.destinationIp}
                    onChange={(e) => updateField('destinationIp', e.target.value)}
                  />
                </FormField>
              </div>

              {/* Row: Ports */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Source Port">
                  <input
                    className="px-3 py-2 rounded-lg text-xs"
                    style={inputStyle}
                    type="number"
                    placeholder="49152"
                    value={singleForm.sourcePort}
                    onChange={(e) => updateField('sourcePort', e.target.value)}
                  />
                </FormField>
                <FormField label="Destination Port">
                  <input
                    className="px-3 py-2 rounded-lg text-xs"
                    style={inputStyle}
                    type="number"
                    placeholder="443"
                    value={singleForm.destinationPort}
                    onChange={(e) => updateField('destinationPort', e.target.value)}
                  />
                </FormField>
              </div>

              {/* Row: Protocol / Action */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Protocol">
                  <select
                    className="px-3 py-2 rounded-lg text-xs"
                    style={selectStyle}
                    value={singleForm.protocol}
                    onChange={(e) => updateField('protocol', e.target.value)}
                  >
                    {protocolOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Action">
                  <select
                    className="px-3 py-2 rounded-lg text-xs"
                    style={selectStyle}
                    value={singleForm.action}
                    onChange={(e) => updateField('action', e.target.value)}
                  >
                    {actionOptions.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Row: Severity / Source */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Severity">
                  <select
                    className="px-3 py-2 rounded-lg text-xs"
                    style={selectStyle}
                    value={singleForm.severity}
                    onChange={(e) => updateField('severity', e.target.value)}
                  >
                    {severityOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Source">
                  <select
                    className="px-3 py-2 rounded-lg text-xs"
                    style={selectStyle}
                    value={singleForm.source}
                    onChange={(e) => updateField('source', e.target.value)}
                  >
                    {sourceOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              {/* Row: Event Type / Country */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Event Type">
                  <select
                    className="px-3 py-2 rounded-lg text-xs"
                    style={selectStyle}
                    value={singleForm.eventType}
                    onChange={(e) => updateField('eventType', e.target.value)}
                  >
                    {eventTypeOptions.map((et) => (
                      <option key={et} value={et}>{et}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Country">
                  <input
                    className="px-3 py-2 rounded-lg text-xs"
                    style={inputStyle}
                    placeholder="United States"
                    value={singleForm.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  />
                </FormField>
              </div>

              {/* Message */}
              <FormField label="Message *">
                <textarea
                  className="px-3 py-2 rounded-lg text-xs"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 64 }}
                  placeholder="Describe the security event..."
                  value={singleForm.message}
                  onChange={(e) => updateField('message', e.target.value)}
                />
              </FormField>

              <button
                onClick={handleSingleSubmit}
                disabled={submitting}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: submitting
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#06b6d4',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit Log'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ color: '#71717a', fontSize: 12, margin: 0 }}>
                Paste a JSON array of log objects. Each object should contain fields like{' '}
                <span style={{ color: '#06b6d4', fontFamily: 'monospace' }}>sourceIp</span>,{' '}
                <span style={{ color: '#06b6d4', fontFamily: 'monospace' }}>destinationIp</span>,{' '}
                <span style={{ color: '#06b6d4', fontFamily: 'monospace' }}>severity</span>, etc.
              </p>
              <textarea
                className="px-3 py-3 rounded-lg text-xs font-mono"
                rows={12}
                style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 200 }}
                placeholder={`[\n  {\n    "sourceIp": "192.168.1.100",\n    "destinationIp": "10.0.0.1",\n    "sourcePort": 49152,\n    "destinationPort": 443,\n    "protocol": "TCP",\n    "action": "DENY",\n    "severity": "HIGH",\n    "source": "FIREWALL",\n    "eventType": "Connection Attempt",\n    "message": "Blocked suspicious connection",\n    "country": "Russia"\n  }\n]`}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
              />
              <button
                onClick={handleBulkSubmit}
                disabled={submitting}
                className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  background: submitting
                    ? 'rgba(6, 182, 212, 0.15)'
                    : 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#06b6d4',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Uploading…' : 'Upload Bulk Logs'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 500,
          color: '#71717a',
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function StatusPill({ label, value, online = true }: { label: string; value: string; online?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: online ? '#34d399' : '#f87171',
        }}
      />
      <span className="text-[11px] font-mono text-slate-500">{label}:</span>
      <span className="text-[11px] font-mono font-medium text-slate-300">{value}</span>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Logs Page
// ──────────────────────────────────────────────
export default function LogsPage() {
  // Filters
  const [search, setSearch] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<LogSeverity[]>([]);
  const [selectedSources, setSelectedSources] = useState<LogSource[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  // Pagination & sort
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Drawer
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);

  // Data state
  const [data, setData] = useState<{ logs: SecurityLog[]; total: number }>({
    logs: mockSecurityLogs.slice(0, 20),
    total: mockSecurityLogs.length,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Debounced search (300ms)
  const debouncedSearch = useDebounce(search, 300);

  // Read URL query parameters on mount (e.g. from header search or cross-links)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlSearch = params.get('search');
      const urlIp = params.get('ip') || params.get('sourceIp');
      const urlSeverity = params.get('severity') as LogSeverity | null;
      if (urlSearch) setSearch(urlSearch);
      if (urlIp) setIpFilter(urlIp);
      if (urlSeverity && ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(urlSeverity)) {
        setSelectedSeverities([urlSeverity]);
      }
    }
  }, []);

  // Fetch version counter for manual refetch
  const [fetchVersion, setFetchVersion] = useState(0);

  // Track whether initial load used the API, to avoid wiping demo data on filter change errors
  const hasEverFetchedRef = useRef(false);

  // ── Fetch logs from backend ──
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Backend returns { logs: [...], pagination: { total, page, limit, totalPages } }
      const result = await api.get<{
        logs: SecurityLog[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>(
        '/logs',
        {
          page,
          limit: perPage,
          search: debouncedSearch || undefined,
          severity: selectedSeverities.length > 0 ? selectedSeverities.join(',') : undefined,
          source: selectedSources.length > 0 ? selectedSources.join(',') : undefined,
          sourceIp: ipFilter || undefined,
          country: countryFilter || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          sortBy,
          sortOrder,
        },
      );

      // Normalise: backend shape is { logs, pagination }
      const backendLogs = Array.isArray(result.logs) ? result.logs : [];
      const totalFromBackend = result.pagination?.total ?? 0;

      // Merge recently uploaded logs from telemetryStore so user-ingested events appear immediately
      const uploaded = telemetryStore.getUploadedLogs();
      const existingIds = new Set(backendLogs.map((l) => String(l.id || l._id)));
      const extraUploaded = uploaded.filter((u) => !existingIds.has(String(u.id || u._id)));

      const displayedLogs =
        page === 1 && !debouncedSearch && selectedSeverities.length === 0 && selectedSources.length === 0
          ? [...extraUploaded, ...backendLogs].slice(0, perPage)
          : backendLogs;

      setData({
        logs: displayedLogs,
        total: totalFromBackend + extraUploaded.length,
      });
      setIsDemo(false);
      hasEverFetchedRef.current = true;
    } catch {
      // Fallback gracefully to synchronized telemetry store
      const res = telemetryStore.getSynchronizedLogs(page, perPage, {
        search: debouncedSearch,
        severities: selectedSeverities,
        sources: selectedSources,
        ip: ipFilter,
        country: countryFilter,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      setData({ logs: res.logs, total: res.total });
      setIsDemo(true);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    perPage,
    debouncedSearch,
    selectedSeverities,
    selectedSources,
    ipFilter,
    countryFilter,
    startDate,
    endDate,
    sortBy,
    sortOrder,
    fetchVersion,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Re-fetch when telemetryStore updates (e.g. from an upload)
  useEffect(() => {
    const handleTelemetryChange = () => {
      fetchLogs();
    };
    window.addEventListener('telemetry-updated', handleTelemetryChange);
    window.addEventListener('storage', handleTelemetryChange);
    return () => {
      window.removeEventListener('telemetry-updated', handleTelemetryChange);
      window.removeEventListener('storage', handleTelemetryChange);
    };
  }, [fetchLogs]);

  // Derived
  const totalPages = Math.max(1, Math.ceil(data.total / perPage));

  const clearFilters = () => {
    setSearch('');
    setSelectedSeverities([]);
    setSelectedSources([]);
    setStartDate('');
    setEndDate('');
    setIpFilter('');
    setCountryFilter('');
    setPage(1);
  };

  const activeFilterCount = [
    search,
    selectedSeverities.length > 0,
    selectedSources.length > 0,
    startDate,
    endDate,
    ipFilter,
    countryFilter,
  ].filter(Boolean).length;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. Page Header & Status                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-semibold text-white tracking-tight">
              Security Operations Telemetry &amp; Logs
            </h1>
            {isDemo && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Demo Data
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time event stream ingestion, triage telemetry, and audit monitoring
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => fetchLogs()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer"
            title="Sync telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/25 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Logs</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. Compact KPI Summary Cards (~20% smaller)                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 w-full pb-3">
        <div className="flex flex-col items-center justify-center text-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors w-full h-[70px]">
          <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
            Total Ingested Logs
          </span>
          <div className="text-xl font-bold font-mono text-white tracking-tight mt-0.5">
            {data.total >= 1000 ? `${(data.total / 1000).toFixed(1)}K` : data.total}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors w-full h-[70px]">
          <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
            Critical Threat Events
          </span>
          <div className="text-xl font-bold font-mono text-rose-400 tracking-tight mt-0.5">
            {data.logs.filter((l) => l.severity === 'CRITICAL').length}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors w-full h-[70px]">
          <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
            Perimeter Defended
          </span>
          <div className="text-xl font-bold font-mono text-white tracking-tight mt-0.5">
            {data.logs.filter((l) => l.action === 'DENY' || l.action === 'DROP').length}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-center px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors w-full h-[70px]">
          <span className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
            Active Source Nodes
          </span>
          <div className="text-xl font-bold font-mono text-white tracking-tight mt-0.5">
            {new Set(data.logs.map((l) => l.sourceIp)).size}
          </div>
        </div>
      </div>

      {/* Filters */}
      <LogFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        selectedSeverities={selectedSeverities}
        onSeveritiesChange={(v) => {
          setSelectedSeverities(v);
          setPage(1);
        }}
        selectedSources={selectedSources}
        onSourcesChange={(v) => {
          setSelectedSources(v);
          setPage(1);
        }}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(v) => {
          setStartDate(v);
          setPage(1);
        }}
        onEndDateChange={(v) => {
          setEndDate(v);
          setPage(1);
        }}
        ipFilter={ipFilter}
        onIpFilterChange={(v) => {
          setIpFilter(v);
          setPage(1);
        }}
        countryFilter={countryFilter}
        onCountryFilterChange={(v) => {
          setCountryFilter(v);
          setPage(1);
        }}
        onClear={clearFilters}
        activeCount={activeFilterCount}
        totalLogsCount={data.total}
        displayedLogsCount={data.logs.length}
      />

      {/* Error State */}
      {error && (
        <div
          className="rounded-2xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-xl p-6 text-center shadow-lg"
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-rose-400" />
          <p className="text-sm font-semibold mb-1 text-rose-300">
            Failed to Synchronize Telemetry Stream
          </p>
          <p className="text-xs mb-4 text-slate-400 font-mono">
            {error}
          </p>
          <button
            onClick={() => setFetchVersion((v) => v + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-medium transition-all bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Stream Sync
          </button>
        </div>
      )}

      {/* Table — loading skeleton or real data */}
      {isLoading ? (
        <SkeletonTable />
      ) : (
        !error && (
          <LogTable
            logs={data.logs}
            onRowClick={setSelectedLog}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onFilterByIp={(ip) => {
              setIpFilter(ip);
              setPage(1);
            }}
            onClearFilters={clearFilters}
            searchQuery={debouncedSearch}
          />
        )
      )}

      {/* Pagination */}
      {!error && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-1 text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Show</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-[#141822] border border-white/[0.1] text-slate-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs font-mono text-slate-400">per page</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed bg-white/[0.03] border border-white/[0.08] text-slate-300 hover:bg-white/[0.07]"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                    page === pageNum
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-bold'
                      : 'text-slate-400 border border-transparent hover:bg-white/[0.05] hover:text-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed bg-white/[0.03] border border-white/[0.08] text-slate-300 hover:bg-white/[0.07]"
            >
              Next
            </button>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Page <span className="text-white font-semibold">{page}</span> of{' '}
            <span className="text-white font-semibold">{totalPages}</span>
          </span>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedLog && (
        <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => setFetchVersion((v) => v + 1)}
          onToast={showToast}
        />
      )}
    </div>
  );
}
