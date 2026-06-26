'use client';

import { useEffect } from 'react';
import type { SecurityLog } from '@/types';
import { formatDate, getSeverityColor, getActionColor, formatThreatScore } from '@/lib/format';
import { X, ExternalLink, Shield, Globe, Clock, Server, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LogDetailDrawerProps {
  log: SecurityLog;
  onClose: () => void;
}

export default function LogDetailDrawer({ log, onClose }: LogDetailDrawerProps) {
  const [showRaw, setShowRaw] = useState(false);
  const sevColor = getSeverityColor(log.severity);
  const actColor = getActionColor(log.action);
  const threat = log.threatScore ? formatThreatScore(log.threatScore) : null;

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-[520px] max-w-[90vw] z-50 overflow-y-auto animate-slide-in-right"
        style={{
          background: '#111118',
          borderLeft: '1px solid #2a2a3a',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{
            background: 'rgba(17, 17, 24, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid #2a2a3a',
          }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#e4e4e7' }}>
              Log Detail
            </h3>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#71717a' }}>
              {log.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{ color: '#71717a' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1a1a24';
              e.currentTarget.style.color = '#e4e4e7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#71717a';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Severity & Action Row */}
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: `${sevColor}15`, color: sevColor }}
            >
              {log.severity}
            </span>
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{ background: actColor.bg, color: actColor.text }}
            >
              {log.action}
            </span>
            <span
              className="text-xs font-medium px-3 py-1.5 rounded-lg"
              style={{ background: '#1a1a24', color: '#a1a1aa', border: '1px solid #2a2a3a' }}
            >
              {log.protocol}
            </span>
          </div>

          {/* Threat Score */}
          {threat && log.threatScore !== null && (
            <div
              className="p-4 rounded-xl"
              style={{
                background: threat.bgColor,
                border: `1px solid ${threat.color}30`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: threat.color }} />
                  <span className="text-xs font-medium" style={{ color: threat.color }}>
                    Threat Score
                  </span>
                </div>
                <span className="text-2xl font-bold" style={{ color: threat.color }}>
                  {log.threatScore}
                  <span className="text-sm font-normal">/100</span>
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: '#0a0a0f' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${log.threatScore}%`,
                    background: `linear-gradient(90deg, ${threat.color}, ${threat.color}88)`,
                    boxShadow: `0 0 10px ${threat.color}40`,
                  }}
                />
              </div>
              <span className="text-[10px] mt-1 block" style={{ color: `${threat.color}aa` }}>
                {threat.label} Risk
              </span>
            </div>
          )}

          {/* Network Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>
              Network Information
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoField
                icon={<Server className="w-3.5 h-3.5" />}
                label="Source IP"
                value={log.sourceIp}
                mono
              />
              <InfoField
                icon={<Server className="w-3.5 h-3.5" />}
                label="Destination IP"
                value={log.destinationIp}
                mono
              />
              <InfoField
                icon={<ExternalLink className="w-3.5 h-3.5" />}
                label="Source Port"
                value={String(log.sourcePort)}
              />
              <InfoField
                icon={<ExternalLink className="w-3.5 h-3.5" />}
                label="Destination Port"
                value={String(log.destinationPort)}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>
              Location
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoField
                icon={<Globe className="w-3.5 h-3.5" />}
                label="Country"
                value={log.country}
              />
              <InfoField
                icon={<Globe className="w-3.5 h-3.5" />}
                label="City"
                value={log.city}
              />
            </div>
          </div>

          {/* Event Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#71717a' }}>
              Event Details
            </h4>
            <div className="space-y-3">
              <InfoField
                icon={<Clock className="w-3.5 h-3.5" />}
                label="Timestamp"
                value={formatDate(log.timestamp)}
              />
              <InfoField
                label="Event Type"
                value={log.eventType}
              />
              <InfoField
                label="Source"
                value={log.source}
              />
              <div
                className="p-3 rounded-lg"
                style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}
              >
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: '#71717a' }}>
                  Message
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#e4e4e7' }}>
                  {log.message}
                </p>
              </div>
            </div>
          </div>

          {/* Raw Data */}
          <div>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center gap-2 text-xs font-medium transition-colors"
              style={{ color: '#71717a' }}
            >
              <ChevronDown
                className="w-4 h-4 transition-transform duration-200"
                style={{ transform: showRaw ? 'rotate(180deg)' : 'rotate(0)' }}
              />
              Raw JSON Data
            </button>
            {showRaw && (
              <pre
                className="mt-2 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed"
                style={{
                  background: '#0a0a0f',
                  border: '1px solid #2a2a3a',
                  color: '#a1a1aa',
                }}
              >
                {JSON.stringify(log, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoField({
  icon,
  label,
  value,
  mono,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span style={{ color: '#71717a' }}>{icon}</span>}
        <p className="text-[10px] uppercase tracking-wider" style={{ color: '#71717a' }}>
          {label}
        </p>
      </div>
      <p
        className={`text-sm font-medium ${mono ? 'font-mono' : ''}`}
        style={{ color: '#e4e4e7' }}
      >
        {value}
      </p>
    </div>
  );
}
