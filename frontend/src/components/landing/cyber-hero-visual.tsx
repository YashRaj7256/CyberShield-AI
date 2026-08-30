'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  BrainCircuit,
  Cpu,
  Database,
  Fingerprint,
  Network,
  ShieldAlert,
  Wifi,
} from 'lucide-react';

/* ─── Node & connection layout for 900×300 panoramic viewBox ─ */
const AI_X = 450;
const AI_Y = 150;
const IN_X  = 95;
const OUT_X = 805;

interface INode { id: string; cy: number; label: string; sub: string; icon: React.ElementType; color: string; iconColor: string; delay: number; }
interface ONode { id: string; cy: number; label: string; value: string; sub: string; color: string; borderColor: string; valueColor: string; flash?: boolean; }

const INPUT_NODES: INode[] = [
  { id: 'auth',     cy: 48,  label: 'AUTHENTICATION', sub: 'Event stream',   icon: Fingerprint, color: 'rgba(6,182,212,0.1)',    iconColor: '#22d3ee', delay: 0   },
  { id: 'network',  cy: 118, label: 'NETWORK',        sub: 'Telemetry',      icon: Network,     color: 'rgba(99,102,241,0.1)',   iconColor: '#818cf8', delay: 0.2 },
  { id: 'firewall', cy: 188, label: 'FIREWALL',       sub: 'Packet inspect', icon: ShieldAlert, color: 'rgba(6,182,212,0.09)',   iconColor: '#22d3ee', delay: 0.4 },
  { id: 'endpoint', cy: 258, label: 'ENDPOINT',       sub: 'Process logs',   icon: Wifi,        color: 'rgba(139,92,246,0.09)',  iconColor: '#a78bfa', delay: 0.6 },
];

const OUTPUT_NODES: ONode[] = [
  { id: 'anomaly', cy: 75,  label: 'ANOMALY SCORE', value: '0.82', sub: 'ELEVATED',  color: 'rgba(245,158,11,0.09)', borderColor: 'rgba(245,158,11,0.3)', valueColor: '#fbbf24' },
  { id: 'threat',  cy: 155, label: 'THREAT SCORE',  value: '76',   sub: 'HIGH RISK', color: 'rgba(239,68,68,0.09)',  borderColor: 'rgba(239,68,68,0.35)', valueColor: '#f87171', flash: true },
  { id: 'alert',   cy: 230, label: 'SECURITY ALERT', value: 'ACTIVE', sub: 'TRIGGERED', color: 'rgba(239,68,68,0.07)', borderColor: 'rgba(239,68,68,0.3)', valueColor: '#fca5a5', flash: true },
];

function inPath(n: INode)  { return `M ${IN_X} ${n.cy} C ${IN_X + 170} ${n.cy}, ${AI_X - 170} ${AI_Y}, ${AI_X} ${AI_Y}`; }
function outPath(n: ONode) { return `M ${AI_X} ${AI_Y} C ${AI_X + 170} ${AI_Y}, ${OUT_X - 170} ${n.cy}, ${OUT_X} ${n.cy}`; }

function Packet({ pathId, dur, delay, color, size = 4 }: { pathId: string; dur: number; delay: number; color: string; size?: number }) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), delay * 1000 + 500); return () => clearTimeout(t); }, [delay]);
  if (!on) return null;
  return (
    <circle r={size} fill={color} opacity={0.9}>
      <animateMotion dur={`${dur}s`} repeatCount="indefinite" rotate="auto"><mpath href={`#${pathId}`} /></animateMotion>
      <animate attributeName="opacity" values="0;1;1;0" dur={`${dur}s`} repeatCount="indefinite" />
    </circle>
  );
}

export default function CyberHeroVisual() {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(id);
  }, []);

  const anomalyVals = ['0.82', '0.71', '0.94', '0.68', '0.77'];
  const curAnomaly  = anomalyVals[tick % anomalyVals.length];

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-white/[0.06] bg-[#060c18]" style={{ aspectRatio: '900 / 310' }}>
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{ backgroundImage: 'linear-gradient(rgba(34,211,238,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,0.04) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
      {/* Core ambient glow */}
      <div className="absolute pointer-events-none animate-glow-breathe"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.12), transparent 70%)' }} />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-2 border-b border-white/[0.05] bg-black/20 z-20">
        <span className="flex items-center gap-2 text-[10px] font-mono font-semibold tracking-widest text-slate-500 uppercase">
          <Activity className="w-3 h-3 text-cyan-500 animate-pulse" /> Live Threat Analysis
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> PROCESSING
        </span>
      </div>

      {/* SVG */}
      <svg viewBox="0 0 900 300" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          {INPUT_NODES.map(n  => <path key={`di-${n.id}`}  id={`pi-${n.id}`}  d={inPath(n)}  />)}
          {OUTPUT_NODES.map(n => <path key={`do-${n.id}`}  id={`po-${n.id}`}  d={outPath(n)} />)}
          <path id="orbit-p" d={`M ${AI_X+52} ${AI_Y} A 52 52 0 1 1 ${AI_X+51.9} ${AI_Y-0.1}`} fill="none" />
          <linearGradient id="gin" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#22d3ee" stopOpacity=".12"/><stop offset="100%" stopColor="#22d3ee" stopOpacity=".55"/></linearGradient>
          <linearGradient id="gin2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#818cf8" stopOpacity=".12"/><stop offset="100%" stopColor="#818cf8" stopOpacity=".5"/></linearGradient>
          <linearGradient id="gout1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#22d3ee" stopOpacity=".45"/><stop offset="100%" stopColor="#fbbf24" stopOpacity=".6"/></linearGradient>
          <linearGradient id="gout2" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#22d3ee" stopOpacity=".45"/><stop offset="100%" stopColor="#f87171" stopOpacity=".65"/></linearGradient>
          <filter id="glow"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="gsm"><feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* Input paths */}
        <path d={inPath(INPUT_NODES[0])} fill="none" stroke="url(#gin)"  strokeWidth="1" opacity=".8"/>
        <path d={inPath(INPUT_NODES[1])} fill="none" stroke="url(#gin2)" strokeWidth="1" opacity=".7"/>
        <path d={inPath(INPUT_NODES[2])} fill="none" stroke="url(#gin)"  strokeWidth="1" opacity=".65"/>
        <path d={inPath(INPUT_NODES[3])} fill="none" stroke="url(#gin2)" strokeWidth="1" opacity=".6"/>
        {/* Output paths */}
        <path d={outPath(OUTPUT_NODES[0])} fill="none" stroke="url(#gout1)" strokeWidth="1"   opacity=".7"/>
        <path d={outPath(OUTPUT_NODES[1])} fill="none" stroke="url(#gout2)" strokeWidth="1.2" opacity=".85"/>
        <path d={outPath(OUTPUT_NODES[2])} fill="none" stroke="url(#gout2)" strokeWidth="1"   opacity=".6"/>

        {/* Animated packets */}
        {mounted && <>
          <Packet pathId="pi-auth"     dur={2.4} delay={0}   color="#22d3ee"/>
          <Packet pathId="pi-auth"     dur={2.4} delay={1.2} color="#22d3ee" size={3}/>
          <Packet pathId="pi-network"  dur={2.8} delay={0.5} color="#818cf8"/>
          <Packet pathId="pi-network"  dur={2.8} delay={1.9} color="#818cf8" size={3}/>
          <Packet pathId="pi-firewall" dur={2.2} delay={0.3} color="#22d3ee"/>
          <Packet pathId="pi-endpoint" dur={3.0} delay={0.9} color="#a78bfa"/>
          <Packet pathId="pi-endpoint" dur={3.0} delay={2.1} color="#a78bfa" size={3}/>
          <Packet pathId="po-anomaly"  dur={1.9} delay={0.7} color="#fbbf24" size={3}/>
          <Packet pathId="po-threat"   dur={1.7} delay={0.4} color="#f87171"/>
          <Packet pathId="po-threat"   dur={1.7} delay={1.3} color="#f87171" size={3}/>
          <Packet pathId="po-alert"    dur={2.1} delay={1.0} color="#fca5a5" size={3}/>
          <circle r="3" fill="#22d3ee" opacity=".8" filter="url(#gsm)">
            <animateMotion dur="5s" repeatCount="indefinite"><mpath href="#orbit-p"/></animateMotion>
          </circle>
        </>}

        {/* Orbit rings */}
        <ellipse cx={AI_X} cy={AI_Y} rx="62" ry="62" fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="1" strokeDasharray="8 6"
          style={{ transformOrigin: `${AI_X}px ${AI_Y}px`, animation: 'orbit-ring 14s linear infinite' }}/>
        <ellipse cx={AI_X} cy={AI_Y} rx="50" ry="50" fill="none" stroke="rgba(34,211,238,0.08)" strokeWidth="1" strokeDasharray="4 10"
          style={{ transformOrigin: `${AI_X}px ${AI_Y}px`, animation: 'orbit-ring-reverse 9s linear infinite' }}/>
        {/* Core */}
        <circle cx={AI_X} cy={AI_Y} r="40" fill="rgba(5,12,24,0.98)" stroke="rgba(34,211,238,0.5)" strokeWidth="1.5" filter="url(#glow)"/>
        <circle cx={AI_X} cy={AI_Y} r="40" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="7"/>

        {/* Input node dots */}
        {INPUT_NODES.map(n => (
          <g key={`nd-${n.id}`} filter="url(#gsm)">
            <circle cx={IN_X} cy={n.cy} r="7" fill={n.iconColor} opacity=".12">
              {mounted && <animate attributeName="r" values="6;11;6" dur={`${2.5+n.delay}s`} repeatCount="indefinite"/>}
            </circle>
            <circle cx={IN_X} cy={n.cy} r="4.5" fill={n.iconColor} opacity=".85"/>
          </g>
        ))}
        {/* Output node dots */}
        {OUTPUT_NODES.map(n => (
          <g key={`od-${n.id}`} filter="url(#gsm)">
            <circle cx={OUT_X} cy={n.cy} r="6" fill={n.valueColor} opacity=".15">
              {mounted && n.flash && <animate attributeName="r" values="5;10;5" dur="1.6s" repeatCount="indefinite"/>}
            </circle>
            <circle cx={OUT_X} cy={n.cy} r="4" fill={n.valueColor} opacity=".8"/>
          </g>
        ))}
      </svg>

      {/* Input node HTML cards */}
      {INPUT_NODES.map(n => {
        const Icon = n.icon;
        const topPct = (n.cy / 300) * 100;
        return (
          <div key={n.id} className="absolute flex items-center gap-2 px-2 py-1.5 rounded-lg backdrop-blur-sm border shadow"
            style={{ left: 4, top: `calc(${topPct}% - 18px)`, background: n.color, borderColor: n.iconColor + '30',
              opacity: mounted ? 1 : 0, transition: `opacity .5s ease ${n.delay + .4}s, transform .5s ease ${n.delay + .4}s`,
              transform: mounted ? 'translateX(0)' : 'translateX(-12px)' }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: n.iconColor + '20' }}>
              <Icon className="w-3 h-3" style={{ color: n.iconColor }}/>
            </div>
            <div>
              <p className="text-[8px] font-bold tracking-widest" style={{ color: n.iconColor }}>{n.label}</p>
              <p className="text-[7px] text-slate-600">{n.sub}</p>
            </div>
          </div>
        );
      })}

      {/* Core label */}
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none"
        style={{ left: 'calc(50% - 36px)', top: 'calc(50% - 36px)', width: 72, height: 72 }}>
        <BrainCircuit className="w-5 h-5 text-cyan-300 mx-auto"/>
        <p className="text-[7px] font-bold tracking-widest text-white mt-1">AI ENGINE</p>
        <p className="text-[6px] text-cyan-400">ANOMALY</p>
      </div>

      {/* Output node HTML cards */}
      {OUTPUT_NODES.map((n, i) => {
        const topPct = (n.cy / 300) * 100;
        return (
          <div key={n.id} className="absolute px-2.5 py-1.5 rounded-lg backdrop-blur-sm border shadow min-w-[100px]"
            style={{ right: 4, top: `calc(${topPct}% - 20px)`, background: n.color, borderColor: n.borderColor,
              animation: mounted ? (n.flash ? 'threat-flash 2s ease-in-out infinite' : undefined) : undefined,
              opacity: mounted ? 1 : 0, transition: `opacity .5s ease ${.5 + i * .15}s, transform .5s ease ${.5 + i * .15}s`,
              transform: mounted ? 'translateX(0)' : 'translateX(12px)' }}>
            <p className="text-[8px] font-semibold tracking-widest text-slate-500 uppercase">{n.label}</p>
            <p className="font-mono text-sm font-bold leading-none mt-0.5" style={{ color: n.valueColor }}>
              {n.id === 'anomaly' ? curAnomaly : n.value}
            </p>
            <p className="text-[7px] mt-0.5" style={{ color: n.valueColor, opacity: .65 }}>{n.sub}</p>
          </div>
        );
      })}

      {/* Bottom bar */}
      <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2 border-t border-white/[0.05] bg-black/20 z-20">
        <div className="flex items-center gap-4 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-cyan-500/70"><Cpu className="w-3 h-3"/> Isolation Forest</span>
          <span className="flex items-center gap-1.5 text-indigo-400/70"><Activity className="w-3 h-3"/> One-Class SVM</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-mono">
          <Bell className="w-3 h-3 text-red-400 animate-pulse"/>
          <span className="text-red-400">ALERT READY</span>
        </div>
      </div>
    </div>
  );
}
