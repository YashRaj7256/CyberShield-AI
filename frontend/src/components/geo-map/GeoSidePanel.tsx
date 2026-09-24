'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Crosshair,
  Globe,
  Shield,
  TrendingUp,
} from 'lucide-react';
import type { GeoAttackOrigin, GeoCountryStats, LogSeverity } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SEVERITY_ORDER: Record<LogSeverity, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };

const SEVERITY_BADGE: Record<LogSeverity, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'rgba(34,197,94,0.10)', text: '#22c55e', border: 'rgba(34,197,94,0.25)' },
  MEDIUM: { bg: 'rgba(234,179,8,0.10)', text: '#eab308', border: 'rgba(234,179,8,0.25)' },
  HIGH: { bg: 'rgba(249,115,22,0.10)', text: '#f97316', border: 'rgba(249,115,22,0.25)' },
  CRITICAL: { bg: 'rgba(239,68,68,0.10)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' },
};

function getThreatColor(score: number): string {
  if (score >= 80) return '#ef4444';
  if (score >= 60) return '#f97316';
  if (score >= 40) return '#eab308';
  return '#22c55e';
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface GeoSidePanelProps {
  countries: GeoCountryStats[];
  origins: GeoAttackOrigin[];
  onFlyTo: (lat: number, lng: number) => void;
  onFilterChange: (filtered: GeoAttackOrigin[] | null) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GeoSidePanel({
  countries,
  origins,
  onFlyTo,
  onFilterChange,
}: GeoSidePanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<LogSeverity | ''>('');

  // Compute max attack count for progress bar scaling
  const maxAttackCount = useMemo(
    () => Math.max(...countries.map((c) => c.attackCount), 1),
    [countries],
  );

  // Apply filters
  useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sev = severityFilter;

    if (!q && !sev) {
      onFilterChange(null);
      return;
    }

    const filtered = origins.filter((o) => {
      if (sev && o.severity !== sev) return false;
      if (q) {
        const matchesCountry = o.country?.toLowerCase().includes(q);
        const matchesIp = o.sourceIp.includes(q);
        const matchesCity = o.city?.toLowerCase().includes(q);
        if (!matchesCountry && !matchesIp && !matchesCity) return false;
      }
      return true;
    });

    onFilterChange(filtered);
  }, [searchQuery, severityFilter, origins, onFilterChange]);

  if (collapsed) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          height: '100%',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'start',
          paddingTop: 12,
        }}
      >
        <button
          onClick={() => setCollapsed(false)}
          title="Open intelligence panel"
          style={{
            width: 36,
            height: 36,
            borderRadius: '8px 0 0 8px',
            background: 'rgba(11, 15, 25, 0.95)',
            border: '1px solid rgba(30, 41, 59, 0.9)',
            borderRight: 'none',
            color: '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 340,
        height: '100%',
        zIndex: 1000,
        background: 'rgba(11, 15, 25, 0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(30, 41, 59, 0.9)',
        borderRadius: '0 12px 12px 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ─── Header ─── */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Globe className="w-3.5 h-3.5" style={{ color: '#06b6d4' }} />
          </div>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#e2e8f0',
              letterSpacing: '-0.01em',
            }}
          >
            Threat Intelligence
          </span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse panel"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ─── Search & Filter ─── */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Search */}
        <div
          style={{
            position: 'relative',
            marginBottom: 8,
          }}
        >
          <Search
            className="w-3.5 h-3.5"
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#4b5563',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search country, IP, or city…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 32px',
              borderRadius: 8,
              background: '#1a1a24',
              border: '1px solid #2a2a3a',
              color: '#e4e4e7',
              fontSize: 11,
              outline: 'none',
            }}
          />
        </div>

        {/* Severity filter */}
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as LogSeverity | '')}
          style={{
            width: '100%',
            padding: '6px 10px',
            borderRadius: 8,
            background: '#1a1a24',
            border: '1px solid #2a2a3a',
            color: '#a1a1aa',
            fontSize: 11,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* ─── Country Leaderboard ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10,
          }}
        >
          <TrendingUp className="w-3 h-3" style={{ color: '#64748b' }} />
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#64748b',
              fontFamily: 'ui-monospace, monospace',
            }}
          >
            Top Attacking Countries
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {countries.map((country, idx) => {
            const barWidth = (country.attackCount / maxAttackCount) * 100;
            const threatColor = getThreatColor(country.avgThreatScore);

            return (
              <div
                key={country.country}
                className="feed-row"
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'default',
                }}
              >
                {/* Row 1: Rank + Country + FlyTo */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: idx < 3 ? '#ef4444' : '#4b5563',
                        fontFamily: 'ui-monospace, monospace',
                        width: 16,
                      }}
                    >
                      #{idx + 1}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#e2e8f0',
                      }}
                    >
                      {country.country}
                    </span>
                  </div>

                  <button
                    onClick={() => onFlyTo(country.latitude, country.longitude)}
                    title={`Fly to ${country.country}`}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'rgba(6,182,212,0.08)',
                      border: '1px solid rgba(6,182,212,0.2)',
                      color: '#06b6d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Crosshair className="w-3 h-3" />
                  </button>
                </div>

                {/* Row 2: Progress bar + stats */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        borderRadius: 2,
                        background: `linear-gradient(90deg, ${threatColor}90, ${threatColor})`,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: '#94a3b8',
                      fontFamily: 'ui-monospace, monospace',
                      minWidth: 40,
                      textAlign: 'right',
                    }}
                  >
                    {country.attackCount.toLocaleString()}
                  </span>
                </div>

                {/* Row 3: Avg threat score badge */}
                <div
                  style={{
                    marginTop: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 9, color: '#4b5563' }}>Avg Threat Score</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      fontFamily: 'ui-monospace, monospace',
                      color: threatColor,
                    }}
                  >
                    {country.avgThreatScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {countries.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 16px',
              color: '#4b5563',
              fontSize: 12,
            }}
          >
            <Shield className="w-6 h-6 mx-auto mb-2" style={{ opacity: 0.4 }} />
            No country data available
          </div>
        )}
      </div>
    </div>
  );
}
