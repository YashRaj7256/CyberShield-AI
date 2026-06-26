'use client';

import { Globe, Lock, MapPin, Activity, Crosshair } from 'lucide-react';

export default function GeoMapPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="glass-card p-12 text-center max-w-lg w-full" style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-float"
          style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))', border: '1px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)' }}>
          <Globe className="w-10 h-10" style={{ color: '#3b82f6' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2 gradient-text">Geographical Attack Map</h1>
        <p className="text-sm mb-8" style={{ color: '#71717a' }}>Interactive world map with real-time attack visualization</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: <MapPin className="w-4 h-4" />, label: 'Attack Origins', desc: 'Pin-point source locations' },
            { icon: <Activity className="w-4 h-4" />, label: 'Live Heatmap', desc: 'Threat density overlay' },
            { icon: <Crosshair className="w-4 h-4" />, label: 'Attack Lines', desc: 'Source → target animation' },
            { icon: <Globe className="w-4 h-4" />, label: 'Country Risk', desc: 'Risk scoring by region' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg text-left" style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: '#3b82f6' }}>{item.icon}<span className="text-xs font-medium">{item.label}</span></div>
              <p className="text-[10px]" style={{ color: '#71717a' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Lock className="w-3 h-3" /> Coming in Phase 3
        </div>
      </div>
    </div>
  );
}
