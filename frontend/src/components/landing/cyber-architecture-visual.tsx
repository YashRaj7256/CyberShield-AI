'use client';

import { useRef, useState, useEffect } from 'react';
import {
  Shield,
  Database,
  Cpu,
  BarChart2,
  Bell,
  Layers,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';

/* ─── Design tokens (aligned with the rest of the landing page) ─── */
const CYAN     = '#22d3ee';
const CYAN_DIM = 'rgba(6,182,212,0.12)';
const BORDER   = 'rgba(255,255,255,0.07)';
const SURF     = 'rgba(255,255,255,0.025)';
const BG_DEEP  = '#060911';

/* ─── Scroll-reveal hook ─────────────────────────────────────────── */
function useReveal(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ─── Pipeline stage data ────────────────────────────────────────── */
const PIPELINE_STAGES = [
  {
    id: 'ingest',
    step: '01',
    label: 'Log Ingestion',
    shortLabel: 'INGEST',
    description:
      'Raw security events from auth systems, network devices, firewalls, and endpoints are ingested in real time.',
    icon: Database,
    color: '#22d3ee',
    accentBg: 'rgba(6,182,212,0.08)',
    accentBorder: 'rgba(6,182,212,0.22)',
    tag: 'DATA',
    tagColor: 'rgba(6,182,212,0.18)',
    tagText: '#22d3ee',
  },
  {
    id: 'extract',
    step: '02',
    label: 'Feature Extraction',
    shortLabel: 'EXTRACT',
    description:
      'Structured features are derived — request frequency, protocol, IP reputation, session patterns — ready for ML scoring.',
    icon: Layers,
    color: '#818cf8',
    accentBg: 'rgba(99,102,241,0.08)',
    accentBorder: 'rgba(99,102,241,0.22)',
    tag: 'TRANSFORM',
    tagColor: 'rgba(99,102,241,0.18)',
    tagText: '#818cf8',
  },
  {
    id: 'model',
    step: '03',
    label: 'AI Anomaly Detection',
    shortLabel: 'DETECT',
    description:
      'Isolation Forest and One-Class SVM independently score each event against a learned baseline of normal behaviour.',
    icon: Cpu,
    color: '#22d3ee',
    accentBg: 'rgba(6,182,212,0.1)',
    accentBorder: 'rgba(6,182,212,0.35)',
    tag: 'AI CORE',
    tagColor: 'rgba(6,182,212,0.2)',
    tagText: '#22d3ee',
    isCore: true,
  },
  {
    id: 'score',
    step: '04',
    label: 'Threat Scoring',
    shortLabel: 'SCORE',
    description:
      'A composite risk score (0–100) is calculated from anomaly signals, event velocity, and contextual severity weighting.',
    icon: BarChart2,
    color: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.22)',
    tag: 'RISK',
    tagColor: 'rgba(245,158,11,0.18)',
    tagText: '#f59e0b',
  },
  {
    id: 'alert',
    step: '05',
    label: 'Security Alert',
    shortLabel: 'ALERT',
    description:
      'High-scoring events are flagged and presented to the SOC team with event context, timeline, and category classification.',
    icon: Bell,
    color: '#f87171',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.22)',
    tag: 'SOC',
    tagColor: 'rgba(239,68,68,0.18)',
    tagText: '#f87171',
  },
];

/* ─── Threat categories ──────────────────────────────────────────── */
const THREAT_CATEGORIES = [
  { label: 'Authentication Brute Force', sev: 'HIGH',     sevBg: 'rgba(249,115,22,0.12)', sevBorder: 'rgba(249,115,22,0.25)', sevText: '#fb923c' },
  { label: 'Suspicious Login',           sev: 'MEDIUM',   sevBg: 'rgba(234,179,8,0.12)',  sevBorder: 'rgba(234,179,8,0.25)',  sevText: '#facc15' },
  { label: 'Port Scanning',              sev: 'MEDIUM',   sevBg: 'rgba(234,179,8,0.12)',  sevBorder: 'rgba(234,179,8,0.25)',  sevText: '#facc15' },
  { label: 'DDoS / Flood',               sev: 'CRITICAL', sevBg: 'rgba(239,68,68,0.12)',  sevBorder: 'rgba(239,68,68,0.25)',  sevText: '#f87171' },
  { label: 'Malware Behaviour',          sev: 'CRITICAL', sevBg: 'rgba(239,68,68,0.12)',  sevBorder: 'rgba(239,68,68,0.25)',  sevText: '#f87171' },
  { label: 'Credential Stuffing',        sev: 'HIGH',     sevBg: 'rgba(249,115,22,0.12)', sevBorder: 'rgba(249,115,22,0.25)', sevText: '#fb923c' },
  { label: 'Insider Threat Indicators',  sev: 'HIGH',     sevBg: 'rgba(249,115,22,0.12)', sevBorder: 'rgba(249,115,22,0.25)', sevText: '#fb923c' },
  { label: 'Unauthorized Access',        sev: 'HIGH',     sevBg: 'rgba(249,115,22,0.12)', sevBorder: 'rgba(249,115,22,0.25)', sevText: '#fb923c' },
];

/* ─── ML models data ─────────────────────────────────────────────── */
const ML_MODELS = [
  {
    name: 'Isolation Forest',
    description:
      'Unsupervised ensemble method that isolates anomalies by randomly partitioning feature space. Effective at detecting outliers in high-dimensional log data.',
    color: '#22d3ee',
    accentBg: 'rgba(6,182,212,0.06)',
    accentBorder: 'rgba(6,182,212,0.2)',
    output: 'Anomaly Score',
  },
  {
    name: 'One-Class SVM',
    description:
      'Learns a tight decision boundary around normal behaviour. Events falling outside the learned boundary are flagged for further scoring.',
    color: '#818cf8',
    accentBg: 'rgba(129,140,248,0.06)',
    accentBorder: 'rgba(129,140,248,0.2)',
    output: 'Anomaly Score',
  },
];

/* ═══════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

/* ── Horizontal desktop connector ── */
function HConnector({ color }: { color: string }) {
  return (
    <div
      className="hidden lg:flex items-center justify-center flex-shrink-0"
      style={{ width: 32, margin: '0 2px' }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <div
          style={{
            flex: 1,
            height: 1,
            background: `linear-gradient(to right, rgba(255,255,255,0.06), ${color}60)`,
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `5px solid ${color}60`,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}

/* ── Vertical mobile connector ── */
function VConnector({ color }: { color: string }) {
  return (
    <div
      className="lg:hidden flex flex-col items-center"
      style={{ height: 28, margin: '2px 0' }}
    >
      <div
        style={{
          width: 1,
          flex: 1,
          background: `linear-gradient(to bottom, rgba(255,255,255,0.06), ${color}55)`,
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: `5px solid ${color}55`,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          flexShrink: 0,
        }}
      />
    </div>
  );
}

/* ── Pipeline card ── */
function PipelineCard({
  stage,
  index,
  visible,
}: {
  stage: typeof PIPELINE_STAGES[0];
  index: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = stage.icon;
  const isCore = stage.isCore;

  return (
    <div
      className="flex-1 min-w-0 flex flex-col"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.55s ease ${index * 80}ms, transform 0.55s ease ${index * 80}ms`,
      }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          padding: isCore ? '24px 20px' : '20px',
          borderRadius: 14,
          background: hovered
            ? `linear-gradient(160deg, ${stage.accentBg}, rgba(255,255,255,0.02))`
            : isCore
            ? `linear-gradient(160deg, rgba(6,182,212,0.07), rgba(99,102,241,0.04))`
            : stage.accentBg,
          border: `1px solid ${hovered ? stage.color + '55' : isCore ? stage.color + '45' : stage.accentBorder}`,
          boxShadow: hovered
            ? `0 8px 28px rgba(0,0,0,0.35), 0 0 0 1px ${stage.color}20`
            : isCore
            ? `0 4px 20px rgba(0,0,0,0.25), 0 0 20px ${stage.color}08`
            : 'none',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'all 0.25s ease',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Subtle top-edge accent for core card */}
        {isCore && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: 1,
              background: `linear-gradient(to right, transparent, ${CYAN}60, transparent)`,
            }}
          />
        )}

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: stage.color,
              opacity: 0.65,
            }}
          >
            {stage.step}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              padding: '2px 7px',
              borderRadius: 4,
              background: stage.tagColor,
              color: stage.tagText,
              textTransform: 'uppercase',
            }}
          >
            {stage.tag}
          </span>
        </div>

        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: isCore ? 38 : 32,
              height: isCore ? 38 : 32,
              borderRadius: 10,
              border: `1px solid ${stage.color}30`,
              background: `${stage.color}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.25s ease',
              boxShadow: hovered ? `0 0 12px ${stage.color}25` : 'none',
            }}
          >
            <Icon style={{ width: isCore ? 18 : 15, height: isCore ? 18 : 15, color: stage.color }} />
          </div>
          <h3
            style={{
              fontSize: isCore ? 15 : 13,
              fontWeight: 700,
              color: '#f1f5f9',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {stage.label}
          </h3>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            color: '#64748b',
            lineHeight: 1.65,
            flex: 1,
          }}
        >
          {stage.description}
        </p>

        {/* Core: model tags */}
        {isCore && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 5,
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 600,
                background: 'rgba(6,182,212,0.1)',
                border: '1px solid rgba(6,182,212,0.25)',
                color: CYAN,
              }}
            >
              Isolation Forest
            </span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 5,
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 600,
                background: 'rgba(129,140,248,0.1)',
                border: '1px solid rgba(129,140,248,0.25)',
                color: '#818cf8',
              }}
            >
              One-Class SVM
            </span>
          </div>
        )}

        {/* Score badge for Threat Scoring card */}
        {stage.id === 'score' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 2,
            }}
          >
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 22,
                fontWeight: 800,
                color: stage.color,
                lineHeight: 1,
              }}
            >
              0–100
            </span>
            <span style={{ fontSize: 10, color: '#475569', marginLeft: 4 }}>risk scale</span>
          </div>
        )}

        {/* Alert badge for Security Alert card */}
        {stage.id === 'alert' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 999,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              width: 'fit-content',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#f87171',
                display: 'inline-block',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#f87171' }}>
              SOC NOTIFIED
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Threat card ── */
function ThreatCard({
  threat,
  index,
  visible,
}: {
  threat: typeof THREAT_CATEGORIES[0];
  index: number;
  visible: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: hovered ? 'rgba(255,255,255,0.035)' : SURF,
        border: `1px solid ${hovered ? threat.sevBorder : BORDER}`,
        boxShadow: hovered ? `0 6px 24px rgba(0,0,0,0.3)` : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: visible ? 1 : 0,
        transitionProperty: 'opacity, transform, border-color, box-shadow, background',
        transitionDuration: visible ? `0.22s, 0.5s, 0.22s, 0.22s, 0.22s` : '0.5s',
        transitionDelay: visible ? `0ms, ${index * 55}ms, 0ms, 0ms, 0ms` : `${index * 55}ms`,
        transitionTimingFunction: 'ease',
      }}
    >
      {/* Severity + Active */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            padding: '2px 7px',
            borderRadius: 4,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.08em',
            background: threat.sevBg,
            border: `1px solid ${threat.sevBorder}`,
            color: threat.sevText,
          }}
        >
          {threat.sev}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 9,
            fontFamily: 'monospace',
            fontWeight: 600,
            color: '#4ade80',
          }}
        >
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: '#4ade80',
              display: 'inline-block',
            }}
          />
          ACTIVE
        </span>
      </div>

      {/* Threat name */}
      <p
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#cbd5e1',
          lineHeight: 1.35,
        }}
      >
        {threat.label}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════ */
export default function CyberArchitectureVisual() {
  const pipeline = useReveal(0.06);
  const threats  = useReveal(0.06);
  const mlArch   = useReveal(0.06);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — HOW CYBERSHIELD AI WORKS
      ══════════════════════════════════════════════════════════════ */}
      <div ref={pipeline.ref}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 14px',
              borderRadius: 999,
              background: CYAN_DIM,
              border: '1px solid rgba(6,182,212,0.25)',
              marginBottom: 18,
            }}
          >
            <Database style={{ width: 12, height: 12, color: CYAN }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                color: CYAN,
              }}
            >
              Automated Threat Pipeline
            </span>
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.025em',
              margin: '0 0 12px',
              lineHeight: 1.12,
            }}
          >
            How CyberShield AI Works
          </h2>
          <p
            style={{
              fontSize: 15,
              color: '#475569',
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            Raw security logs enter the pipeline and are transformed into actionable threat intelligence.
          </p>
        </div>

        {/* Desktop: horizontal pipeline */}
        <div
          className="hidden lg:flex"
          style={{ alignItems: 'stretch', gap: 0 }}
        >
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0 }}>
              <PipelineCard stage={stage} index={i} visible={pipeline.visible} />
              {i < PIPELINE_STAGES.length - 1 && (
                <HConnector color={PIPELINE_STAGES[i + 1].color} />
              )}
            </div>
          ))}
        </div>

        {/* Mobile: vertical pipeline */}
        <div
          className="flex lg:hidden flex-col"
          style={{ gap: 0 }}
        >
          {PIPELINE_STAGES.map((stage, i) => (
            <div key={stage.id}>
              <PipelineCard stage={stage} index={i} visible={pipeline.visible} />
              {i < PIPELINE_STAGES.length - 1 && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <VConnector color={PIPELINE_STAGES[i + 1].color} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — THREATS MONITORED IN REAL TIME
      ══════════════════════════════════════════════════════════════ */}
      <div ref={threats.ref} id="threats">

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 14px',
              borderRadius: 999,
              background: CYAN_DIM,
              border: '1px solid rgba(6,182,212,0.25)',
              marginBottom: 18,
            }}
          >
            <Shield style={{ width: 12, height: 12, color: CYAN }} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.13em',
                textTransform: 'uppercase',
                color: CYAN,
              }}
            >
              Multi-Vector Detection
            </span>
          </div>
          <h2
            id="threats"
            style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.025em',
              margin: '0 0 12px',
              lineHeight: 1.12,
            }}
          >
            Threats Monitored in Real Time
          </h2>
          <p
            style={{
              fontSize: 15,
              color: '#475569',
              maxWidth: 560,
              margin: '0 auto',
              lineHeight: 1.65,
            }}
          >
            Continuous anomaly analysis across these attack categories, with automated severity classification
            and contextual rule-based categorization.
          </p>
        </div>

        {/* Threat cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 10,
            marginBottom: 56,
          }}
        >
          {THREAT_CATEGORIES.map((t, i) => (
            <ThreatCard key={t.label} threat={t} index={i} visible={threats.visible} />
          ))}
        </div>

        {/* ── ML Architecture visualization ── */}
        <div
          ref={mlArch.ref}
          id="ml-arch"
          style={{
            borderRadius: 18,
            border: `1px solid rgba(255,255,255,0.07)`,
            background: 'linear-gradient(160deg, #08091a 0%, #060911 55%, #08091a 100%)',
            padding: 'clamp(28px, 5vw, 48px)',
            position: 'relative',
            overflow: 'hidden',
            opacity: mlArch.visible ? 1 : 0,
            transform: mlArch.visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          {/* Ambient glow */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: '-30%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60%',
              height: '80%',
              borderRadius: '50%',
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse, rgba(6,182,212,0.06), transparent 70%)',
            }}
          />

          {/* Arch header */}
          <div style={{ textAlign: 'center', marginBottom: 40, position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '5px 14px',
                borderRadius: 999,
                background: 'rgba(129,140,248,0.1)',
                border: '1px solid rgba(129,140,248,0.22)',
                marginBottom: 16,
              }}
            >
              <Cpu style={{ width: 12, height: 12, color: '#818cf8' }} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                  color: '#818cf8',
                }}
              >
                ML Architecture
              </span>
            </div>
            <h3
              style={{
                fontSize: 'clamp(1.3rem, 2.5vw, 1.9rem)',
                fontWeight: 800,
                color: '#f1f5f9',
                letterSpacing: '-0.02em',
                margin: '0 0 10px',
              }}
            >
              AI Anomaly Detection Engine
            </h3>
            <p
              style={{
                fontSize: 13,
                color: '#475569',
                maxWidth: 560,
                margin: '0 auto',
                lineHeight: 1.65,
              }}
            >
              CyberShield AI uses unsupervised machine learning — no labeled attack data required.
              Categories are assigned through contextual rule-based logic after anomaly scoring.
            </p>
          </div>

          {/* ── Desktop Pipeline: horizontal ── */}
          <div
            className="hidden sm:block"
            style={{ maxWidth: 860, margin: '0 auto', position: 'relative', zIndex: 1 }}
          >
            {/* Flow row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 0,
              }}
            >
              {/* Security Logs */}
              <MLNode
                icon={<Database style={{ width: 16, height: 16, color: '#64748b' }} />}
                label="Security Logs"
                sub="Raw event data"
                color="#64748b"
                visible={mlArch.visible}
                delay={0}
              />

              <MLArrow color={CYAN} visible={mlArch.visible} delay={100} />

              {/* Feature Extraction */}
              <MLNode
                icon={<Layers style={{ width: 16, height: 16, color: '#818cf8' }} />}
                label="Feature Extraction"
                sub="Structured vectors"
                color="#818cf8"
                visible={mlArch.visible}
                delay={150}
              />

              <MLArrow color={CYAN} visible={mlArch.visible} delay={250} />

              {/* AI Engine — centerpiece */}
              <div
                style={{
                  flex: '0 0 auto',
                  padding: '20px 24px',
                  borderRadius: 14,
                  background: 'linear-gradient(160deg, rgba(6,182,212,0.1), rgba(129,140,248,0.08))',
                  border: `1px solid rgba(6,182,212,0.35)`,
                  boxShadow: `0 0 32px rgba(6,182,212,0.1), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  minWidth: 180,
                  opacity: mlArch.visible ? 1 : 0,
                  transform: mlArch.visible ? 'scale(1)' : 'scale(0.95)',
                  transition: `opacity 0.5s ease 300ms, transform 0.5s ease 300ms`,
                  textAlign: 'center',
                }}
              >
                {/* Top accent */}
                <div
                  aria-hidden
                  style={{
                    position: 'absolute' as const,
                    top: 0,
                    left: '15%',
                    right: '15%',
                    height: 1,
                    background: `linear-gradient(to right, transparent, ${CYAN}70, transparent)`,
                    borderRadius: 1,
                  }}
                />
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(6,182,212,0.12)',
                    border: `1px solid rgba(6,182,212,0.3)`,
                    marginBottom: 10,
                  }}
                >
                  <Cpu style={{ width: 18, height: 18, color: CYAN }} />
                </div>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                  AI Anomaly Engine
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ML_MODELS.map(m => (
                    <div
                      key={m.name}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 7,
                        background: m.accentBg,
                        border: `1px solid ${m.accentBorder}`,
                        textAlign: 'left',
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 700, color: m.color, marginBottom: 2 }}>{m.name}</p>
                      <p style={{ fontSize: 10, color: '#475569', lineHeight: 1.4 }}>{m.description.slice(0, 60)}…</p>
                    </div>
                  ))}
                </div>
              </div>

              <MLArrow color="#f59e0b" visible={mlArch.visible} delay={400} />

              {/* Threat Score */}
              <MLNode
                icon={<BarChart2 style={{ width: 16, height: 16, color: '#f59e0b' }} />}
                label="Threat Score"
                sub="0–100 risk scale"
                color="#f59e0b"
                visible={mlArch.visible}
                delay={450}
                highlight
              />

              <MLArrow color="#f87171" visible={mlArch.visible} delay={550} />

              {/* Security Alert */}
              <MLNode
                icon={<Bell style={{ width: 16, height: 16, color: '#f87171' }} />}
                label="Security Alert"
                sub="SOC notification"
                color="#f87171"
                visible={mlArch.visible}
                delay={600}
              />
            </div>

            {/* Flow label */}
            <div
              style={{
                textAlign: 'center',
                marginTop: 20,
                fontSize: 11,
                fontFamily: 'monospace',
                color: '#334155',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                opacity: mlArch.visible ? 1 : 0,
                transition: 'opacity 0.6s ease 700ms',
              }}
            >
              INPUT → PROCESSING → AI DETECTION → SCORE → ALERT
            </div>
          </div>

          {/* ── Mobile Pipeline: vertical ── */}
          <div
            className="sm:hidden"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative', zIndex: 1 }}
          >
            {[
              { icon: <Database style={{ width: 15, height: 15, color: '#64748b' }} />, label: 'Security Logs', sub: 'Raw event data', color: '#64748b' },
              { icon: <Layers style={{ width: 15, height: 15, color: '#818cf8' }} />, label: 'Feature Extraction', sub: 'Structured vectors', color: '#818cf8' },
            ].map((node, i) => (
              <div key={node.label} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MobileMLNode {...node} visible={mlArch.visible} delay={i * 100} />
                <div style={{ width: 1, height: 20, background: `linear-gradient(to bottom, ${node.color}50, ${CYAN}50)` }} />
                <ArrowDown style={{ width: 12, height: 12, color: CYAN, opacity: 0.5, marginBottom: 0 }} />
              </div>
            ))}

            {/* AI Engine mobile */}
            <div
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: 14,
                background: 'linear-gradient(160deg, rgba(6,182,212,0.1), rgba(129,140,248,0.08))',
                border: `1px solid rgba(6,182,212,0.35)`,
                boxShadow: `0 0 24px rgba(6,182,212,0.1)`,
                opacity: mlArch.visible ? 1 : 0,
                transform: mlArch.visible ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.5s ease 200ms, transform 0.5s ease 200ms',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu style={{ width: 14, height: 14, color: CYAN }} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  AI Anomaly Engine
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ML_MODELS.map(m => (
                  <div key={m.name} style={{ padding: '8px 10px', borderRadius: 8, background: m.accentBg, border: `1px solid ${m.accentBorder}` }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: m.color, marginBottom: 2 }}>{m.name}</p>
                    <p style={{ fontSize: 10, color: '#475569', lineHeight: 1.4 }}>{m.description.slice(0, 70)}…</p>
                  </div>
                ))}
              </div>
            </div>

            {[
              { icon: <BarChart2 style={{ width: 15, height: 15, color: '#f59e0b' }} />, label: 'Threat Score', sub: '0–100 risk scale', color: '#f59e0b' },
              { icon: <Bell style={{ width: 15, height: 15, color: '#f87171' }} />, label: 'Security Alert', sub: 'SOC notification', color: '#f87171' },
            ].map((node, i) => (
              <div key={node.label} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 1, height: 20, background: `linear-gradient(to bottom, ${CYAN}50, ${node.color}50)` }} />
                <ArrowDown style={{ width: 12, height: 12, color: node.color, opacity: 0.5 }} />
                <MobileMLNode {...node} visible={mlArch.visible} delay={(i + 3) * 100} />
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${BORDER}`,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <CheckCircle2 style={{ width: 13, height: 13, color: '#334155', flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.65 }}>
              <strong style={{ color: '#475569' }}>About the ML models: </strong>
              CyberShield AI uses{' '}
              <em style={{ color: '#64748b' }}>unsupervised anomaly detection</em> (Isolation Forest + One-Class SVM) — not a
              multi-class attack classifier. Attack categories are assigned using contextual and rule-based logic after the
              anomaly scoring step. This means the system can detect previously unseen anomalies rather than being limited to
              known attack signatures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper: desktop ML node ── */
function MLNode({
  icon,
  label,
  sub,
  color,
  visible,
  delay,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  visible: boolean;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        flex: '0 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '14px 12px',
        borderRadius: 12,
        background: highlight ? `${color}0e` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${highlight ? color + '35' : BORDER}`,
        minWidth: 100,
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: `${color}12`,
          border: `1px solid ${color}28`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', lineHeight: 1.2 }}>{label}</p>
      <p style={{ fontSize: 10, fontFamily: 'monospace', color: highlight ? color : '#334155' }}>{sub}</p>
    </div>
  );
}

/* ── Helper: desktop ML arrow ── */
function MLArrow({ color, visible, delay }: { color: string; visible: boolean; delay: number }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 36,
        flexShrink: 0,
        opacity: visible ? 1 : 0,
        transition: `opacity 0.4s ease ${delay}ms`,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: `linear-gradient(to right, rgba(255,255,255,0.07), ${color}55)`,
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `5px solid ${color}55`,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
        }}
      />
    </div>
  );
}

/* ── Helper: mobile ML node ── */
function MobileMLNode({
  icon,
  label,
  sub,
  color,
  visible,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  color: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${BORDER}`,
        width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          background: `${color}12`,
          border: `1px solid ${color}28`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>{label}</p>
        <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#334155' }}>{sub}</p>
      </div>
    </div>
  );
}
