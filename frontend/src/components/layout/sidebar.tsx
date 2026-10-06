'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ScrollText,
  Bell,
  ShieldAlert,
  TrendingUp,
  Globe,
  FileText,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore, SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/stores/sidebar-store';
import CyberShieldLogo from '@/components/brand/CyberShieldLogo';
import { useApi } from '@/hooks/use-api';
import telemetryStore from '@/lib/telemetry-store';
import { mockDashboardStats } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  adminOnly?: boolean;
}

interface NavSection {
  sectionLabel: string;
  items: NavItem[];
}

// ---------------------------------------------------------------------------
// Navigation structure — standard items & semantic icons
// ---------------------------------------------------------------------------

const navSections: NavSection[] = [
  {
    sectionLabel: 'Overview',
    items: [
      { label: 'Dashboard', href: '/overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    sectionLabel: 'Monitoring',
    items: [
      { label: 'Security Logs', href: '/logs', icon: <ScrollText className="w-4 h-4" /> },
      { label: 'Alerts', href: '/alerts', icon: <Bell className="w-4 h-4" />, badge: 23 },
      { label: 'Threat Analysis', href: '/threats', icon: <ShieldAlert className="w-4 h-4" /> },
      { label: 'Predictions', href: '/predictions', icon: <TrendingUp className="w-4 h-4" /> },
    ],
  },
  {
    sectionLabel: 'Intelligence',
    items: [
      { label: 'Geo Map', href: '/geo-map', icon: <Globe className="w-4 h-4" /> },
      { label: 'Reports', href: '/reports', icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    sectionLabel: 'System',
    items: [
      { label: 'Users', href: '/users', icon: <Users className="w-4 h-4" />, adminOnly: true },
      { label: 'Settings', href: '/settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { collapsed, mobileOpen, toggleSidebar, setMobileOpen } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  // Live alert stats from backend
  const rawStats = useApi<{ criticalAlerts: number; totalAlerts: number }>('/dashboard/stats', undefined, { fallbackData: undefined });
  const alertCount = rawStats.data?.criticalAlerts ?? 23;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // A collapsed rail is useful on desktop but unreadable as a phone drawer.
  const isCompact = collapsed && !mobileOpen;

  const userInitials =
    (user?.firstName?.[0] ?? 'A') + (user?.lastName?.[0] ?? 'D');

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation menu"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={() => setMobileOpen(false)}
        className={`dashboard-nav-backdrop fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-[1px] transition-opacity lg:hidden ${
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
      className={`dashboard-sidebar fixed left-0 top-0 h-dvh flex flex-col z-40 transition-[transform,width] duration-300 ease-in-out ${
        mobileOpen ? 'mobile-open' : ''
      }`}
      style={{
        width: isCompact ? `${SIDEBAR_COLLAPSED_WIDTH}px` : `${SIDEBAR_EXPANDED_WIDTH}px`,
        background: 'rgba(9, 11, 18, 0.98)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Brand Area                                                        */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="shrink-0 transition-all duration-300"
        style={{
          padding: isCompact ? '18px 0' : '18px 16px 14px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {isCompact ? (
          /* Collapsed state: Centered icon-only mark */
          <div className="flex flex-col items-center justify-center">
            <Link
              href="/overview"
              className="group flex items-center justify-center transition-transform duration-200 hover:scale-105"
              aria-label="CyberShield AI home"
            >
              <CyberShieldLogo variant="icon" size={40} />
            </Link>
          </div>
        ) : (
          /* Expanded state: Full logo directly on dark sidebar surface */
          <Link
            href="/overview"
            className="group block transition-opacity duration-200 hover:opacity-90"
            aria-label="CyberShield AI home"
          >
            <div className="flex items-center">
              <CyberShieldLogo variant="full" width={170} />
            </div>

            {/* Brand subtitle */}
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400">
                Threat Intelligence
              </span>
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded font-medium"
                style={{
                  background: 'rgba(6, 182, 212, 0.12)',
                  color: '#67e8f9',
                  border: '1px solid rgba(6, 182, 212, 0.25)',
                }}
              >
                SOC v2.4
              </span>
            </div>
          </Link>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Navigation                                                          */}
      {/* ----------------------------------------------------------------- */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {navSections.map((section, sIdx) => {
          // Filter adminOnly items
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || user?.role === 'ADMIN'
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.sectionLabel} className={sIdx > 0 ? 'mt-2' : ''}>
              {/* Section divider */}
              {sIdx > 0 && <div className="nav-group-divider" />}

              {/* Section label — only when expanded */}
              {!isCompact && (
                <div className="nav-section-label mt-2 mb-1">
                  {section.sectionLabel}
                </div>
              )}

              {/* Nav items */}
              <div className="px-2 space-y-1">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;
                  const itemBadge = item.href === '/alerts' ? alertCount : item.badge;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-2.5 rounded-lg transition-all duration-150 ${
                        isActive
                          ? 'bg-cyan-500/[0.08] text-cyan-300 font-medium border border-cyan-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] border border-transparent'
                      }`}
                      style={{
                        padding: isCompact ? '9px 0' : '8px 10px',
                        justifyContent: isCompact ? 'center' : 'flex-start',
                      }}
                      aria-label={isCompact ? item.label : undefined}
                      title={isCompact ? item.label : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      {/* Active indicator strip */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-cyan-400"
                        />
                      )}

                      {/* Icon */}
                      <span
                        className={`shrink-0 transition-colors duration-150 ${
                          isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                      >
                        {item.icon}
                      </span>

                      {/* Label + Badge — hidden when collapsed */}
                      {!isCompact && (
                        <>
                          <span className="flex-1 text-[13px] font-medium truncate leading-normal py-0.5">
                            {item.label}
                          </span>
                          {itemBadge != null && itemBadge > 0 && (
                            <span
                              className="ml-auto text-[10px] font-mono font-bold rounded-full px-2 py-0.5 shrink-0 tabular-nums flex items-center justify-center min-w-[20px] h-[18px]"
                              style={{
                                background: 'rgba(239, 68, 68, 0.12)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.25)',
                              }}
                            >
                              {itemBadge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCompact && (
                        <div
                          className="pointer-events-none absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50"
                          style={{
                            background: '#111827',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#e2e8f0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                          }}
                        >
                          {item.label}
                          {itemBadge != null && itemBadge > 0 && (
                            <span className="ml-1.5 text-rose-400">({itemBadge})</span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* Bottom: User Profile + Collapse Toggle (mt-auto, non-overlapping)   */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="mt-auto shrink-0 p-3 flex flex-col gap-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Collapse Toggle */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg text-[12px] font-medium transition-all duration-150 cursor-pointer text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] py-2 px-2.5"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed
            ? <PanelLeftOpen className="w-4 h-4" />
            : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )
          }
        </button>

        {/* User Info */}
        <div
          className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
          style={{
            padding: isCompact ? '8px 0' : '8px 10px',
            justifyContent: isCompact ? 'center' : 'flex-start',
          }}
        >
          {/* Avatar */}
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)' }}
          >
            {userInitials}
          </div>

          {!isCompact && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-slate-200 truncate leading-normal">
                  {user?.firstName ?? 'Admin'} {user?.lastName ?? 'User'}
                </p>
                <p className="text-[9px] uppercase tracking-wider font-mono font-semibold text-cyan-400/90 leading-tight mt-0.5">
                  {user?.role ?? 'ADMIN'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 cursor-pointer shrink-0"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
      </aside>
    </>
  );
}
