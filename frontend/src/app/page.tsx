'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield, ShieldCheck, ArrowRight, Menu, X,
  Activity, Database, Cpu, Bell, CheckCircle2,
  BarChart3, Clock, Lock, AlertTriangle, Layers, Zap,
} from 'lucide-react';
import CyberHeroVisual from '@/components/landing/cyber-hero-visual';
import CyberArchitectureVisual from '@/components/landing/cyber-architecture-visual';

/* ─── Types ────────────────────────────────────────────────── */
interface Alert { id: string; time: string; src: string; cat: string; sev: string; score: number; }

/* ─── Data ─────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Platform',         href: '#platform'  },
  { label: 'How It Works',     href: '#pipeline'  },
  { label: 'Threat Detection', href: '#threats'   },
  { label: 'Architecture',     href: '#ml-arch'   },
];

const ALERTS: Alert[] = [
  { id: 'ALT-2841', time: '19:22:01', src: '192.168.1.204', cat: 'Brute Force',        sev: 'HIGH',     score: 76 },
  { id: 'ALT-2840', time: '19:21:47', src: '10.0.4.88',    cat: 'Port Scan',           sev: 'MEDIUM',   score: 44 },
  { id: 'ALT-2839', time: '19:21:31', src: '203.0.113.45', cat: 'DDoS Flood',          sev: 'CRITICAL', score: 91 },
  { id: 'ALT-2838', time: '19:20:59', src: '10.0.2.15',    cat: 'Suspicious Login',    sev: 'MEDIUM',   score: 52 },
  { id: 'ALT-2837', time: '19:20:22', src: '198.51.100.8', cat: 'Unauthorized Access', sev: 'HIGH',     score: 68 },
];

const SEV_STYLES: Record<string, { badge: string; bar: string; dot: string }> = {
  CRITICAL: { badge: 'text-red-400',    bar: '#ef4444', dot: '#ef4444' },
  HIGH:     { badge: 'text-orange-400', bar: '#f97316', dot: '#f97316' },
  MEDIUM:   { badge: 'text-yellow-400', bar: '#eab308', dot: '#eab308' },
};

const FEATURES = [
  { icon: Database,  color: '#22d3ee', title: 'Real-Time Log Ingestion',  body: 'Security events from auth systems, network devices, firewalls, and endpoints stream into the analysis engine without delay.' },
  { icon: Cpu,       color: '#818cf8', title: 'AI Anomaly Detection',     body: 'Isolation Forest and One-Class SVM score every event against a learned baseline — no signature library required.' },
  { icon: BarChart3, color: '#f59e0b', title: 'Threat Scoring 0–100',     body: 'Composite risk score weighted by anomaly signal strength, event velocity, and contextual severity classification.' },
  { icon: Bell,      color: '#f87171', title: 'Security Alerting',        body: 'High-scoring events surface to your SOC team as structured alerts with IP, timestamp, category, and score — triage-ready.' },
];

/* ─── Scroll-reveal hook ──────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, v };
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function LandingPage() {
  const [mobile, setMobile]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const features = useReveal();
  const console_ = useReveal();
  const cta      = useReveal();

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  /* ── Inline style tokens ── */
  const BG     = '#030509';
  const SURF   = 'rgba(255,255,255,0.025)';
  const BORDER = 'rgba(255,255,255,0.07)';
  const CYAN   = '#22d3ee';
  const CYANDIM = 'rgba(6,182,212,0.15)';

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#e2e8f0', overflowX: 'hidden', fontFamily: 'inherit' }}>

      {/* ── Grid background ──────────────────────────────────── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(6,182,212,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.018) 1px,transparent 1px)',
        backgroundSize: '48px 48px' }} />

      {/* ── Ambient orbs ─────────────────────────────────────── */}
      {mounted && <>
        <div aria-hidden style={{ position: 'fixed', top: '-15%', left: '20%', width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(6,182,212,0.045), transparent 65%)', animation: 'wander 22s ease-in-out infinite' }} />
        <div aria-hidden style={{ position: 'fixed', bottom: '-15%', right: '15%', width: 450, height: 450, borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle, rgba(37,99,235,0.035), transparent 65%)', animation: 'wander 28s ease-in-out infinite reverse' }} />
      </>}

      {/* ═══════════════════════════════════════════════════════
          NAV
      ═══════════════════════════════════════════════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(3,5,9,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px)' : 'none',
        borderBottom: scrolled ? `1px solid ${BORDER}` : 'none',
        transition: 'all .3s ease',
        padding: scrolled ? '12px 0' : '16px 0',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>

          {/* Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${CYANDIM}`, background: 'rgba(6,182,212,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Shield style={{ width: 16, height: 16, color: CYAN }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: '#fff' }}>
              CyberShield <span style={{ color: CYAN }}>AI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hidden lg:flex">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: 14, color: '#64748b', textDecoration: 'none', transition: 'color .15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
                {l.label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none', padding: '8px 12px', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
              Sign In
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#06b6d4,#2563eb)', boxShadow: '0 0 16px rgba(6,182,212,0.28)',
              transition: 'box-shadow .2s' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 28px rgba(6,182,212,0.45)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 16px rgba(6,182,212,0.28)')}>
              Launch Console <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobile(!mobile)} aria-label="Toggle navigation menu"
            style={{ display: 'none', padding: 8, borderRadius: 8, border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.04)',
              color: '#94a3b8', cursor: 'pointer' }}
            className="lg:!hidden !flex">
            {mobile ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobile && (
          <div style={{ background: 'rgba(4,6,12,0.98)', borderBottom: `1px solid ${BORDER}`, padding: '8px 24px 16px', backdropFilter: 'blur(24px)' }}
            className="lg:hidden animate-fade-in">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobile(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: 8, fontSize: 14, color: '#64748b', textDecoration: 'none', marginBottom: 2 }}>
                {l.label}
              </a>
            ))}
            <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/login" style={{ textAlign: 'center', padding: '10px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 14, fontWeight: 600, color: '#94a3b8', textDecoration: 'none' }}>Sign In</Link>
              <Link href="/login" style={{ textAlign: 'center', padding: '10px', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none', background: 'linear-gradient(135deg,#06b6d4,#2563eb)' }}>Launch Security Console →</Link>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO — GUARANTEED CENTERED LAYOUT
      ═══════════════════════════════════════════════════════ */}
      <section style={{ paddingTop: '6.5rem', paddingBottom: '1rem', width: '100%' }}>
        {/* Center column — all hero text */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', padding: '2rem 24px 0' }}>

          {/* Eyebrow badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
            border: `1px solid rgba(6,182,212,0.28)`, background: 'rgba(6,182,212,0.07)', marginBottom: 28 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: CYAN, display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: CYAN, textTransform: 'uppercase' }}>
              AI-Powered Cyber Threat Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.06,
            color: '#f8fafc', textAlign: 'center', margin: '0 0 8px 0', maxWidth: 720 }}>
            Detect Threats Before
          </h1>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.06,
            textAlign: 'center', margin: '0 0 28px 0', maxWidth: 720,
            background: 'linear-gradient(135deg,#22d3ee 0%,#60a5fa 55%,#818cf8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            They Escalate.
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', color: '#64748b', maxWidth: 520, lineHeight: 1.7,
            textAlign: 'center', margin: '0 0 32px 0' }}>
            CyberShield AI continuously analyzes security activity, detects abnormal behavior, calculates threat risk, and surfaces actionable intelligence for your security team.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 28 }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px', borderRadius: 12,
              fontSize: 14, fontWeight: 700, color: '#fff', textDecoration: 'none',
              background: 'linear-gradient(135deg,#06b6d4,#2563eb)', boxShadow: '0 0 24px rgba(6,182,212,0.35)',
              transition: 'box-shadow .2s, transform .15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 36px rgba(6,182,212,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(6,182,212,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <ShieldCheck style={{ width: 16, height: 16 }} />
              Launch Security Console
              <ArrowRight style={{ width: 15, height: 15 }} />
            </Link>
            <a href="#pipeline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 12,
              fontSize: 14, fontWeight: 600, color: '#94a3b8', textDecoration: 'none',
              border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)',
              transition: 'color .15s, background .15s, border-color .15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
              Explore Platform
            </a>
          </div>

          {/* Capability pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
            {[
              { Icon: Activity,  label: 'Real-Time Log Analysis' },
              { Icon: Cpu,       label: 'AI Anomaly Detection'   },
              { Icon: BarChart3, label: 'Threat Scoring'         },
              { Icon: Bell,      label: 'Security Alerting'      },
            ].map(({ Icon, label }) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500,
                color: '#475569', border: `1px solid ${BORDER}`, padding: '5px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                <Icon style={{ width: 12, height: 12, color: CYAN }} />
                {label}
              </span>
            ))}
          </div>

          {/* VISUALIZATION — full width below headline */}
          <div style={{ width: '100%', maxWidth: 980, position: 'relative' }}>
            {/* Glow frame */}
            <div aria-hidden style={{ position: 'absolute', inset: -1, borderRadius: 14, pointerEvents: 'none', zIndex: 0,
              background: 'linear-gradient(135deg, rgba(6,182,212,0.18) 0%, transparent 35%, transparent 65%, rgba(37,99,235,0.14) 100%)' }} />
            <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.07)`, boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
              <CyberHeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          METRICS STRIP
      ═══════════════════════════════════════════════════════ */}
      <section id="platform" style={{ padding: '4rem 24px', width: '100%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { label: 'Log Sources',      value: 'Multi-vector',    sub: 'Auth · Network · Firewall · Endpoint', Icon: Database,  c: CYAN    },
              { label: 'Detection Engine', value: 'Unsupervised ML', sub: 'Isolation Forest + One-Class SVM',      Icon: Cpu,       c: '#818cf8' },
              { label: 'Risk Scoring',     value: '0 – 100',         sub: 'Composite threat risk per event',        Icon: BarChart3, c: '#f59e0b' },
              { label: 'Alert Output',     value: 'Real-Time',       sub: 'SOC-ready threat notifications',         Icon: Bell,      c: '#f87171' },
            ].map(m => (
              <div key={m.label} style={{ padding: '20px', borderRadius: 12, border: `1px solid ${BORDER}`, background: SURF,
                transition: 'border-color .2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = BORDER)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#475569' }}>{m.label}</span>
                  <m.Icon style={{ width: 15, height: 15, color: m.c, flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 20, fontWeight: 800, fontFamily: 'monospace', color: m.c, lineHeight: 1, marginBottom: 6 }}>{m.value}</p>
                <p style={{ fontSize: 11, color: '#334155', lineHeight: 1.4 }}>{m.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PIPELINE / THREATS / ML ARCHITECTURE
      ═══════════════════════════════════════════════════════ */}
      <section id="pipeline" style={{ padding: '2rem 24px 5rem', width: '100%', scrollMarginTop: '6rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <CyberArchitectureVisual />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '2rem 24px 5rem', width: '100%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: CYAN, marginBottom: 10 }}>Platform Capabilities</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: '0 0 10px' }}>Built for Security Operations</h2>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>The core analysis pipeline that powers every detection, score, and alert.</p>
          </div>

          {/* Cards */}
          <div ref={features.ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{ padding: '24px', borderRadius: 14, border: `1px solid rgba(255,255,255,0.06)`,
                background: `${f.color}06`, transition: 'border-color .25s, box-shadow .25s, transform .25s',
                opacity: features.v ? 1 : 0, transform: features.v ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 70}ms`, transitionProperty: 'opacity,transform,border-color,box-shadow', transitionDuration: '.5s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}30`; e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.3)`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = features.v ? 'translateY(0)' : 'translateY(24px)'; }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${f.color}25`, background: `${f.color}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <f.icon style={{ width: 18, height: 18, color: f.color }} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECURITY CONSOLE PREVIEW
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '2rem 24px 5rem', width: '100%' }}>
        <div ref={console_.ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: CYAN, marginBottom: 10 }}>Security Console</p>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', margin: '0 0 10px' }}>Your SOC Command Center</h2>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 480, margin: '0 auto', lineHeight: 1.6 }}>Active alerts, scored threats, and event timelines — all in one unified view.</p>
          </div>

          {/* Mock console */}
          <div style={{ borderRadius: 14, border: `1px solid ${BORDER}`, background: '#060b14', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            opacity: console_.v ? 1 : 0, transform: console_.v ? 'translateY(0)' : 'translateY(28px)', transition: 'opacity .6s ease, transform .6s ease' }}>

            {/* Title bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${BORDER}`, background: 'rgba(0,0,0,0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(239,68,68,0.5)', display: 'block' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(234,179,8,0.5)', display: 'block' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(34,197,94,0.5)', display: 'block' }} />
                </div>
                <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#334155', marginLeft: 8 }}>CyberShield AI — Security Console</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'monospace', color: '#4ade80' }}>
                <Activity style={{ width: 10, height: 10, animation: 'pulse 1s ease-in-out infinite' }} /> LIVE
              </div>
            </div>

            {/* Body: stat sidebar + alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', borderTop: `1px solid ${BORDER}` }} className="max-sm:grid-cols-1">

              {/* Stats */}
              <div style={{ padding: '16px', borderRight: `1px solid ${BORDER}` }} className="max-sm:border-r-0 max-sm:border-b">
                <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#334155', marginBottom: 12 }}>Overview</p>
                {[
                  { label: 'Active Alerts', value: '12',  c: '#f87171' },
                  { label: 'High Severity', value: '4',   c: '#fb923c' },
                  { label: 'Logs Today',    value: '18k', c: CYAN      },
                  { label: 'Avg Score',     value: '67',  c: '#fbbf24' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                    <span style={{ fontSize: 12, color: '#334155' }}>{s.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: s.c }}>{s.value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Threat Score</span>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#fb923c' }}>76/100</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: '76%', background: 'linear-gradient(to right,#f59e0b,#ef4444)' }} />
                  </div>
                </div>
              </div>

              {/* Alert feed */}
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#334155' }}>Recent Security Alerts</p>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontFamily: 'monospace', color: '#4ade80' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'ping 1s cubic-bezier(0,0,.2,1) infinite' }} />
                    Auto-refreshing
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {ALERTS.map((a, i) => {
                    const s = SEV_STYLES[a.sev];
                    return (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                        border: `1px solid rgba(255,255,255,0.05)`, background: 'rgba(255,255,255,0.02)', transition: 'background .15s',
                        opacity: console_.v ? 1 : 0, transform: console_.v ? 'none' : 'translateX(12px)',
                        transitionDelay: `${i * 70}ms`, transitionDuration: '.45s', transitionProperty: 'opacity,transform,background' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}>
                        <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: s.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px', minWidth: 0 }} className="sm:grid-cols-4">
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#334155' }}>{a.id}</p>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.cat}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, color: '#334155' }}>Source</p>
                            <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b' }}>{a.src}</p>
                          </div>
                          <div className="hidden sm:block">
                            <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
                              background: `${s.bar}18`, border: `1px solid ${s.bar}30`, color: s.badge.includes('red') ? '#f87171' : s.badge.includes('orange') ? '#fb923c' : '#facc15' }}
                              className={s.badge}>
                              {a.sev}
                            </span>
                          </div>
                          <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 2, background: s.bar, width: `${a.score}%` }} />
                            </div>
                            <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#475569', flexShrink: 0 }}>{a.score}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontFamily: 'monospace', color: '#334155', flexShrink: 0 }}>
                          <Clock style={{ width: 10, height: 10 }} /> {a.time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 16px', borderTop: `1px solid ${BORDER}`, background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#1e293b' }}>Showing 5 of 12 active alerts</span>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: CYAN, textDecoration: 'none' }}>
                Open full console <ArrowRight style={{ width: 11, height: 11 }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════════ */}
      <section style={{ padding: '2rem 24px 5rem', width: '100%' }}>
        <div ref={cta.ref} style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ position: 'relative', borderRadius: 18, border: `1px solid rgba(255,255,255,0.06)`, overflow: 'hidden',
            background: 'linear-gradient(160deg,#080d1a 0%,#060912 50%,#080d1a 100%)',
            textAlign: 'center', padding: 'clamp(2.5rem, 6vw, 4.5rem) 2rem',
            opacity: cta.v ? 1 : 0, transform: cta.v ? 'none' : 'translateY(20px)', transition: 'opacity .6s ease, transform .6s ease' }}>
            <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.1) 0%, transparent 65%)' }} />
            <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999,
                border: '1px solid rgba(6,182,212,0.25)', background: 'rgba(6,182,212,0.07)',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: CYAN }}>
                <Lock style={{ width: 12, height: 12 }} /> Enterprise-Grade Security
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.12, color: '#f8fafc', margin: 0 }}>
                Turn Security Events Into<br/>
                <span style={{ background: 'linear-gradient(135deg,#22d3ee,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Actionable Intelligence.
                </span>
              </h2>
              <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.65, margin: 0 }}>
                Connect your security logs. Let AI anomaly detection surface genuine threats. Get clear, scored, categorized alerts ready for your SOC.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '13px 28px', borderRadius: 12,
                  fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none',
                  background: 'linear-gradient(135deg,#06b6d4,#2563eb)', boxShadow: '0 0 28px rgba(6,182,212,0.38)' }}>
                  Launch Security Console <ArrowRight style={{ width: 17, height: 17 }} />
                </Link>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 12,
                  fontSize: 14, fontWeight: 600, color: '#64748b', textDecoration: 'none',
                  border: `1px solid ${BORDER}`, background: 'rgba(255,255,255,0.03)' }}>
                  Sign In
                </Link>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', paddingTop: 12, borderTop: `1px solid ${BORDER}` }}>
                {['Anomaly Detection', 'Risk Scoring', 'Real-Time Alerts', 'SOC-Ready'].map(s => (
                  <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#334155' }}>
                    <CheckCircle2 style={{ width: 13, height: 13, color: '#164e63' }} />{s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, background: 'rgba(2,3,6,0.85)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid rgba(6,182,212,0.2)`, background: 'rgba(6,182,212,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield style={{ width: 14, height: 14, color: CYAN }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>CyberShield <span style={{ color: CYAN }}>AI</span></span>
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} style={{ fontSize: 13, color: '#334155', textDecoration: 'none' }}>{l.label}</a>
            ))}
            <Link href="/login" style={{ fontSize: 13, color: '#334155', textDecoration: 'none' }}>Sign In</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'monospace', color: '#1e293b' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            All Systems Operational · © 2026 CyberShield AI
          </div>
        </div>
      </footer>
    </div>
  );
}
