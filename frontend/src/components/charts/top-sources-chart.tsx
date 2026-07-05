'use client';

import { mockTopSources } from '@/lib/mock-data';
import { getSeverityColor } from '@/lib/format';
import type { TopSource } from '@/types';

interface TopSourcesChartProps {
  data?: TopSource[];
  isLoading?: boolean;
}

export default function TopSourcesChart({ data, isLoading }: TopSourcesChartProps) {
  const chartData = data ?? mockTopSources;
  const maxCount = chartData.length > 0 ? Math.max(...chartData.map((s) => s.count)) : 1;

  return (
    <div className="glass-card-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: '#e4e4e7' }}>
          Top Attack Sources
        </h3>
        <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>
          Most active threat source IPs
        </p>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div
                  className="h-4 rounded animate-pulse"
                  style={{ width: `${140 - i * 8}px`, background: 'rgba(26, 26, 36, 0.6)' }}
                />
                <div
                  className="h-4 w-10 rounded animate-pulse"
                  style={{ background: 'rgba(26, 26, 36, 0.6)' }}
                />
              </div>
              <div
                className="h-1.5 rounded-full animate-pulse"
                style={{
                  width: `${100 - i * 8}%`,
                  background: 'rgba(26, 26, 36, 0.6)',
                }}
              />
            </div>
          ))
        ) : (
          chartData.map((source, index) => {
            const color = getSeverityColor(source.threatLevel);
            const width = (source.count / maxCount) * 100;

            return (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-mono"
                      style={{ color: '#e4e4e7' }}
                    >
                      {source.ip}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-md"
                      style={{
                        background: `${color}15`,
                        color: color,
                      }}
                    >
                      {source.country}
                    </span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: '#a1a1aa' }}>
                    {source.count.toLocaleString()}
                  </span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: '#1a1a24' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}88)`,
                      boxShadow: `0 0 8px ${color}40`,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
