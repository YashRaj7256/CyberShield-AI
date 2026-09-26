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
  { key: 'timestamp', label: 'Timestamp', width: 'w-[140px] min-w-[130px]' },
  { key: 'sourceIp', label: 'Source → Destination', width: 'w-[250px] min-w-[220px]' },
  { key: 'eventType', label: 'Event & Payload', width: 'min-w-[260px]' },
  { key: 'protocol', label: 'Protocol', width: 'w-[80px] min-w-[75px]' },
  { key: 'action', label: 'Action', width: 'w-[85px] min-w-[80px]' },
  { key: 'severity', label: 'Severity', width: 'w-[105px] min-w-[95px]' },
  { key: 'source', label: 'Source', width: 'w-[100px] min-w-[90px]' },
  { key: 'country', label: 'Location', width: 'w-[110px] min-w-[95px]' },
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
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.01]">
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  className={`py-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 cursor-pointer select-none transition-colors ${
                    index === 0
                      ? 'pl-5 pr-4'
                      : index === columns.length - 1
                      ? 'pl-4 pr-5'
                      : 'px-4'
                  } ${col.width}`}
                  onClick={() => onSort(col.key)}
                >
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className={sortBy === col.key ? 'text-cyan-400' : ''}>
                      {col.label}
                    </span>
                    {sortBy === col.key ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3 text-cyan-400 shrink-0" />
                      ) : (
                        <ArrowDown className="w-3 h-3 text-cyan-400 shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-25 shrink-0" />
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
                  <td className="pl-5 pr-4 py-3.5 text-xs font-mono text-slate-400 whitespace-nowrap">
                    {formatDateShort(log.timestamp)}
                  </td>

                  {/* Source → Destination IP */}
                  <td className="px-4 py-3.5 text-xs font-mono whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 group/ip">
                        <span className="font-medium text-slate-200">
                          {log.sourceIp}
                        </span>
                        {log.sourcePort > 0 && (
                          <span className="text-[10px] text-slate-600">:{log.sourcePort}</span>
                        )}

                        {onFilterByIp && (
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
                        )}
                      </div>

                      <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />

                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">
                          {log.destinationIp}
                        </span>
                        {log.destinationPort > 0 && (
                          <span className="text-[10px] text-slate-600">:{log.destinationPort}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Event & Message Payload */}
                  <td className="px-4 py-3.5 min-w-[260px] max-w-[420px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-200 font-mono">
                          {log.eventType || 'Security Event'}
                        </span>
                        {log.threatScore != null && log.threatScore > 70 && (
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                            {log.threatScore}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[11px] text-slate-400 truncate leading-normal"
                        title={log.message}
                      >
                        {log.message}
                      </p>
                    </div>
                  </td>

                  {/* Protocol (Secondary Metadata: subtle) */}
                  <td className="px-4 py-3.5 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {log.protocol}
                  </td>

                  {/* Action (Clean neutral SIEM style) */}
                  <td className="px-4 py-3.5 text-[11px] font-mono text-slate-300 font-medium whitespace-nowrap">
                    {log.action}
                  </td>

                  {/* Severity (ONLY place using severity colors) */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
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

                  {/* Source (Secondary Metadata: subtle) */}
                  <td className="px-4 py-3.5 text-[11px] font-mono text-slate-400 whitespace-nowrap">
                    {log.source}
                  </td>

                  {/* Location (Secondary Metadata: subtle) */}
                  <td className="pl-4 pr-5 py-3.5 text-[11px] font-mono text-slate-400 whitespace-nowrap">
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
