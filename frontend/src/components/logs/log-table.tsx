'use client';

import type { SecurityLog } from '@/types';
import { formatDateShort, getSeverityColor, getActionColor } from '@/lib/format';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface LogTableProps {
  logs: SecurityLog[];
  onRowClick: (log: SecurityLog) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const columns = [
  { key: 'timestamp', label: 'Timestamp', width: 'w-[140px]' },
  { key: 'sourceIp', label: 'Source IP', width: 'w-[130px]' },
  { key: 'destinationIp', label: 'Dest IP', width: 'w-[130px]' },
  { key: 'protocol', label: 'Protocol', width: 'w-[80px]' },
  { key: 'action', label: 'Action', width: 'w-[90px]' },
  { key: 'severity', label: 'Severity', width: 'w-[90px]' },
  { key: 'source', label: 'Source', width: 'w-[90px]' },
  { key: 'country', label: 'Country', width: 'w-[100px]' },
];

export default function LogTable({ logs, onRowClick, sortBy, sortOrder, onSort }: LogTableProps) {
  if (logs.length === 0) {
    return (
      <div
        className="glass-card-sm p-12 text-center"
      >
        <p className="text-sm" style={{ color: '#71717a' }}>
          No logs found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #2a2a3a' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none transition-colors ${col.width}`}
                  style={{ color: sortBy === col.key ? '#06b6d4' : '#71717a' }}
                  onClick={() => onSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortBy === col.key ? (
                      sortOrder === 'asc' ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      )
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => {
              const sevColor = getSeverityColor(log.severity);
              const actColor = getActionColor(log.action);

              return (
                <tr
                  key={log.id}
                  onClick={() => onRowClick(log)}
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    borderBottom: '1px solid rgba(42, 42, 58, 0.5)',
                    background: index % 2 === 0 ? 'transparent' : 'rgba(26, 26, 36, 0.2)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      index % 2 === 0 ? 'transparent' : 'rgba(26, 26, 36, 0.2)';
                  }}
                >
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#a1a1aa' }}>
                    {formatDateShort(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#e4e4e7' }}>
                    {log.sourceIp}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: '#a1a1aa' }}>
                    {log.destinationIp}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#a1a1aa' }}>
                    {log.protocol}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded"
                      style={{ background: actColor.bg, color: actColor.text }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-1 rounded"
                      style={{
                        background: `${sevColor}15`,
                        color: sevColor,
                      }}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#a1a1aa' }}>
                    {log.source}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#a1a1aa' }}>
                    {log.country}
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
