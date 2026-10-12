'use client';

import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Server, Info, Lock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

import ProfileSettings from '@/components/settings/profile-settings';
import SecuritySettings from '@/components/settings/security-settings';
import NotificationSettings from '@/components/settings/notification-settings';
import PlatformSettings from '@/components/settings/platform-settings';
import SystemInfo from '@/components/settings/system-info';
import { SectionCard } from '@/components/settings/settings-ui';
import { cn } from '@/lib/utils';

type Tab = 'profile' | 'security' | 'notifications' | 'platform' | 'system';

interface TabItem {
  id: Tab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresAdmin?: boolean;
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const isAdmin = user?.role === 'ADMIN';

  const tabs: TabItem[] = [
    {
      id: 'profile',
      label: 'Profile Information',
      description: 'Personal details and credentials',
      icon: User,
    },
    {
      id: 'security',
      label: 'Security & Auth',
      description: 'Password and session security',
      icon: Shield,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      description: 'Alert channels and thresholds',
      icon: Bell,
    },
    {
      id: 'platform',
      label: 'Platform Rules',
      description: 'ML thresholds and auto-actions',
      icon: Server,
      requiresAdmin: true,
    },
    {
      id: 'system',
      label: 'System Diagnostics',
      description: 'Telemetry, database & uptime',
      icon: Info,
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'platform':
        return <PlatformSettings />;
      case 'system':
        return <SystemInfo />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div
      className="settings-root w-full min-w-0 max-w-full pb-12 flex flex-col gap-6 animate-fade-in"
      style={
        {
          '--bg-base': '#0a0a0f',
          '--surface-1': 'rgba(255, 255, 255, 0.03)',
          '--surface-2': 'rgba(255, 255, 255, 0.05)',
          '--border': 'rgba(255, 255, 255, 0.08)',
          '--border-strong': 'rgba(255, 255, 255, 0.14)',
          '--accent': '#22D3EE',
          '--danger': '#F43F5E',
        } as React.CSSProperties
      }
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Layer 2: Page Header (Not a boxed card)                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="w-full min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* 40px Icon Tile */}
          <div className="w-10 h-10 rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shrink-0 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
            <Settings className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-white leading-tight">
              Platform Settings
            </h1>
            <p className="text-[13px] text-slate-400 mt-0.5 truncate">
              Manage analyst profile, notification triggers, automated defenses, and system telemetry.
            </p>
          </div>
        </div>

        {/* Height 28px Role Pill */}
        <div className="shrink-0 self-start sm:self-center mr-3 sm:mr-4">
          <div className="h-7 px-3 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono flex items-center gap-2">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                user?.role === 'ADMIN'
                  ? 'bg-rose-400 animate-pulse'
                  : user?.role === 'ANALYST'
                  ? 'bg-cyan-400'
                  : 'bg-emerald-400'
              )}
            />
            <span className="text-slate-400">Role:</span>
            <span
              className={cn(
                'font-semibold',
                user?.role === 'ADMIN'
                  ? 'text-rose-400'
                  : user?.role === 'ANALYST'
                  ? 'text-cyan-400'
                  : 'text-slate-200'
              )}
            >
              {user?.role || 'VIEWER'}
            </span>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Mobile / Tablet Horizontal Navigation (< 1024px)              */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden w-full min-w-0">
        <div className="overflow-x-auto no-scrollbar flex items-center gap-2 p-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
                  isActive
                    ? 'bg-[var(--accent)]/10 text-white border border-[var(--accent)]/35 shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-[var(--accent)]' : 'text-slate-400')} />
                <span>{tab.label}</span>
                {tab.requiresAdmin && (
                  <span
                    className={cn(
                      'text-[9px] font-mono px-1 py-0.2 rounded border flex items-center gap-0.5',
                      isAdmin
                        ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                        : 'bg-slate-800 text-slate-400 border-white/[0.08]'
                    )}
                  >
                    <Lock className="w-2.5 h-2.5" />
                    Admin
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* Layer 3: Body Grid (280px minmax(0, 1fr) gap-6)               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start w-full min-w-0">
        {/* Left: Sticky Settings Navigation (top: 88px) */}
        <aside className="hidden lg:block w-full min-w-0 sticky top-[88px] z-10 self-start">
          <SectionCard className="p-3">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-3 px-2">
              Settings Navigation
            </div>

            <nav className="flex flex-col gap-1 w-full" role="tablist">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'group relative flex items-center justify-between w-full h-14 pl-3 pr-3.5 rounded-[10px] text-left transition-all duration-150 cursor-pointer min-w-0',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
                      isActive
                        ? 'bg-[var(--accent)]/10 text-white border border-[var(--accent)]/35 shadow-[0_0_15px_rgba(34,211,238,0.12)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] border border-transparent'
                    )}
                  >
                    {/* Left 3px accent bar indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[var(--accent)] rounded-r shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                    )}

                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* 32px Icon Tile */}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                          isActive
                            ? 'bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40'
                            : 'bg-white/[0.03] text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.06] border border-white/[0.06]'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'text-sm font-medium block truncate',
                            isActive ? 'text-white' : 'text-slate-300'
                          )}
                        >
                          {tab.label}
                        </span>
                        <p className="text-xs text-slate-500 truncate leading-tight mt-0.5">
                          {tab.description}
                        </p>
                      </div>
                    </div>

                    {/* Admin lock tag: right-aligned with 12 to 16px right margin/padding */}
                    {tab.requiresAdmin && (
                      <span
                        className={cn(
                          'shrink-0 text-[10px] font-mono px-2 py-0.5 rounded border ml-2 mr-1 flex items-center gap-1',
                          isAdmin
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                            : 'bg-slate-800 text-slate-400 border-white/[0.08]'
                        )}
                      >
                        <Lock className="w-2.5 h-2.5" />
                        Admin
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </SectionCard>
        </aside>

        {/* Right: Active Section Content */}
        <main className="w-full min-w-0 min-h-[580px]">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
}
