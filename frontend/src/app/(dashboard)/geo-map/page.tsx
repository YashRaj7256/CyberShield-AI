'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Globe,
  Crosshair,
  Shield,
  AlertTriangle,
  Radio,
  Anchor,
  RefreshCw,
  FlaskConical,
} from 'lucide-react';
import GeoAttackMapWrapper from '@/components/geo-map/GeoAttackMapWrapper';
import GeoSidePanel from '@/components/geo-map/GeoSidePanel';
import { useApi } from '@/hooks/use-api';
import { mockGeoAttackData } from '@/lib/mock-data';
import type { GeoAttackData, GeoAttackOrigin } from '@/types';
import type { GeoAttackMapHandle } from '@/components/geo-map/GeoAttackMap';

// ---------------------------------------------------------------------------
// Metric Ribbon stat item
// ---------------------------------------------------------------------------
function MetricItem({
  icon,
  label,
  value,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accentColor: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 16px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        minWidth: 180,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${accentColor}14`,
          border: `1px solid ${accentColor}30`,
          color: accentColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#64748b',
            fontFamily: 'ui-monospace, monospace',
            marginBottom: 1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#e2e8f0',
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '-0.02em',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function MapSkeleton() {
  return (
    <div
      className="animate-shimmer"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 12,
        background: 'rgba(11, 15, 25, 0.92)',
        border: '1px solid rgba(30, 41, 59, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <Globe className="w-8 h-8" style={{ color: '#1e293b', opacity: 0.6 }} />
      <span style={{ color: '#4b5563', fontSize: 12, fontWeight: 500 }}>
        Initializing geographical threat engine…
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 12,
        background: 'rgba(11, 15, 25, 0.92)',
        border: '1px solid rgba(30, 41, 59, 0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Shield className="w-7 h-7" style={{ color: '#22c55e' }} />
      </div>
      <span style={{ color: '#94a3b8', fontSize: 14, fontWeight: 600 }}>
        No Geo-Located Threats Detected
      </span>
      <span style={{ color: '#4b5563', fontSize: 11, maxWidth: 280, textAlign: 'center' }}>
        All attack origins lack geolocation data, or no security events have been recorded in the past 30 days.
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function GeoMapPage() {
  const mapRef = useRef<GeoAttackMapHandle>(null);
  const [filteredOrigins, setFilteredOrigins] = useState<GeoAttackOrigin[] | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── API call ──────────────────────────────────────────────────────────────
  const {
    data: rawData,
    isLoading,
    isUsingFallback,
    refetch,
  } = useApi<GeoAttackData>('/dashboard/geo-attacks', undefined, {
    fallbackData: undefined,
  });

  const data: GeoAttackData = rawData ?? mockGeoAttackData;
  const isFallback = isUsingFallback || !rawData;

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  // ── Fly-to handler ────────────────────────────────────────────────────────
  const handleFlyTo = useCallback((lat: number, lng: number) => {
    mapRef.current?.flyTo(lat, lng, 6);
  }, []);

  // ── Filter handler ────────────────────────────────────────────────────────
  const handleFilterChange = useCallback((filtered: GeoAttackOrigin[] | null) => {
    setFilteredOrigins(filtered);
  }, []);

  const hasOrigins = data.attackOrigins.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COMMAND HEADER                                                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          padding: '18px 24px',
          background: 'rgba(11, 15, 25, 0.95)',
          border: '1px solid rgba(30, 41, 59, 0.9)',
        }}
      >
        {/* Top accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-500/80 via-blue-500/70 to-purple-500/60" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.25)',
              }}
            >
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-[17px] font-bold text-white tracking-tight">
                  Geographical Attack Map
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-950/50 text-cyan-400 border border-cyan-800/40">
                  GEO-INT
                </span>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Real-time attack origin visualization with geospatial threat intelligence
              </p>
            </div>
          </div>

          {/* Right: Status + Refresh */}
          <div className="flex items-center gap-2.5">
            {!isLoading && (
              isFallback ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-amber-950/40 text-amber-400 border border-amber-800/50">
                  <FlaskConical className="w-3 h-3" />
                  SANDBOX MODE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE TELEMETRY
                </span>
              )
            )}

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-mono font-medium transition-all cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Sync</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* METRIC RIBBON                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          padding: '12px 20px',
          background: 'rgba(11, 15, 25, 0.92)',
          border: '1px solid rgba(30, 41, 59, 0.9)',
        }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <MetricItem
            icon={<Crosshair className="w-4 h-4" />}
            label="Active Attack Origins"
            value={isLoading ? '—' : data.summary.totalOrigins.toLocaleString()}
            accentColor="#ef4444"
          />
          <MetricItem
            icon={<Anchor className="w-4 h-4" />}
            label="Most Targeted Port"
            value={isLoading ? '—' : data.summary.mostTargetedPort ?? '—'}
            accentColor="#f59e0b"
          />
          <MetricItem
            icon={<AlertTriangle className="w-4 h-4" />}
            label="High-Risk Jurisdiction"
            value={isLoading ? '—' : data.summary.topMaliciousCountry}
            accentColor="#8b5cf6"
          />
          <MetricItem
            icon={<Radio className="w-4 h-4" />}
            label="Critical Regional Threats"
            value={isLoading ? '—' : data.summary.criticalRegionalThreats}
            accentColor="#06b6d4"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MAP + SIDE PANEL                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          position: 'relative',
          height: 'calc(100vh - 340px)',
          minHeight: 420,
          background: 'rgba(11, 15, 25, 0.92)',
          border: '1px solid rgba(30, 41, 59, 0.9)',
        }}
      >
        {isLoading ? (
          <MapSkeleton />
        ) : !hasOrigins ? (
          <EmptyState />
        ) : (
          <>
            <GeoAttackMapWrapper
              ref={mapRef}
              origins={data.attackOrigins}
              filteredOrigins={filteredOrigins ?? undefined}
            />
            <GeoSidePanel
              countries={data.topCountries}
              origins={data.attackOrigins}
              onFlyTo={handleFlyTo}
              onFilterChange={handleFilterChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
