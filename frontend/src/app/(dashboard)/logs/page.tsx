'use client';

import { useState, useMemo } from 'react';
import { mockSecurityLogs } from '@/lib/mock-data';
import LogTable from '@/components/logs/log-table';
import LogFilters from '@/components/logs/log-filters';
import LogDetailDrawer from '@/components/logs/log-detail-drawer';
import type { SecurityLog, LogSeverity, LogSource } from '@/types';
import { ScrollText, Upload } from 'lucide-react';

export default function LogsPage() {
  const [search, setSearch] = useState('');
  const [selectedSeverities, setSelectedSeverities] = useState<LogSeverity[]>([]);
  const [selectedSources, setSelectedSources] = useState<LogSource[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLog, setSelectedLog] = useState<SecurityLog | null>(null);

  const filteredLogs = useMemo(() => {
    let logs = [...mockSecurityLogs];

    if (search) {
      const s = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.sourceIp.includes(s) ||
          l.destinationIp.includes(s) ||
          l.message.toLowerCase().includes(s) ||
          l.eventType.toLowerCase().includes(s) ||
          l.country.toLowerCase().includes(s)
      );
    }

    if (selectedSeverities.length > 0) {
      logs = logs.filter((l) => selectedSeverities.includes(l.severity));
    }

    if (selectedSources.length > 0) {
      logs = logs.filter((l) => selectedSources.includes(l.source));
    }

    if (ipFilter) {
      logs = logs.filter(
        (l) => l.sourceIp.includes(ipFilter) || l.destinationIp.includes(ipFilter)
      );
    }

    if (countryFilter) {
      logs = logs.filter((l) =>
        l.country.toLowerCase().includes(countryFilter.toLowerCase())
      );
    }

    if (startDate) {
      logs = logs.filter((l) => new Date(l.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      logs = logs.filter((l) => new Date(l.timestamp) <= new Date(endDate + 'T23:59:59'));
    }

    // Sort
    logs.sort((a, b) => {
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

    return logs;
  }, [search, selectedSeverities, selectedSources, ipFilter, countryFilter, startDate, endDate, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredLogs.length / perPage);
  const paginatedLogs = filteredLogs.slice((page - 1) * perPage, page * perPage);

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

  return (
    <div className="space-y-4 animate-fade-in">
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
            <h2 className="text-lg font-semibold" style={{ color: '#e4e4e7' }}>
              Security Logs
            </h2>
            <p className="text-xs" style={{ color: '#71717a' }}>
              {filteredLogs.length.toLocaleString()} logs found
            </p>
          </div>
        </div>

        <button
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
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        selectedSeverities={selectedSeverities}
        onSeveritiesChange={(v) => { setSelectedSeverities(v); setPage(1); }}
        selectedSources={selectedSources}
        onSourcesChange={(v) => { setSelectedSources(v); setPage(1); }}
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(v) => { setStartDate(v); setPage(1); }}
        onEndDateChange={(v) => { setEndDate(v); setPage(1); }}
        ipFilter={ipFilter}
        onIpFilterChange={(v) => { setIpFilter(v); setPage(1); }}
        countryFilter={countryFilter}
        onCountryFilterChange={(v) => { setCountryFilter(v); setPage(1); }}
        onClear={clearFilters}
        activeCount={activeFilterCount}
      />

      {/* Table */}
      <LogTable
        logs={paginatedLogs}
        onRowClick={setSelectedLog}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {/* Pagination */}
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
                  border: page === pageNum ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
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

      {/* Detail Drawer */}
      {selectedLog && (
        <LogDetailDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
