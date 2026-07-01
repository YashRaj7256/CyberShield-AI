'use client';

import { Search, X, Filter } from 'lucide-react';
import type { LogSeverity, LogSource } from '@/types';

interface LogFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  selectedSeverities: LogSeverity[];
  onSeveritiesChange: (v: LogSeverity[]) => void;
  selectedSources: LogSource[];
  onSourcesChange: (v: LogSource[]) => void;
  startDate: string;
  endDate: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  ipFilter: string;
  onIpFilterChange: (v: string) => void;
  countryFilter: string;
  onCountryFilterChange: (v: string) => void;
  onClear: () => void;
  activeCount: number;
}

const severityOptions: LogSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const sourceOptions: LogSource[] = ['FIREWALL', 'IDS', 'ANTIVIRUS', 'SERVER', 'APPLICATION', 'CLOUD', 'NETWORK', 'MANUAL'];

const inputStyle = {
  background: '#1a1a24',
  border: '1px solid #2a2a3a',
  color: '#e4e4e7',
};

export default function LogFilters({
  search,
  onSearchChange,
  selectedSeverities,
  onSeveritiesChange,
  selectedSources,
  onSourcesChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  ipFilter,
  onIpFilterChange,
  countryFilter,
  onCountryFilterChange,
  onClear,
  activeCount,
}: LogFiltersProps) {
  const toggleSeverity = (sev: LogSeverity) => {
    if (selectedSeverities.includes(sev)) {
      onSeveritiesChange(selectedSeverities.filter((s) => s !== sev));
    } else {
      onSeveritiesChange([...selectedSeverities, sev]);
    }
  };

  const toggleSource = (src: LogSource) => {
    if (selectedSources.includes(src)) {
      onSourcesChange(selectedSources.filter((s) => s !== src));
    } else {
      onSourcesChange([...selectedSources, src]);
    }
  };

  const severityColors: Record<LogSeverity, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };

  return (
    <div className="glass-card-sm p-4 space-y-3">
      {/* Top row: Search + filter count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: '#71717a' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search IPs, events, messages..."
            className="w-full pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-200"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
            onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
          />
        </div>

        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
            }}
          >
            <X className="w-3 h-3" />
            Clear ({activeCount})
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Severity Chips */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5" style={{ color: '#71717a' }} />
          <span className="text-xs mr-1" style={{ color: '#71717a' }}>
            Severity:
          </span>
          {severityOptions.map((sev) => {
            const isActive = selectedSeverities.includes(sev);
            const color = severityColors[sev];
            return (
              <button
                key={sev}
                onClick={() => toggleSeverity(sev)}
                className="px-2 py-1 rounded text-[10px] font-semibold transition-all"
                style={{
                  background: isActive ? `${color}20` : 'transparent',
                  border: `1px solid ${isActive ? `${color}50` : '#2a2a3a'}`,
                  color: isActive ? color : '#71717a',
                }}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-px h-5" style={{ background: '#2a2a3a' }} />

        {/* Source select */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: '#71717a' }}>
            Source:
          </span>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) toggleSource(e.target.value as LogSource);
            }}
            className="px-2 py-1 rounded text-xs"
            style={inputStyle}
          >
            <option value="">All Sources</option>
            {sourceOptions.map((src) => (
              <option key={src} value={src}>
                {selectedSources.includes(src) ? '✓ ' : ''}
                {src}
              </option>
            ))}
          </select>
          {selectedSources.length > 0 && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{
                background: 'rgba(6, 182, 212, 0.2)',
                color: '#06b6d4',
              }}
            >
              {selectedSources.length}
            </span>
          )}
        </div>

        <div className="w-px h-5" style={{ background: '#2a2a3a' }} />

        {/* Date Range */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: '#71717a' }}>
            From:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="px-2 py-1 rounded text-xs"
            style={inputStyle}
          />
          <span className="text-xs" style={{ color: '#71717a' }}>
            To:
          </span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="px-2 py-1 rounded text-xs"
            style={inputStyle}
          />
        </div>

        <div className="w-px h-5" style={{ background: '#2a2a3a' }} />

        {/* IP Filter */}
        <input
          type="text"
          value={ipFilter}
          onChange={(e) => onIpFilterChange(e.target.value)}
          placeholder="Filter by IP"
          className="w-32 px-2 py-1 rounded text-xs"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
          onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
        />

        {/* Country Filter */}
        <input
          type="text"
          value={countryFilter}
          onChange={(e) => onCountryFilterChange(e.target.value)}
          placeholder="Country"
          className="w-28 px-2 py-1 rounded text-xs"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = '#06b6d4')}
          onBlur={(e) => (e.target.style.borderColor = '#2a2a3a')}
        />
      </div>
    </div>
  );
}
