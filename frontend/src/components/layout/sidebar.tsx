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
import { useSidebarStore } from '@/stores/sidebar-store';
import CyberShieldLogo from '@/components/brand/CyberShieldLogo';
import { useApi } from '@/hooks/use-api';

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
      { label: 'Dashboard', href: '/overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    ],
  },
  {
    sectionLabel: 'Monitoring',
    items: [
      { label: 'Security Logs', href: '/logs', icon: <ScrollText className="w-5 h-5" /> },
      { label: 'Alerts', href: '/alerts', icon: <Bell className="w-5 h-5" />, badge: 23 },
      { label: 'Threat Analysis', href: '/threats', icon: <ShieldAlert className="w-5 h-5" /> },
      { label: 'Predictions', href: '/predictions', icon: <TrendingUp className="w-5 h-5" /> },
    ],
  },
  {
    sectionLabel: 'Intelligence',
    items: [
      { label: 'Geo Map', href: '/geo-map', icon: <Globe className="w-5 h-5" /> },
      { label: 'Reports', href: '/reports', icon: <FileText className="w-5 h-5" /> },
    ],
  },
  {
    sectionLabel: 'System',
    items: [
      { label: 'Users', href: '/users', icon: <Users className="w-5 h-5" />, adminOnly: true },
      { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
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
  const rawStats = useApi<{ criticalAlerts: number; totalAlerts: number }>(
    '/dashboard/stats',
    undefined,
    { fallbackData: undefined }
  );
  const alertCount = rawStats.data?.criticalAlerts ?? 23;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // A collapsed rail is useful on desktop but unreadable as a phone drawer.
  const isCompact = collapsed && !mobileOpen;

  const userInitials =
    (user?.firstName?.[0] ?? 'S') + (user?.lastName?.[0] ?? 'A');

  return (
    <>
      {/* Mobile backdrop */}
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

      {/* Main Sidebar Shell */}
      <aside
        data-collapsed={isCompact ? 'true' : 'false'}
        className={`dashboard-sidebar fixed left-0 top-0 h-dvh flex flex-col z-40 overflow-hidden select-none ${
          mobileOpen ? 'mobile-open' : ''
        }`}
        style={{
          width: isCompact ? 'var(--sb-w-collapsed)' : 'var(--sb-w-expanded)',
          background: 'rgba(9, 11, 18, 0.98)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transition: 'width var(--sb-dur) var(--sb-ease)',
        }}
        onTransitionStart={(e) => {
          if (e.target === e.currentTarget && e.propertyName === 'width') {
            e.currentTarget.style.willChange = 'width';
          }
        }}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === 'width') {
            e.currentTarget.style.willChange = 'auto';
          }
        }}
      >
        {/* ----------------------------------------------------------------- */}
        {/* Brand Area (Exact fixed height in both states)                    */}
        {/* ----------------------------------------------------------------- */}
        <div
          className="shrink-0 relative overflow-hidden"
          style={{
            height: 'var(--sb-header-h)',
            padding: '0 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Collapsed state mark: pinned in the 72px icon column, centered */}
          <div
            className="sidebar-brand-collapsed absolute left-0 top-0 bottom-0 flex items-center justify-center pointer-events-none"
            style={{
              width: 'var(--sb-w-collapsed)',
            }}
          >
            <Link
              href="/overview"
              className="flex items-center justify-center transition-transform duration-200 hover:scale-105 pointer-events-auto"
              aria-label="CyberShield AI home"
              tabIndex={isCompact ? 0 : -1}
            >
              <CyberShieldLogo variant="icon" size={38} />
            </Link>
          </div>

          {/* Expanded state: full wordmark and subtitle direct on surface */}
          <div
            className="sidebar-brand-expanded absolute left-0 top-0 bottom-0 flex flex-col justify-center overflow-hidden"
            style={{
              width: 'var(--sb-w-expanded)',
              padding: '0 16px',
            }}
          >
            <Link
              href="/overview"
              className="group block transition-opacity duration-200 hover:opacity-90 pointer-events-auto"
              aria-label="CyberShield AI home"
              tabIndex={isCompact ? -1 : 0}
            >
              <div className="flex items-center">
                <CyberShieldLogo variant="full" width={170} />
              </div>

              {/* Brand subtitle */}
              <div className="mt-2.5 flex items-center justify-between w-[228px] max-w-full">
                <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-cyan-400 truncate">
                  Threat Intelligence
                </span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded font-medium shrink-0 ml-2"
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
          </div>
        </div>

        {/* ----------------------------------------------------------------- */}
        {/* Navigation List (Scrollable on short screens, hidden scrollbar)   */}
        {/* ----------------------------------------------------------------- */}
        <nav
          className="sidebar-nav-scroll flex-1 py-2 overflow-y-auto overflow-x-hidden"
          style={{ padding: '0 12px' }}
        >
          {navSections.map((section, sIdx) => {
            const visibleItems = section.items.filter(
              (item) => !item.adminOnly || user?.role === 'ADMIN'
            );
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.sectionLabel}>
                {/* Section header block: identical fixed height in both states */}
                <div
                  className="relative flex items-center overflow-hidden"
                  style={{
                    height: 'var(--sb-section-h)',
                    marginTop: sIdx > 0 ? 'var(--sb-section-gap)' : '4px',
                    marginBottom: '4px',
                  }}
                >
                  {/* Collapsed state: thin centered 1px divider (~28px wide) */}
                  <div
                    className="sidebar-section-divider absolute left-0 flex items-center justify-center pointer-events-none"
                    style={{
                      width: 'var(--sb-w-collapsed)',
                      height: '100%',
                    }}
                  >
                    <span className="h-px w-[28px] bg-white/[0.08]" />
                  </div>

                  {/* Expanded state: section text label */}
                  <div
                    className="sidebar-section-text sidebar-label-group absolute left-0 flex items-center overflow-hidden pointer-events-none"
                    style={{
                      width: 'var(--sb-w-expanded)',
                      height: '100%',
                      padding: '0 16px',
                    }}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider font-mono text-slate-500 whitespace-nowrap">
                      {section.sectionLabel}
                    </span>
                  </div>
                </div>

                {/* Nav items list */}
                <div>
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    const itemBadge = item.href === '/alerts' ? alertCount : item.badge;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="sidebar-nav-item group relative flex items-center text-slate-400 hover:text-slate-200"
                        style={{
                          height: 'var(--sb-item-h)',
                          marginBottom: 'var(--sb-item-gap)',
                          width: '100%',
                        }}
                        aria-label={item.label}
                        onClick={() => setMobileOpen(false)}
                      >
                        {/* Active item highlight background */}
                        {isActive && (
                          <div className="sidebar-nav-active-bg absolute bg-cyan-500/[0.08] border border-cyan-500/20 pointer-events-none" />
                        )}

                        {/* Active left indicator strip */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-cyan-400 pointer-events-none" />
                        )}

                        {/* Icon Column: 48px wide, icon centered at x=24px (x=36px from sidebar edge) */}
                        <div
                          className="sidebar-icon-col shrink-0 flex items-center justify-center relative"
                          style={{
                            width: '48px',
                            height: 'var(--sb-item-h)',
                          }}
                        >
                          <span
                            className={`shrink-0 transition-colors duration-150 flex items-center justify-center ${
                              isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-300'
                            }`}
                          >
                            {item.icon}
                          </span>

                          {/* Alerts badge dot (collapsed state, top-right of icon) */}
                          {itemBadge != null && itemBadge > 0 && (
                            <span
                              className="sidebar-badge-dot absolute pointer-events-none"
                              style={{
                                top: '6px',
                                right: '8px',
                              }}
                            />
                          )}
                        </div>

                        {/* Label Group (Text + Badge pill): stays in DOM in both states */}
                        <div
                          className="sidebar-label-group flex-1 min-w-0 flex items-center justify-between pr-3 overflow-hidden"
                          style={{
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span
                            className={`truncate text-[13px] font-medium leading-normal py-0.5 ${
                              isActive ? 'text-cyan-300 font-semibold' : 'text-slate-300 group-hover:text-slate-100'
                            }`}
                          >
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
                        </div>

                        {/* Tooltip for collapsed state */}
                        <div
                          className="sidebar-tooltip pointer-events-none absolute left-[calc(var(--sb-w-collapsed)+8px)] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap z-50"
                          style={{
                            background: '#111827',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: '#e2e8f0',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                          }}
                        >
                          {item.label}
                          {itemBadge != null && itemBadge > 0 && (
                            <span className="ml-1.5 text-rose-400 font-mono">({itemBadge})</span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ----------------------------------------------------------------- */}
        {/* Bottom Group: Collapse Toggle + User Profile (Pinned mt-auto)    */}
        {/* ----------------------------------------------------------------- */}
        <div
          className="mt-auto shrink-0 flex flex-col gap-2 overflow-hidden"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px',
          }}
        >
          {/* Collapse Toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="sidebar-collapse-btn hidden lg:flex w-full items-center relative text-[12px] font-medium transition-colors text-slate-400 hover:text-slate-200"
            style={{ height: '38px', padding: 0 }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
          >
            {/* Hover background */}
            <div className="absolute inset-0 rounded-lg hover:bg-white/[0.04] transition-colors pointer-events-none" />

            {/* Icon column: 48px wide */}
            <div
              className="shrink-0 flex items-center justify-center relative"
              style={{ width: '48px' }}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </div>

            {/* Label */}
            <span className="sidebar-label-group truncate pr-3 whitespace-nowrap">
              Collapse
            </span>
          </button>

          {/* User Info */}
          <div
            className="sidebar-user-block relative flex items-center overflow-hidden"
            style={{
              height: '46px',
            }}
          >
            {/* User card background */}
            <div className="sidebar-user-bg absolute inset-0 pointer-events-none rounded-lg bg-white/[0.02] border border-white/[0.04]" />

            {/* Avatar centered in 48px column */}
            <div
              className="shrink-0 flex items-center justify-center relative"
              style={{ width: '48px' }}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #0891b2, #2563eb)' }}
              >
                {userInitials}
              </div>
            </div>

            {/* User details and sign out */}
            <div className="sidebar-label-group flex-1 min-w-0 flex items-center justify-between pr-3 overflow-hidden">
              <div className="min-w-0 pr-2">
                <p className="text-[12px] font-medium text-slate-200 truncate leading-normal">
                  {user?.firstName ?? 'Security'} {user?.lastName ?? 'Analyst'}
                </p>
                <p className="text-[9px] uppercase tracking-wider font-mono font-semibold text-cyan-400/90 leading-tight mt-0.5 truncate">
                  {user?.role ?? 'ADMIN'}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 cursor-pointer shrink-0"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
