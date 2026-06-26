'use client';

import { mockRecentActivity } from '@/lib/mock-data';
import { formatRelativeTime, getSeverityColor } from '@/lib/format';
import {
  ShieldAlert,
  Bug,
  Mail,
  Wifi,
  AlertTriangle,
  Lock,
  Zap,
  FileWarning,
} from 'lucide-react';
import type { LogSeverity } from '@/types';

const typeIcons: Record<string, React.ReactNode> = {
  BRUTE_FORCE: <Lock className="w-3.5 h-3.5" />,
  MALWARE: <Bug className="w-3.5 h-3.5" />,
  PHISHING: <Mail className="w-3.5 h-3.5" />,
  DDOS: <Wifi className="w-3.5 h-3.5" />,
  ANOMALY: <AlertTriangle className="w-3.5 h-3.5" />,
  UNAUTHORIZED_ACCESS: <ShieldAlert className="w-3.5 h-3.5" />,
  DATA_EXFILTRATION: <Zap className="w-3.5 h-3.5" />,
  POLICY_VIOLATION: <FileWarning className="w-3.5 h-3.5" />,
};

export default function RecentActivity() {
  return (
    <div className="glass-card-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#e4e4e7' }}>
            Recent Activity
          </h3>
          <p className="text-xs mt-0.5" style={{ color: '#71717a' }}>
            Latest security events
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#22c55e', boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)' }}
          />
          <span className="text-xs" style={{ color: '#22c55e' }}>
            Live
          </span>
        </div>
      </div>

      <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
        {mockRecentActivity.map((activity, index) => {
          const color = getSeverityColor(activity.severity as LogSeverity);

          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg transition-all duration-200"
              style={{
                background: index % 2 === 0 ? 'transparent' : 'rgba(26, 26, 36, 0.3)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26, 26, 36, 0.6)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  index % 2 === 0 ? 'transparent' : 'rgba(26, 26, 36, 0.3)')
              }
            >
              {/* Severity indicator */}
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{
                  background: `${color}15`,
                  color: color,
                }}
              >
                {typeIcons[activity.type] || <AlertTriangle className="w-3.5 h-3.5" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed" style={{ color: '#e4e4e7' }}>
                  {activity.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      background: `${color}15`,
                      color: color,
                    }}
                  >
                    {activity.severity}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: '#71717a' }}>
                    {activity.sourceIp}
                  </span>
                  <span className="text-[10px]" style={{ color: '#71717a' }}>
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
