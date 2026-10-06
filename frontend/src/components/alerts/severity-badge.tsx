'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SeverityBadgeProps {
  severity: string;
  threatScore?: number;
  className?: string;
}

export interface SeverityTokenMeta {
  label: string;
  varName: string;
  hex: string;
  rgb: [number, number, number];
  scoreBand: string;
}

export const SEVERITY_TOKENS: Record<string, SeverityTokenMeta> = {
  CRITICAL: {
    label: 'Critical',
    varName: 'var(--severity-critical, #F43F5E)',
    hex: '#F43F5E',
    rgb: [244, 63, 94],
    scoreBand: '80–100',
  },
  HIGH: {
    label: 'High',
    varName: 'var(--severity-high, #F59E0B)',
    hex: '#F59E0B',
    rgb: [245, 158, 11],
    scoreBand: '60–79',
  },
  MEDIUM: {
    label: 'Medium',
    varName: 'var(--severity-medium, #EAB308)',
    hex: '#EAB308',
    rgb: [234, 179, 8],
    scoreBand: '40–59',
  },
  LOW: {
    label: 'Low',
    varName: 'var(--severity-low, #22C55E)',
    hex: '#22C55E',
    rgb: [34, 197, 94],
    scoreBand: '0–39',
  },
  ALL: {
    label: 'All',
    varName: 'var(--severity-all, #22D3EE)',
    hex: '#22D3EE',
    rgb: [34, 211, 238],
    scoreBand: '0–100',
  },
};

export function getSeverityMeta(severity?: string): SeverityTokenMeta {
  const key = (severity || 'LOW').toUpperCase();
  return SEVERITY_TOKENS[key] || SEVERITY_TOKENS.LOW;
}

export function SeverityBadge({
  severity,
  threatScore,
  className,
}: SeverityBadgeProps) {
  const meta = getSeverityMeta(severity);
  const roundedScore = threatScore != null ? Math.round(threatScore) : undefined;
  const tooltipText = roundedScore != null
    ? `${meta.label}: ${meta.scoreBand} (Risk Score: ${roundedScore}/100)`
    : `${meta.label}: ${meta.scoreBand}`;

  const [r, g, b] = meta.rgb;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center gap-1.5 w-[92px] h-[22px] rounded-[6px] shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] select-none transition-all',
        className
      )}
      style={{
        background: `rgba(${r}, ${g}, ${b}, 0.12)`,
        border: `1px solid rgba(${r}, ${g}, ${b}, 0.35)`,
        color: meta.varName,
      }}
      title={tooltipText}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: meta.varName,
        }}
        aria-hidden="true"
      />
      <span className="truncate">{meta.label}</span>
    </div>
  );
}

export default SeverityBadge;
