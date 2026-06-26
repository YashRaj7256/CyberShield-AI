'use client';

import { Settings, Lock, Bell, Shield, Database, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="glass-card p-12 text-center max-w-lg w-full" style={{ border: '1px solid rgba(113, 113, 122, 0.3)' }}>
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-float"
          style={{ background: 'linear-gradient(135deg, rgba(113, 113, 122, 0.2), rgba(161, 161, 170, 0.1))', border: '1px solid rgba(113, 113, 122, 0.3)', boxShadow: '0 0 30px rgba(113, 113, 122, 0.1)' }}>
          <Settings className="w-10 h-10" style={{ color: '#a1a1aa' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#e4e4e7' }}>System Settings</h1>
        <p className="text-sm mb-8" style={{ color: '#71717a' }}>Platform configuration and preferences</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: <Shield className="w-4 h-4" />, label: 'Thresholds', desc: 'Threat score limits' },
            { icon: <Bell className="w-4 h-4" />, label: 'Notifications', desc: 'Alert preferences' },
            { icon: <Database className="w-4 h-4" />, label: 'Retention', desc: 'Log storage policies' },
            { icon: <Key className="w-4 h-4" />, label: 'API Keys', desc: 'Integration keys' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg text-left" style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: '#a1a1aa' }}>{item.icon}<span className="text-xs font-medium">{item.label}</span></div>
              <p className="text-[10px]" style={{ color: '#71717a' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium" style={{ background: 'rgba(113, 113, 122, 0.1)', color: '#a1a1aa', border: '1px solid rgba(113, 113, 122, 0.2)' }}>
          <Lock className="w-3 h-3" /> Coming in Phase 4
        </div>
      </div>
    </div>
  );
}
