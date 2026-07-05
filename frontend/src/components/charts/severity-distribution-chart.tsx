'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { mockSeverityDistribution } from '@/lib/mock-data';
import type { SeverityDistribution } from '@/types';

interface SeverityDistributionChartProps {
  data?: SeverityDistribution[];
  isLoading?: boolean;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0];
  return (
    <div
      className="px-3 py-2 rounded-lg"
      style={{
        background: 'rgba(17, 17, 24, 0.95)',
        border: '1px solid #2a2a3a',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: data.payload.color }}
        />
        <span className="text-xs" style={{ color: '#a1a1aa' }}>
          {data.name}:
        </span>
        <span className="text-xs font-semibold" style={{ color: '#e4e4e7' }}>
          {data.value.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function SeverityDistributionChart({ data, isLoading }: SeverityDistributionChartProps) {
  const chartData = data ?? mockSeverityDistribution;
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="glass-card-sm p-5">
      <h3 className="text-sm font-semibold mb-1" style={{ color: '#e4e4e7' }}>
        Severity Distribution
      </h3>
      <p className="text-xs mb-4" style={{ color: '#71717a' }}>
        Active alerts by severity
      </p>

      {isLoading ? (
        <>
          <div
            className="relative h-[200px] rounded-lg animate-pulse"
            style={{ background: 'rgba(26, 26, 36, 0.6)' }}
          />
          <div className="grid grid-cols-2 gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 rounded animate-pulse"
                style={{ background: 'rgba(26, 26, 36, 0.6)' }}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="relative h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold" style={{ color: '#e4e4e7' }}>
                {total.toLocaleString()}
              </span>
              <span className="text-xs" style={{ color: '#71717a' }}>
                Total Alerts
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-xs truncate" style={{ color: '#a1a1aa' }}>
                  {item.name}
                </span>
                <span className="text-xs font-semibold ml-auto" style={{ color: '#e4e4e7' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
