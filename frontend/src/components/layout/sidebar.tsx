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
import CyberShieldLogo from '@/components/brand/CyberShieldLogo';

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
// Navigation structure — same hrefs as before, now grouped
// ---------------------------------------------------------------------------

const navSections: NavSection[] = [
  {
    sectionLabel: 'Overview',
    items: [
      { label: 'Dashboard', href: '/overview', icon: <LayoutDashboard className="w-[18px] h-[18px]" /> },
    ],
  },
  {
    sectionLabel: 'Monitoring',
    items: [
      { label: 'Security Logs', href: '/logs', icon: <ScrollText className="w-[18px] h-[18px]" /> },
      { label: 'Alerts', href: '/alerts', icon: <Bell className="w-[18px] h-[18px]" />, badge: 23 },
      { label: 'Threat Analysis', href: '/threats', icon: <ShieldAlert className="w-[18px] h-[18px]" /> },
      { label: 'Predictions', href: '/predictions', icon: <TrendingUp className="w-[18px] h-[18px]" /> },
    ],
  },
  {
    sectionLabel: 'Intelligence',
    items: [
      { label: 'Geo Map', href: '/geo-map', icon: <Globe className="w-[18px] h-[18px]" /> },
      { label: 'Reports', href: '/reports', icon: <FileText className="w-[18px] h-[18px]" /> },
    ],
  },
  {
    sectionLabel: 'System',
    items: [
      { label: 'Users', href: '/users', icon: <Users className="w-[18px] h-[18px]" />, adminOnly: true },
      { label: 'Settings', href: '/settings', icon: <Settings className="w-[18px] h-[18px]" /> },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sidebar component
// ---------------------------------------------------------------------------

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const userInitials =
    (user?.firstName?.[0] ?? 'A') + (user?.lastName?.[0] ?? 'D');

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40 transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? '72px' : '272px',
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
          padding: collapsed ? '18px 0' : '20px 20px 16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {collapsed ? (
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
              <CyberShieldLogo variant="full" width={198} />
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
            <div key={section.sectionLabel} className={sIdx > 0 ? 'mt-1' : ''}>
              {/* Section divider */}
              {sIdx > 0 && <div className="nav-group-divider" />}

              {/* Section label — only when expanded */}
              {!collapsed && (
                <div className="nav-section-label mt-3 mb-1">
                  {section.sectionLabel}
                </div>
              )}

              {/* Nav items */}
              <div className="px-2 space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative flex items-center gap-3 rounded-xl transition-all duration-150"
                      style={{
                        padding: collapsed ? '10px 0' : '9px 10px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        background: isActive
                          ? 'rgba(6, 182, 212, 0.08)'
                          : 'transparent',
                        color: isActive ? '#22d3ee' : '#6b7280',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                          e.currentTarget.style.color = '#cbd5e1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#6b7280';
                        }
                      }}
                    >
                      {/* Active indicator strip */}
                      {isActive && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-cyan-400"
                          style={{ marginLeft: '-8px' }}
                        />
                      )}

                      {/* Icon */}
                      <span
                        className="shrink-0 transition-colors duration-150"
                        style={{ color: isActive ? '#22d3ee' : 'inherit' }}
                      >
                        {item.icon}
                      </span>

                      {/* Label + Badge — hidden when collapsed */}
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-[13px] font-medium truncate leading-none">
                            {item.label}
                          </span>
                          {item.badge != null && item.badge > 0 && (
                            <span
                              className="ml-auto text-[10px] font-bold rounded-full px-1.5 py-0.5 shrink-0 tabular-nums"
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239,68,68,0.25)',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
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
                          {item.badge != null && item.badge > 0 && (
                            <span className="ml-1.5 text-rose-400">({item.badge})</span>
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
      {/* Bottom: User Profile + Collapse Toggle                              */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="shrink-0 px-2 py-3 space-y-1.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 rounded-xl text-[12px] font-medium transition-all duration-200 cursor-pointer"
          style={{
            padding: '8px 10px',
            color: '#4b5563',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#94a3b8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4b5563';
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
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
          className="flex items-center gap-2.5 rounded-xl"
          style={{
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
          >
            {userInitials}
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-200 truncate leading-tight">
                  {user?.firstName ?? 'Admin'} {user?.lastName ?? 'User'}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 leading-tight mt-0.5">
                  {user?.role ?? 'ADMIN'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg transition-colors duration-150 cursor-pointer shrink-0"
                style={{ color: '#4b5563' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#f87171';
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#4b5563';
                  e.currentTarget.style.background = 'transparent';
                }}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
