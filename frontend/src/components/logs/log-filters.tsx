'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Filter,
  Calendar,
  ChevronDown,
  Check,
} from 'lucide-react';
import type { LogSeverity, LogSource } from '@/types';

export interface LogFiltersProps {
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
  totalLogsCount?: number;
  displayedLogsCount?: number;
}

const severityOptions: LogSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const sourceOptions: LogSource[] = [
  'FIREWALL',
  'IDS',
  'ANTIVIRUS',
  'SERVER',
  'APPLICATION',
  'CLOUD',
  'NETWORK',
  'MANUAL',
  'WINDOWS_SECURITY',
];

const severityColors: Record<LogSeverity, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
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
  const [sourceDropdownOpen, setSourceDropdownOpen] = useState(false);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);

  // Close source dropdown on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(e.target as Node)) {
        setSourceDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSourceDropdownOpen(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  return (
    <div className="space-y-2">
      {/* ── Single Clean Horizontal Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] h-[34px] flex items-center bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] focus-within:border-cyan-500/50 rounded-lg px-3 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-500 mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search IPs, events, messages..."
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="text-slate-500 hover:text-slate-300 p-0.5 ml-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Severity Filter - Clean Segmented Buttons */}
        <div className="h-[34px] flex items-center gap-0.5 bg-white/[0.03] border border-white/[0.08] rounded-lg p-0.5">
          {severityOptions.map((sev) => {
            const active = selectedSeverities.includes(sev);
            const dotColor = severityColors[sev];
            return (
              <button
                key={sev}
                type="button"
                onClick={() => toggleSeverity(sev)}
                className={`h-full px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center ${
                  active
                    ? 'bg-white/[0.1] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
                  style={{ background: dotColor }}
                />
                {sev.charAt(0) + sev.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Custom Dark-Themed Source Dropdown */}
        <div ref={sourceDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
            className={`h-[34px] px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
              selectedSources.length > 0
                ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/[0.14] text-slate-300'
            }`}
          >
            <span>
              {selectedSources.length === 0
                ? 'All Sources'
                : selectedSources.length === 1
                ? selectedSources[0]
                : `Sources (${selectedSources.length})`}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                sourceDropdownOpen ? 'rotate-180 text-cyan-400' : ''
              }`}
            />
          </button>

          {/* Floating Dark Popover Menu */}
          {sourceDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 z-40 w-48 py-1 rounded-xl bg-[#0e121b] border border-white/[0.1] shadow-2xl backdrop-blur-xl animate-fade-in"
              style={{
                boxShadow: '0 16px 40px rgba(0, 0, 0, 0.75), 0 0 1px rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>LOG SOURCES</span>
                {selectedSources.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onSourcesChange([])}
                    className="text-cyan-400 hover:text-cyan-300 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onSourcesChange([]);
                    setSourceDropdownOpen(false);
                  }}
                  className={`w-full px-2.5 py-1.5 text-xs text-left flex items-center justify-between rounded-lg mx-1 max-w-[calc(100%-8px)] transition-colors cursor-pointer ${
                    selectedSources.length === 0
                      ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                      : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span>All Sources</span>
                  {selectedSources.length === 0 && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>

                {sourceOptions.map((src) => {
                  const isSelected = selectedSources.includes(src);
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => toggleSource(src)}
                      className={`w-full px-2.5 py-1.5 text-xs text-left flex items-center justify-between rounded-lg mx-1 max-w-[calc(100%-8px)] transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 text-cyan-300 font-medium'
                          : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <span>{src}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* IP Filter Input */}
        <div className="relative h-[34px] flex items-center bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] focus-within:border-cyan-500/50 rounded-lg px-2.5 w-32 sm:w-36 transition-colors">
          <input
            type="text"
            value={ipFilter}
            onChange={(e) => onIpFilterChange(e.target.value)}
            placeholder="Filter IP..."
            className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
          />
          {ipFilter && (
            <button
              type="button"
              onClick={() => onIpFilterChange('')}
              className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Time Window Inputs */}
        <div className="h-[34px] flex items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-full px-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            title="Start date"
          />
          <span className="text-slate-600 text-xs">–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-full px-2 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            title="End date"
          />
        </div>

        {/* Reset Action */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="h-[34px] text-xs text-slate-400 hover:text-rose-400 px-2.5 rounded-lg transition-colors ml-auto cursor-pointer hover:bg-white/[0.03] flex items-center"
          >
            Reset ({activeCount})
          </button>
        )}
      </div>

      {/* ── Active Filter Badges (Minimal single line) ── */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5 px-1 text-slate-400">
          <span className="text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-cyan-400" />
            Filtered by:
          </span>

          {search && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] text-slate-200 border border-white/[0.06]">
              &ldquo;{search}&rdquo;
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="hover:text-white cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {selectedSeverities.map((sev) => (
            <span
              key={sev}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] text-slate-200 border border-white/[0.06]"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: severityColors[sev] }}
              />
              {sev.charAt(0) + sev.slice(1).toLowerCase()}
              <button
                type="button"
                onClick={() => toggleSeverity(sev)}
                className="hover:text-white cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {selectedSources.map((src) => (
            <span
              key={src}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] text-slate-200 border border-white/[0.06]"
            >
              {src}
              <button
                type="button"
                onClick={() => toggleSource(src)}
                className="hover:text-white cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {ipFilter && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] text-slate-200 font-mono border border-white/[0.06]">
              IP: {ipFilter}
              <button
                type="button"
                onClick={() => onIpFilterChange('')}
                className="hover:text-white cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(startDate || endDate) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.04] text-slate-200 border border-white/[0.06]">
              <Calendar className="w-2.5 h-2.5 text-slate-500" />
              {startDate || 'Start'} to {endDate || 'Now'}
              <button
                type="button"
                onClick={() => {
                  onStartDateChange('');
                  onEndDateChange('');
                }}
                className="hover:text-white cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onClear}
            className="text-slate-500 hover:text-slate-300 underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
