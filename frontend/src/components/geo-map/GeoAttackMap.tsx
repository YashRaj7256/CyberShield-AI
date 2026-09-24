'use client';

import { useEffect, useRef, useCallback, useState, useImperativeHandle, forwardRef } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as LeafletIcon, Layers } from 'lucide-react';
import type { GeoAttackOrigin, LogSeverity } from '@/types';

// ---------------------------------------------------------------------------
// Fix Leaflet default icon paths (Next.js breaks the auto-detection)
// ---------------------------------------------------------------------------
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: '',
  iconRetinaUrl: '',
  shadowUrl: '',
});

// ---------------------------------------------------------------------------
// Severity → CSS class mapping
// ---------------------------------------------------------------------------
const SEVERITY_CLASS: Record<LogSeverity, string> = {
  LOW: 'geo-marker-low',
  MEDIUM: 'geo-marker-medium',
  HIGH: 'geo-marker-high',
  CRITICAL: 'geo-marker-critical',
};

const SEVERITY_BADGE_COLORS: Record<LogSeverity, { bg: string; text: string; border: string }> = {
  LOW: { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', border: 'rgba(34,197,94,0.3)' },
  MEDIUM: { bg: 'rgba(234,179,8,0.12)', text: '#eab308', border: 'rgba(234,179,8,0.3)' },
  HIGH: { bg: 'rgba(249,115,22,0.12)', text: '#f97316', border: 'rgba(249,115,22,0.3)' },
  CRITICAL: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' },
};

function createSeverityIcon(severity: LogSeverity): L.DivIcon {
  const cls = SEVERITY_CLASS[severity] || 'geo-marker-low';
  return L.divIcon({
    className: '',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
    html: `<div class="geo-marker ${cls}"><div class="geo-marker-ping"></div><div class="geo-marker-dot"></div></div>`,
  });
}

// ---------------------------------------------------------------------------
// Tile layer definitions
// ---------------------------------------------------------------------------
interface TileConfig {
  name: string;
  url: string;
  attribution: string;
  dark?: boolean; // applies CSS invert filter to create dark tiles
}

const TILE_LAYERS: TileConfig[] = [
  {
    name: 'Dark (SOC)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    dark: true,
  },
  {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    dark: false,
  },
  {
    name: 'OSM Humanitarian',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://hot.openstreetmap.org/">HOT</a>',
    dark: false,
  },
];

// ---------------------------------------------------------------------------
// FlyTo helper component (needed because useMap must be inside MapContainer)
// ---------------------------------------------------------------------------
function FlyToHandler({ target }: { target: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.5 });
    }
  }, [map, target]);
  return null;
}

/**
 * Applies a CSS invert + hue-rotate filter on the Leaflet tile pane to
 * transform standard OSM tiles into a dark-mode style.
 * This avoids requiring any paid tile API keys.
 */
function DarkTileHandler({ dark }: { dark: boolean }) {
  const map = useMap();
  useEffect(() => {
    const tilePane = map.getPane('tilePane');
    if (tilePane) {
      tilePane.style.filter = dark
        ? 'invert(1) hue-rotate(200deg) brightness(0.85) contrast(1.1) saturate(0.25)'
        : 'none';
    }
  }, [map, dark]);
  return null;
}

// ---------------------------------------------------------------------------
// Popup content
// ---------------------------------------------------------------------------
function PopupContent({ origin }: { origin: GeoAttackOrigin }) {
  const badge = SEVERITY_BADGE_COLORS[origin.severity] || SEVERITY_BADGE_COLORS.LOW;
  const timeAgo = getTimeAgo(origin.timestamp);

  return (
    <div style={{ padding: '14px 16px', minWidth: 220 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 13,
            fontWeight: 700,
            color: '#e2e8f0',
          }}
        >
          {origin.sourceIp}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 6,
            background: badge.bg,
            color: badge.text,
            border: `1px solid ${badge.border}`,
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.05em',
          }}
        >
          {origin.severity}
        </span>
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 -16px 10px', padding: '0 16px' }} />

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: 11 }}>
        <div>
          <span style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>City</span>
          <div style={{ color: '#cbd5e1', fontWeight: 500 }}>{origin.city || '—'}</div>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Country</span>
          <div style={{ color: '#cbd5e1', fontWeight: 500 }}>{origin.country || '—'}</div>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Event Type</span>
          <div style={{ color: '#cbd5e1', fontWeight: 500 }}>{origin.eventType.replace(/_/g, ' ')}</div>
        </div>
        <div>
          <span style={{ color: '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Threat Score</span>
          <div style={{ color: badge.text, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
            {origin.threatScore}/100
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 10,
          color: '#64748b',
        }}
      >
        <span>{origin.count} event{origin.count !== 1 ? 's' : ''}</span>
        <span>{timeAgo}</span>
      </div>
    </div>
  );
}

function getTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---------------------------------------------------------------------------
// Tile layer switcher control
// ---------------------------------------------------------------------------
function TileLayerSwitcher({
  activeTile,
  onSwitch,
}: {
  activeTile: number;
  onSwitch: (index: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: 'absolute',
        top: 80,
        right: 10,
        zIndex: 1000,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        title="Switch map style"
        style={{
          width: 34,
          height: 34,
          borderRadius: 4,
          background: 'rgba(11, 15, 25, 0.92)',
          border: '1px solid rgba(30, 41, 59, 0.9)',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Layers className="w-4 h-4" />
      </button>

      {open && (
        <div
          style={{
            marginTop: 4,
            background: 'rgba(11, 15, 25, 0.95)',
            border: '1px solid rgba(30, 41, 59, 0.9)',
            borderRadius: 8,
            overflow: 'hidden',
            minWidth: 160,
          }}
        >
          {TILE_LAYERS.map((tile, i) => (
            <button
              key={tile.name}
              onClick={() => {
                onSwitch(i);
                setOpen(false);
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                fontSize: 11,
                fontWeight: activeTile === i ? 600 : 400,
                color: activeTile === i ? '#06b6d4' : '#94a3b8',
                background: activeTile === i ? 'rgba(6,182,212,0.08)' : 'transparent',
                border: 'none',
                borderBottom: i < TILE_LAYERS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: 'pointer',
              }}
            >
              {tile.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main GeoAttackMap component
// ---------------------------------------------------------------------------
export interface GeoAttackMapHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

interface GeoAttackMapProps {
  origins: GeoAttackOrigin[];
  filteredOrigins?: GeoAttackOrigin[];
}

const GeoAttackMap = forwardRef<GeoAttackMapHandle, GeoAttackMapProps>(
  function GeoAttackMap({ origins, filteredOrigins }, ref) {
    const [activeTile, setActiveTile] = useState(0);
    const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
    const flyKeyRef = useRef(0);

    const displayOrigins = filteredOrigins ?? origins;

    useImperativeHandle(
      ref,
      () => ({
        flyTo: (lat: number, lng: number, zoom = 6) => {
          flyKeyRef.current += 1;
          setFlyTarget({ lat, lng, zoom });
        },
      }),
      [],
    );

    const tile = TILE_LAYERS[activeTile];

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <MapContainer
          center={[20, 15]}
          zoom={2.5}
          minZoom={2}
          maxZoom={18}
          scrollWheelZoom
          zoomControl
          style={{ width: '100%', height: '100%', borderRadius: 12 }}
          worldCopyJump
        >
          <TileLayer
            key={tile.name}
            url={tile.url}
            attribution={tile.attribution}
            subdomains="abc"
          />

          <DarkTileHandler dark={!!tile.dark} />
          <FlyToHandler target={flyTarget} />

          {displayOrigins.map((origin) => (
            <Marker
              key={origin.sourceIp}
              position={[origin.latitude, origin.longitude]}
              icon={createSeverityIcon(origin.severity)}
            >
              <Popup maxWidth={280} minWidth={240}>
                <PopupContent origin={origin} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Tile layer switcher overlay */}
        <TileLayerSwitcher activeTile={activeTile} onSwitch={setActiveTile} />

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: 10,
            zIndex: 1000,
            background: 'rgba(11, 15, 25, 0.92)',
            border: '1px solid rgba(30, 41, 59, 0.9)',
            borderRadius: 8,
            padding: '8px 12px',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
          }}
        >
          {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as LogSeverity[]).map((sev) => {
            const badge = SEVERITY_BADGE_COLORS[sev];
            return (
              <div key={sev} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: badge.text,
                    boxShadow: `0 0 6px ${badge.text}80`,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 500, textTransform: 'capitalize' }}>
                  {sev.toLowerCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

export default GeoAttackMap;
