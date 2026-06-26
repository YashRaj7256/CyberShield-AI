'use client';

import { mockTopSources } from '@/lib/mock-data';
import { getSeverityColor } from '@/lib/format';

export default function TopSourcesChart() {
  const maxCount = Math.max(...mockTopSources.map((s) => s.count));

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
        {mockTopSources.map((source, index) => {
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
        })}
      </div>
    </div>
  );
}
