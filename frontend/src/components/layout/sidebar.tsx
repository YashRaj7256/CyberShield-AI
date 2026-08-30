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
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Security Logs', href: '/logs', icon: <ScrollText className="w-5 h-5" /> },
  { label: 'Alerts', href: '/alerts', icon: <Bell className="w-5 h-5" />, badge: 23 },
  { label: 'Threat Analysis', href: '/threats', icon: <ShieldAlert className="w-5 h-5" /> },
  { label: 'Predictions', href: '/predictions', icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Geo Map', href: '/geo-map', icon: <Globe className="w-5 h-5" /> },
  { label: 'Reports', href: '/reports', icon: <FileText className="w-5 h-5" /> },
  { label: 'Users', href: '/users', icon: <Users className="w-5 h-5" />, adminOnly: true },
  { label: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = navItems.filter(
    (item) => !item.adminOnly || user?.role === 'ADMIN'
  );

  if (!mounted) return null;

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40 transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? '80px' : '280px',
        background: 'rgba(17, 17, 24, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid #2a2a3a',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 h-16 shrink-0"
        style={{ borderBottom: '1px solid #2a2a3a' }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          }}
        >
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold gradient-text whitespace-nowrap">
              CyberShield AI
            </h1>
            <p className="text-[10px] whitespace-nowrap" style={{ color: '#71717a' }}>
              Threat Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative"
                style={{
                  background: isActive
                    ? 'rgba(6, 182, 212, 0.1)'
                    : 'transparent',
                  color: isActive ? '#06b6d4' : '#a1a1aa',
                  borderLeft: isActive
                    ? '3px solid #06b6d4'
                    : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(26, 26, 36, 0.8)';
                    e.currentTarget.style.color = '#e4e4e7';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a1a1aa';
                  }
                }}
              >
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {item.badge && item.badge > 0 && (
                  <span
                    className="ml-auto text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                {collapsed && (
                  <div
                    className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50"
                    style={{
                      background: '#1a1a24',
                      border: '1px solid #2a2a3a',
                      color: '#e4e4e7',
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="shrink-0 px-3 pb-6 pt-3 border-t border-[#2a2a3a]/70 bg-[#0e1320]/80 space-y-2">
        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-slate-400 hover:text-white cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse Sidebar</span>}
        </button>

        {/* User Info */}
        <div
          className="flex items-center gap-2.5 p-2 rounded-xl border border-white/5 bg-white/[0.02]"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            }}
          >
            {user?.firstName?.[0] || 'A'}
            {user?.lastName?.[0] || 'D'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.firstName || 'Admin'} {user?.lastName || 'User'}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 leading-tight mt-0.5">
                {user?.role || 'ADMIN'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
