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

const severitySliderConfig = [
  {
    id: 'ALL',
    label: 'All',
    dotColor: '#06b6d4',
    activeBg: 'rgba(6, 182, 212, 0.16)',
    activeBorder: 'rgba(6, 182, 212, 0.45)',
    activeGlow: '0 0 16px rgba(6, 182, 212, 0.25)',
    activeText: 'text-cyan-300 font-semibold',
  },
  {
    id: 'CRITICAL',
    label: 'Critical',
    dotColor: '#ef4444',
    activeBg: 'rgba(239, 68, 68, 0.22)',
    activeBorder: 'rgba(239, 68, 68, 0.55)',
    activeGlow: '0 0 16px rgba(239, 68, 68, 0.35)',
    activeText: 'text-rose-300 font-semibold',
  },
  {
    id: 'HIGH',
    label: 'High',
    dotColor: '#f97316',
    activeBg: 'rgba(249, 115, 22, 0.22)',
    activeBorder: 'rgba(249, 115, 22, 0.55)',
    activeGlow: '0 0 16px rgba(249, 115, 22, 0.35)',
    activeText: 'text-orange-300 font-semibold',
  },
  {
    id: 'MEDIUM',
    label: 'Medium',
    dotColor: '#eab308',
    activeBg: 'rgba(234, 179, 8, 0.22)',
    activeBorder: 'rgba(234, 179, 8, 0.55)',
    activeGlow: '0 0 16px rgba(234, 179, 8, 0.35)',
    activeText: 'text-amber-300 font-semibold',
  },
  {
    id: 'LOW',
    label: 'Low',
    dotColor: '#22c55e',
    activeBg: 'rgba(34, 197, 94, 0.22)',
    activeBorder: 'rgba(34, 197, 94, 0.55)',
    activeGlow: '0 0 16px rgba(34, 197, 94, 0.35)',
    activeText: 'text-emerald-300 font-semibold',
  },
] as const;

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

  // Slider measurement state for smooth animated indicator
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [thumbRect, setThumbRect] = useState<{ left: number; width: number } | null>(null);

  const singleActiveId =
    selectedSeverities.length === 0
      ? 'ALL'
      : selectedSeverities.length === 1
      ? selectedSeverities[0]
      : null;

  // Measure and position the sliding pill
  useEffect(() => {
    if (!singleActiveId || !sliderTrackRef.current) return;
    const targetEl = itemRefs.current[singleActiveId];
    if (targetEl) {
      setThumbRect({
        left: targetEl.offsetLeft,
        width: targetEl.offsetWidth,
      });
    }
  }, [singleActiveId]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!singleActiveId) return;
      const targetEl = itemRefs.current[singleActiveId];
      if (targetEl) {
        setThumbRect({
          left: targetEl.offsetLeft,
          width: targetEl.offsetWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [singleActiveId]);

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

  const handleSliderOptionClick = (id: 'ALL' | LogSeverity, e?: React.MouseEvent) => {
    if (id === 'ALL') {
      onSeveritiesChange([]);
      return;
    }
    // Multi-select toggle if modifier keys held
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey)) {
      if (selectedSeverities.includes(id)) {
        onSeveritiesChange(selectedSeverities.filter((s) => s !== id));
      } else {
        onSeveritiesChange([...selectedSeverities, id]);
      }
      return;
    }
    // Single select slider behavior (click active item to return to All)
    if (selectedSeverities.length === 1 && selectedSeverities[0] === id) {
      onSeveritiesChange([]);
    } else {
      onSeveritiesChange([id]);
    }
  };

  // Keyboard navigation for slider (Left / Right arrow keys)
  const handleSliderKeyDown = (e: React.KeyboardEvent) => {
    const ids: Array<'ALL' | LogSeverity> = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const currentIdx = ids.indexOf((singleActiveId || 'ALL') as 'ALL' | LogSeverity);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (currentIdx + 1) % ids.length;
      handleSliderOptionClick(ids[nextIdx]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (currentIdx - 1 + ids.length) % ids.length;
      handleSliderOptionClick(ids[prevIdx]);
    }
  };

  const toggleSource = (src: LogSource) => {
    if (selectedSources.includes(src)) {
      onSourcesChange(selectedSources.filter((s) => s !== src));
    } else {
      onSourcesChange([...selectedSources, src]);
    }
  };

  const activeConfig = singleActiveId
    ? severitySliderConfig.find((c) => c.id === singleActiveId)
    : null;

  return (
    <div className="space-y-2.5">
      {/* ── Single Clean Horizontal Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-sm">
        {/* Search Input - 40px height, flex-grow, 13px font */}
        <div className="relative flex-1 min-w-[200px] h-[40px] flex items-center bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] focus-within:border-cyan-500/50 rounded-lg transition-colors">
          <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search IPs, events, messages..."
            className="w-full h-full bg-transparent text-[13px] text-white placeholder:text-slate-500 focus:outline-none text-center placeholder:text-center px-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Severity Filter - 40px height, 13px font, shrink-0 */}
        <div
          ref={sliderTrackRef}
          tabIndex={0}
          onKeyDown={handleSliderKeyDown}
          role="radiogroup"
          aria-label="Severity level filter"
          className="relative h-[40px] shrink-0 flex items-center gap-1.5 bg-[#090d16]/95 border border-white/[0.08] rounded-lg p-1 select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] focus:outline-none focus:border-cyan-500/50 transition-colors"
        >
          {/* Animated Sliding Thumb Indicator */}
          {singleActiveId && thumbRect && (
            <div
              className="absolute top-1 bottom-1 rounded-md transition-all duration-300 ease-out pointer-events-none z-0"
              style={{
                left: `${thumbRect.left}px`,
                width: `${thumbRect.width}px`,
                backgroundColor: activeConfig?.activeBg,
                borderColor: activeConfig?.activeBorder,
                borderWidth: 1,
                borderStyle: 'solid',
                boxShadow: `${activeConfig?.activeGlow}, inset 0 1px 1px rgba(255, 255, 255, 0.15)`,
              }}
            />
          )}

          {/* Severity Pills: px-3 py-1, text-[13px] */}
          {severitySliderConfig.map((item) => {
            const isSingleActive = singleActiveId === item.id;
            const isMultiActive =
              !singleActiveId &&
              item.id !== 'ALL' &&
              selectedSeverities.includes(item.id as LogSeverity);
            const isSelected = isSingleActive || isMultiActive;

            return (
              <button
                key={item.id}
                ref={(el) => {
                  itemRefs.current[item.id] = el;
                }}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={(e) => handleSliderOptionClick(item.id, e)}
                className={`relative z-10 h-[32px] px-3 py-1 rounded-md text-[13px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isSingleActive
                    ? item.activeText
                    : isMultiActive
                    ? `${item.activeText} bg-white/[0.08] border border-white/[0.12]`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
                title={
                  item.id === 'ALL'
                    ? 'Show all severities'
                    : `Filter by ${item.label} severity (Ctrl/Shift+Click to multi-select)`
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-200 ${
                    isSelected ? 'scale-125' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: item.dotColor,
                    boxShadow: isSelected ? `0 0 8px ${item.dotColor}` : 'none',
                  }}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Dark-Themed Source Dropdown - 40px height, 13px font, shrink-0 */}
        <div ref={sourceDropdownRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setSourceDropdownOpen(!sourceDropdownOpen)}
            className={`h-[40px] px-3.5 rounded-lg text-[13px] font-medium flex items-center gap-2 transition-all cursor-pointer border whitespace-nowrap ${
              selectedSources.length > 0
                ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-300'
                : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/[0.12] text-slate-300'
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

        {/* IP Filter Input - 40px height, 13px font, shrink-0 */}
        <div className="relative h-[40px] flex items-center bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] focus-within:border-cyan-500/50 rounded-lg w-36 shrink-0 transition-colors">
          <input
            type="text"
            value={ipFilter}
            onChange={(e) => onIpFilterChange(e.target.value)}
            placeholder="Filter IP..."
            className="w-full h-full bg-transparent text-[13px] text-white placeholder:text-slate-500 focus:outline-none font-mono text-center placeholder:text-center px-6"
          />
          {ipFilter && (
            <button
              type="button"
              onClick={() => onIpFilterChange('')}
              className="absolute right-2 text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Start and End Calendar Filter - 40px height, 13px font, shrink-0 */}
        <div className="h-[40px] flex items-center gap-2 shrink-0">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="h-[40px] w-[136px] px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] text-[13px] text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer [color-scheme:dark] shrink-0"
            title="Start date filter"
          />
          <span className="text-slate-500 text-[13px] font-mono shrink-0 select-none px-0.5">–</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="h-[40px] w-[136px] px-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] text-[13px] text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer [color-scheme:dark] shrink-0"
            title="End date filter"
          />
        </div>

        {/* Reset Action */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="h-[40px] text-[13px] text-slate-400 hover:text-rose-400 px-3 rounded-lg transition-colors ml-auto cursor-pointer hover:bg-white/[0.03] flex items-center shrink-0"
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
                onClick={() => onSeveritiesChange(selectedSeverities.filter((s) => s !== sev))}
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
