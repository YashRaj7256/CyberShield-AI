'use client';

import {
  Shield,
  Database,
  Cpu,
  BarChart2,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';

/* ─── Accurate ML Pipeline ─────────────────────────────────── */
const PIPELINE_STAGES = [
  {
    id: 'ingest',
    step: '01',
    label: 'Log Ingestion',
    description: 'Raw security events from auth systems, network devices, firewalls, and endpoints are ingested in real time.',
    icon: Database,
    color: '#22d3ee',
    bg: 'rgba(6,182,212,0.07)',
    border: 'rgba(6,182,212,0.25)',
  },
  {
    id: 'extract',
    step: '02',
    label: 'Feature Extraction',
    description: 'Structured features are derived — request frequency, protocol, IP reputation, session patterns — ready for ML scoring.',
    icon: Layers,
    color: '#818cf8',
    bg: 'rgba(99,102,241,0.07)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    id: 'model',
    step: '03',
    label: 'Anomaly Detection',
    description: 'Isolation Forest and One-Class SVM independently score each event against a learned baseline of normal behaviour.',
    icon: Cpu,
    color: '#22d3ee',
    bg: 'rgba(6,182,212,0.07)',
    border: 'rgba(6,182,212,0.30)',
    isCore: true,
  },
  {
    id: 'score',
    step: '04',
    label: 'Threat Scoring',
    description: 'A composite risk score (0–100) is calculated from anomaly signals, event velocity, and contextual severity weighting.',
    icon: BarChart2,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    id: 'alert',
    step: '05',
    label: 'Security Alert',
    description: 'High-scoring events are flagged and presented to the SOC team with event context, timeline, and category classification.',
    icon: Bell,
    color: '#f87171',
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.30)',
  },
];

const ML_MODELS = [
  {
    name: 'Isolation Forest',
    description: 'Unsupervised ensemble method that isolates anomalies by randomly partitioning feature space. Effective at detecting outliers in high-dimensional log data.',
    color: '#22d3ee',
    output: 'Anomaly Score',
  },
  {
    name: 'One-Class SVM',
    description: 'Learns a tight decision boundary around normal behaviour. Events falling outside the learned boundary are flagged for further scoring.',
    color: '#818cf8',
    output: 'Anomaly Score',
  },
];

const THREAT_CATEGORIES = [
  { label: 'Authentication Brute Force', sev: 'HIGH',     sevColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { label: 'Suspicious Login',           sev: 'MEDIUM',   sevColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { label: 'Port Scanning',              sev: 'MEDIUM',   sevColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  { label: 'DDoS / Flood',               sev: 'CRITICAL', sevColor: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { label: 'Malware Behaviour',           sev: 'CRITICAL', sevColor: 'text-red-400 bg-red-500/10 border-red-500/20' },
  { label: 'Credential Stuffing',        sev: 'HIGH',     sevColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { label: 'Insider Threat Indicators',  sev: 'HIGH',     sevColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { label: 'Unauthorized Access',        sev: 'HIGH',     sevColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
];

/* ─── Arrow connector ─────────────────────────────────────── */
function PipelineArrow({ color }: { color: string }) {
  return (
    <div className="hidden md:flex flex-col items-center justify-center shrink-0 px-1">
      <div className="w-8 h-px" style={{ background: `linear-gradient(to right, ${color}40, ${color}90)` }} />
      <div className="w-0 h-0 -mr-1 border-l-4 border-y-4 border-y-transparent" style={{ borderLeftColor: `${color}90` }} />
    </div>
  );
}

export default function CyberArchitectureVisual() {
  return (
    <div className="space-y-20">

      {/* ─── Section 1: Platform Pipeline ─────────────────────── */}
      <div className="relative p-6 sm:p-8 lg:p-10 rounded-2xl bg-[#0a0a12]/95 border border-zinc-800/80 shadow-2xl overflow-hidden">
        {/* BG decoration */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)' }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold tracking-wider">
              <Database className="w-3.5 h-3.5" />
              <span>Automated Threat Pipeline</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              How CyberShield AI Works
            </h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Raw security logs enter the pipeline and emerge as classified, scored, actionable threat intelligence.
            </p>
          </div>

          {/* Pipeline stages — horizontal on desktop, vertical on mobile */}
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-0">
            {PIPELINE_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={stage.id} className="flex flex-col md:flex-row items-center md:items-stretch flex-1">
                  {/* Card */}
                  <div
                    className="group flex-1 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg w-full md:w-auto"
                    style={{ background: stage.bg, borderColor: stage.border }}
                  >
                    {/* Step number */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-bold tracking-widest" style={{ color: stage.color, opacity: 0.7 }}>
                        {stage.step}
                      </span>
                      <div className="p-1.5 rounded-lg" style={{ background: `${stage.color}18` }}>
                        <Icon className="w-4 h-4" style={{ color: stage.color }} />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 mb-1.5 leading-tight">{stage.label}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{stage.description}</p>

                    {/* Core badge */}
                    {stage.isCore && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Isolation Forest</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">One-Class SVM</span>
                      </div>
                    )}
                  </div>

                  {/* Connector arrow */}
                  {i < PIPELINE_STAGES.length - 1 && (
                    <PipelineArrow color={PIPELINE_STAGES[i + 1].color} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Section 2: Threat Detection Matrix ─────────────────── */}
      <div id="threat-detection" className="scroll-mt-28">
        {/* Section header */}
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Multi-Vector Detection</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-100 tracking-tight">
            Threats Monitored in Real Time
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Continuous anomaly analysis across these attack categories, with automated severity classification and contextual rule-based categorization.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {THREAT_CATEGORIES.map((t, i) => (
            <div
              key={t.label}
              className="group p-4 rounded-xl bg-[#0e0e18]/90 border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-200 shadow-sm flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${t.sevColor}`}>
                  {t.sev}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                  ACTIVE
                </span>
              </div>
              <p className="text-xs font-semibold text-zinc-200 leading-snug">{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Section 3: AI Analysis Architecture ─────────────────── */}
      <div id="architecture" className="scroll-mt-28 relative p-6 sm:p-8 lg:p-10 rounded-2xl bg-[#0a0a12]/95 border border-zinc-800/80 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(99,102,241,0.06), transparent 70%)' }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold tracking-wider">
              <Cpu className="w-3.5 h-3.5" />
              <span>ML Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">AI Anomaly Detection Engine</h2>
            <p className="text-sm text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              CyberShield AI uses unsupervised machine learning to detect anomalous behaviour — no labeled attack data required.
              Attack categories are determined through contextual rule-based processing after anomaly scoring.
            </p>
          </div>

          {/* ML flow diagram */}
          <div className="max-w-4xl mx-auto">
            {/* Top row: input → feature extraction → two models */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-0 mb-4">
              {/* Security Log */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="px-4 py-3 rounded-xl border border-zinc-700/80 bg-[#111118] text-center w-36">
                  <Database className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-zinc-300">Security Log</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Raw event data</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex sm:flex-col items-center justify-center sm:pt-6 mx-2 sm:mx-3">
                <div className="sm:w-px sm:h-px w-8 h-px bg-zinc-700 sm:hidden" />
                <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block rotate-90 sm:rotate-0" />
                <div className="sm:w-px sm:h-8 w-8 h-px bg-zinc-700" />
              </div>

              {/* Feature Extraction */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="px-4 py-3 rounded-xl border border-zinc-700/80 bg-[#111118] text-center w-36">
                  <Layers className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-zinc-300">Feature Extraction</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">Structured vectors</p>
                </div>
              </div>

              {/* Fork arrow */}
              <div className="flex sm:flex-col items-center justify-center sm:pt-6 mx-2 sm:mx-3">
                <div className="sm:w-px sm:h-px w-8 h-px bg-zinc-700 sm:hidden" />
                <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:block rotate-90 sm:rotate-0" />
                <div className="sm:w-px sm:h-8 w-8 h-px bg-zinc-700" />
              </div>

              {/* Two models side by side */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {ML_MODELS.map((m) => (
                  <div
                    key={m.name}
                    className="flex-1 p-4 rounded-xl border"
                    style={{ borderColor: `${m.color}35`, background: `${m.color}06` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 shrink-0" style={{ color: m.color }} />
                      <p className="text-xs font-bold text-zinc-100">{m.name}</p>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">{m.description}</p>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono" style={{ color: m.color }}>
                      <ArrowRight className="w-3 h-3" />
                      <span>Outputs: {m.output}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom row: combined score → threat score → alert */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 pt-4 border-t border-zinc-800/60">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 shrink-0">
                <ArrowRight className="w-3 h-3" />
                Combined anomaly signal
                <ArrowRight className="w-3 h-3" />
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                <div className="px-4 py-3 rounded-xl border border-amber-500/25 bg-amber-500/06 text-center flex-1 w-full">
                  <BarChart2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-zinc-200">Threat Score</p>
                  <p className="text-[10px] text-amber-400 mt-0.5 font-mono">0–100 risk scale</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600" />
                <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/07 text-center flex-1 w-full">
                  <Bell className="w-4 h-4 text-red-400 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-zinc-200">Security Alert</p>
                  <p className="text-[10px] text-red-400 mt-0.5 font-mono">SOC notification</p>
                </div>
              </div>
            </div>

            {/* Honest disclaimer */}
            <div className="mt-6 flex items-start gap-3 p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/60">
              <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                <strong className="text-zinc-400">About the ML models:</strong> CyberShield AI uses <em>unsupervised anomaly detection</em> (Isolation Forest + One-Class SVM) — not a multi-class attack classifier. Attack categories are assigned using contextual and rule-based logic after the anomaly scoring step. This means the system can detect previously unseen anomalies rather than being limited to known attack signatures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
