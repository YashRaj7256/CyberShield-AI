import type { LogSeverity } from '@/types';

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDateShort(date);
}

export function formatThreatScore(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 80)
    return { label: 'Critical', color: '#ef4444', bgColor: 'rgba(239,68,68,0.15)' };
  if (score >= 60)
    return { label: 'High', color: '#f97316', bgColor: 'rgba(249,115,22,0.15)' };
  if (score >= 40)
    return { label: 'Medium', color: '#eab308', bgColor: 'rgba(234,179,8,0.15)' };
  return { label: 'Low', color: '#22c55e', bgColor: 'rgba(34,197,94,0.15)' };
}

export function getSeverityColor(severity: LogSeverity): string {
  const colors: Record<LogSeverity, string> = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#22c55e',
  };
  return colors[severity] || '#71717a';
}

export function getSeverityBgColor(severity: LogSeverity): string {
  const colors: Record<LogSeverity, string> = {
    CRITICAL: 'rgba(239,68,68,0.15)',
    HIGH: 'rgba(249,115,22,0.15)',
    MEDIUM: 'rgba(234,179,8,0.15)',
    LOW: 'rgba(34,197,94,0.15)',
  };
  return colors[severity] || 'rgba(113,113,122,0.15)';
}

export function getActionColor(action: string): { text: string; bg: string } {
  const colors: Record<string, { text: string; bg: string }> = {
    ALLOW: { text: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    DENY: { text: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    DROP: { text: '#f97316', bg: 'rgba(249,115,22,0.15)' },
    ALERT: { text: '#eab308', bg: 'rgba(234,179,8,0.15)' },
    BLOCK: { text: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    QUARANTINE: { text: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  };
  return colors[action] || { text: '#71717a', bg: 'rgba(113,113,122,0.15)' };
}
