'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { mockSecurityLogs } from '@/lib/mock-data';
import { api } from '@/lib/api';
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
} from 'lucide-react';

// ──────────────────────────────────────────────
// Skeleton Table (loading placeholder)
// ──────────────────────────────────────────────
function SkeletonTable() {
  return (
    <div className="glass-card-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
              {['Timestamp', 'Source IP', 'Dest IP', 'Protocol', 'Action', 'Severity', 'Source', 'Country'].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#71717a' }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid rgba(42, 42, 58, 0.5)',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(26, 26, 36, 0.2)',
                }}
              >
                {Array.from({ length: 8 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div
                      style={{
                        height: 14,
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #1a1a24 25%, #222230 50%, #1a1a24 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite',
                        width: j === 0 ? 120 : j < 3 ? 100 : 60,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
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
  'FIREWALL', 'IDS', 'ANTIVIRUS', 'SERVER', 'APPLICATION', 'CLOUD', 'NETWORK', 'MANUAL',
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
      await api.post('/logs', {
        ...singleForm,
        sourcePort: Number(singleForm.sourcePort) || 0,
        destinationPort: Number(singleForm.destinationPort) || 0,
      });
      onToast('Log ingested successfully', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to submit log', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkSubmit = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(bulkJson);
    } catch {
      onToast('Invalid JSON — please paste a valid JSON array', 'error');
      return;
    }
    if (!Array.isArray(parsed) || parsed.length === 0) {
      onToast('Please provide a non-empty JSON array of log objects', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/logs/bulk', { logs: parsed });
      onToast(`${parsed.length} logs ingested successfully`, 'success');
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

      // Normalise: backend shape is { logs, pagination } — not { data, total }
      const logs = Array.isArray(result.logs) ? result.logs : [];
      const total = result.pagination?.total ?? 0;
      setData({ logs, total });
      setIsDemo(false);
      hasEverFetchedRef.current = true;
    } catch (err) {
      // If we've never successfully fetched, stay on demo data
      if (!hasEverFetchedRef.current) {
        // Apply client-side filtering to mock data as fallback
        let filtered = [...mockSecurityLogs];

        if (debouncedSearch) {
          const s = debouncedSearch.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              l.sourceIp.includes(s) ||
              l.destinationIp.includes(s) ||
              l.message.toLowerCase().includes(s) ||
              l.eventType.toLowerCase().includes(s) ||
              l.country.toLowerCase().includes(s),
          );
        }
        if (selectedSeverities.length > 0) {
          filtered = filtered.filter((l) => selectedSeverities.includes(l.severity));
        }
        if (selectedSources.length > 0) {
          filtered = filtered.filter((l) => selectedSources.includes(l.source));
        }
        if (ipFilter) {
          filtered = filtered.filter(
            (l) => l.sourceIp.includes(ipFilter) || l.destinationIp.includes(ipFilter),
          );
        }
        if (countryFilter) {
          filtered = filtered.filter((l) =>
            l.country.toLowerCase().includes(countryFilter.toLowerCase()),
          );
        }
        if (startDate) {
          filtered = filtered.filter((l) => new Date(l.timestamp) >= new Date(startDate));
        }
        if (endDate) {
          filtered = filtered.filter(
            (l) => new Date(l.timestamp) <= new Date(endDate + 'T23:59:59'),
          );
        }

        // Sort
        filtered.sort((a, b) => {
          const aVal = a[sortBy as keyof SecurityLog];
          const bVal = b[sortBy as keyof SecurityLog];
          if (aVal === null || aVal === undefined) return 1;
          if (bVal === null || bVal === undefined) return -1;
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
          }
          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
          }
          return 0;
        });

        const total = filtered.length;
        const sliced = filtered.slice((page - 1) * perPage, page * perPage);
        setData({ logs: sliced, total });
        setIsDemo(true);
        setError(null);
      } else {
        // We had a working backend before; show the error
        setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      }
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
    <div className="space-y-4 animate-fade-in">
      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#06b6d4',
            }}
          >
            <ScrollText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold" style={{ color: '#e4e4e7' }}>
                Security Logs
              </h2>
              {isDemo && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(234, 179, 8, 0.15)',
                    color: '#eab308',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  DEMO DATA
                </span>
              )}
            </div>
            <p className="text-xs" style={{ color: '#71717a' }}>
              {data.total.toLocaleString()} logs found
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            color: '#06b6d4',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(6, 182, 212, 0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)')}
        >
          <Upload className="w-4 h-4" />
          Upload Logs
        </button>
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
      />

      {/* Error State */}
      {error && (
        <div
          className="glass-card-sm p-6 text-center"
          style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-3" style={{ color: '#ef4444' }} />
          <p className="text-sm font-medium mb-1" style={{ color: '#ef4444' }}>
            Failed to Load Logs
          </p>
          <p className="text-xs mb-4" style={{ color: '#71717a' }}>
            {error}
          </p>
          <button
            onClick={() => setFetchVersion((v) => v + 1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06b6d4',
            }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Table — loading skeleton or real data */}
      {isLoading ? <SkeletonTable /> : !error && (
        <LogTable
          logs={data.logs}
          onRowClick={setSelectedLog}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />
      )}

      {/* Pagination */}
      {!error && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#71717a' }}>
              Show
            </span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 rounded text-xs"
              style={{
                background: '#1a1a24',
                border: '1px solid #2a2a3a',
                color: '#e4e4e7',
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs" style={{ color: '#71717a' }}>
              per page
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
              style={{
                background: '#1a1a24',
                border: '1px solid #2a2a3a',
                color: '#a1a1aa',
              }}
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
                  className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: page === pageNum ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                    border:
                      page === pageNum
                        ? '1px solid rgba(6, 182, 212, 0.4)'
                        : '1px solid transparent',
                    color: page === pageNum ? '#06b6d4' : '#71717a',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
              style={{
                background: '#1a1a24',
                border: '1px solid #2a2a3a',
                color: '#a1a1aa',
              }}
            >
              Next
            </button>
          </div>

          <span className="text-xs" style={{ color: '#71717a' }}>
            Page {page} of {totalPages}
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
