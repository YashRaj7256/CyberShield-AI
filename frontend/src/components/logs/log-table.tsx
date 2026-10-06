'use client';

import type { SecurityLog } from '@/types';
import { formatDateShort } from '@/lib/format';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  ArrowRight,
  Search,
  RotateCcw,
} from 'lucide-react';

interface LogTableProps {
  logs: SecurityLog[];
  onRowClick: (log: SecurityLog) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onFilterByIp?: (ip: string) => void;
  onClearFilters?: () => void;
  searchQuery?: string;
}

const columns = [
  { key: 'timestamp', label: 'Timestamp', width: 'w-[130px]' },
  { key: 'sourceIp', label: 'Source → Destination', width: 'w-[300px]' },
  { key: 'eventType', label: 'Event & Payload', width: 'min-w-[320px] w-auto' },
  { key: 'protocol', label: 'Protocol', width: 'w-[90px]' },
  { key: 'action', label: 'Action', width: 'w-[90px]' },
  { key: 'severity', label: 'Severity', width: 'w-[110px]' },
  { key: 'source', label: 'Source', width: 'w-[120px]' },
  { key: 'country', label: 'Location', width: 'w-[130px]' },
];

const severityColors: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

export default function LogTable({
  logs,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  onFilterByIp,
  onClearFilters,
  searchQuery,
}: LogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-12 text-center">
        <Search className="w-8 h-8 text-slate-500 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-white mb-1">
          No security logs found
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          {searchQuery
            ? `No records matching "${searchQuery}". Try adjusting your filters.`
            : 'No logs match the current filter parameters.'}
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table
          className="min-w-[1290px] w-full text-left border-collapse"
          style={{ tableLayout: 'fixed' }}
        >
          <thead>
            <tr className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0c1017]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 pt-5 pb-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 cursor-pointer select-none transition-colors align-middle ${
                    col.key === 'timestamp' ? 'text-center' : 'text-left'
                  } ${col.width}`}
                  onClick={() => onSort(col.key)}
                  style={{ verticalAlign: 'middle' }}
                >
                  <div
                    className={`flex items-center gap-1 whitespace-nowrap ${
                      col.key === 'timestamp' ? 'justify-center' : 'justify-start'
                    }`}
                  >
                    <span className={sortBy === col.key ? 'text-cyan-400' : ''}>
                      {col.label}
                    </span>
                    {sortBy === col.key ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                      ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 opacity-25 shrink-0 ml-1" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/[0.03]">
            {logs.map((log, index) => {
              const sevColor = severityColors[log.severity] || '#94a3b8';
              const logKey =
                log.id || log._id || `${log.timestamp}-${log.sourceIp}-${log.destinationIp}-${index}`;

              return (
                <tr
                  key={logKey}
                  onClick={() => onRowClick(log)}
                  className="cursor-pointer transition-colors duration-100 hover:bg-white/[0.02] group"
                >
                  {/* Timestamp */}
                  <td
                    className="px-3 py-3 text-xs font-mono text-slate-400 whitespace-nowrap align-middle text-center"
                    style={{ verticalAlign: 'middle' }}
                  >
                    {formatDateShort(log.timestamp)}
                  </td>

                  {/* Source → Destination IP: 3-part grid layout with vertically aligned arrow */}
                  <td
                    className="px-3 py-3 text-xs font-mono align-middle"
                    style={{ verticalAlign: 'middle' }}
                  >
                    <div className="grid grid-cols-[1fr_24px_1fr] items-center text-xs font-mono tabular-nums">
                      {/* Source Block */}
                      <div className="flex items-center gap-1 min-w-0 justify-end group/ip">
                        <span className="font-medium text-slate-200 truncate">
                          {log.sourceIp}
                        </span>
                        {log.sourcePort > 0 && (
                          <span className="text-[10px] text-slate-500 shrink-0">
                            :{log.sourcePort}
                          </span>
                        )}
                        {onFilterByIp ? (
                          <span className="w-4 h-4 flex items-center justify-center shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onFilterByIp(log.sourceIp);
                              }}
                              className="opacity-0 group-hover/ip:opacity-100 p-0.5 rounded text-slate-400 hover:text-cyan-400 transition-opacity cursor-pointer"
                              title={`Filter by ${log.sourceIp}`}
                            >
                              <Filter className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ) : null}
                      </div>

                      {/* Fixed-width Arrow Block */}
                      <div className="flex items-center justify-center text-slate-600 shrink-0">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>

                      {/* Destination Block */}
                      <div className="flex items-center gap-1 min-w-0 justify-start">
                        <span className="text-slate-400 truncate">
                          {log.destinationIp}
                        </span>
                        {log.destinationPort > 0 && (
                          <span className="text-[10px] text-slate-500 shrink-0">
                            :{log.destinationPort}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Event & Message Payload: Stacked event type + inline score, 2-line clamp description */}
                  <td
                    className="px-3 py-3 align-middle"
                    style={{ verticalAlign: 'middle' }}
                  >
                    <div className="flex flex-col justify-center gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 font-mono tracking-tight whitespace-nowrap">
                          {log.eventType || 'SECURITY_EVENT'}
                        </span>
                        {log.threatScore != null && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-300 border border-white/[0.08] ml-2 shrink-0">
                            {log.threatScore}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[11px] text-slate-400 line-clamp-2 leading-snug break-words"
                        title={log.message}
                      >
                        {log.message}
                      </p>
                    </div>
                  </td>

                  {/* Protocol */}
                  <td
                    className="px-3 py-3 text-[11px] font-mono text-slate-400 whitespace-nowrap align-middle"
                    style={{ verticalAlign: 'middle' }}
                  >
                    {log.protocol}
                  </td>

                  {/* Action */}
                  <td
                    className="px-3 py-3 text-[11px] font-mono text-slate-300 font-medium whitespace-nowrap align-middle"
                    style={{ verticalAlign: 'middle' }}
                  >
                    {log.action}
                  </td>

                  {/* Severity */}
                  <td
                    className="px-3 py-3 whitespace-nowrap align-middle"
                    style={{ verticalAlign: 'middle' }}
                  >
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: sevColor }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: sevColor }}
                      />
                      {log.severity.charAt(0) + log.severity.slice(1).toLowerCase()}
                    </span>
                  </td>

                  {/* Source */}
                  <td
                    className="px-3 py-3 text-[11px] font-mono text-slate-400 whitespace-nowrap align-middle"
                    style={{ verticalAlign: 'middle' }}
                  >
                    {log.source}
                  </td>

                  {/* Location */}
                  <td
                    className="px-3 py-3 text-[11px] font-mono text-slate-400 whitespace-nowrap truncate align-middle"
                    style={{ verticalAlign: 'middle' }}
                    title={log.country || 'Unknown'}
                  >
                    {log.country ?? '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
