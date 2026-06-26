'use client';

import { FileText, Lock, Download, Calendar, PieChart } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="glass-card p-12 text-center max-w-lg w-full" style={{ border: '1px solid rgba(234, 179, 8, 0.2)' }}>
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-float"
          style={{ background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(249, 115, 22, 0.2))', border: '1px solid rgba(234, 179, 8, 0.3)', boxShadow: '0 0 30px rgba(234, 179, 8, 0.15)' }}>
          <FileText className="w-10 h-10" style={{ color: '#eab308' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#e4e4e7' }}>Intelligence Reports</h1>
        <p className="text-sm mb-8" style={{ color: '#71717a' }}>Automated threat intelligence reports with PDF/CSV/Excel export</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: <Calendar className="w-4 h-4" />, label: 'Scheduled', desc: 'Daily, weekly, monthly' },
            { icon: <Download className="w-4 h-4" />, label: 'Export', desc: 'PDF, CSV, Excel' },
            { icon: <PieChart className="w-4 h-4" />, label: 'Analytics', desc: 'Risk trends & stats' },
            { icon: <FileText className="w-4 h-4" />, label: 'Incident', desc: 'Detailed incident reports' },
          ].map((item, i) => (
            <div key={i} className="p-3 rounded-lg text-left" style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: '#eab308' }}>{item.icon}<span className="text-xs font-medium">{item.label}</span></div>
              <p className="text-[10px]" style={{ color: '#71717a' }}>{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
          <Lock className="w-3 h-3" /> Coming in Phase 3
        </div>
      </div>
    </div>
  );
}
