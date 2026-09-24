'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  FileText,
  Activity,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

// ---------------------------------------------------------------------------
// Page metadata
// ---------------------------------------------------------------------------

const pageConfig: Record<string, { title: string; section: string }> = {
  '/overview':    { title: 'Dashboard',       section: 'Overview' },
  '/logs':        { title: 'Security Logs',   section: 'Monitoring' },
  '/alerts':      { title: 'Alert Management', section: 'Monitoring' },
  '/threats':     { title: 'Threat Analysis', section: 'Monitoring' },
  '/predictions': { title: 'AI Predictions',  section: 'Monitoring' },
  '/geo-map':     { title: 'Geographic Map',  section: 'Intelligence' },
  '/reports':     { title: 'Reports',         section: 'Intelligence' },
  '/users':       { title: 'User Management', section: 'System' },
  '/settings':    { title: 'Settings',        section: 'System' },
};

const navigationLinks = [
  { name: 'Dashboard Overview', path: '/overview', desc: 'SOC telemetry, trends & KPIs', icon: Activity },
  { name: 'Security Logs',      path: '/logs',     desc: 'Raw firewall & event ingestion', icon: FileText },
  { name: 'Alert Management',   path: '/alerts',   desc: 'Critical incidents & triage', icon: ShieldAlert },
  { name: 'Threat Analysis',    path: '/threats',  desc: 'Attribution & entity scores', icon: Sparkles },
];

// ---------------------------------------------------------------------------
// Notification mock data (static — real alerts come from /alerts)
// ---------------------------------------------------------------------------

const NOTIFICATIONS = [
  {
    id: '1',
    severity: 'CRITICAL',
    severityColor: '#f87171',
    severityBg: 'rgba(239,68,68,0.12)',
    severityBorder: 'rgba(239,68,68,0.25)',
    message: 'DDoS volumetric flood mitigated — 2.3 Gbps on gateway',
    ip: '103.224.182.250',
    time: '2m ago',
  },
  {
    id: '2',
    severity: 'HIGH',
    severityColor: '#fb923c',
    severityBg: 'rgba(249,115,22,0.12)',
    severityBorder: 'rgba(249,115,22,0.25)',
    message: 'SSH Brute Force threshold breached from rogue node',
    ip: '185.220.101.34',
    time: '12m ago',
  },
  {
    id: '3',
    severity: 'INFO',
    severityColor: '#94a3b8',
    severityBg: 'rgba(148,163,184,0.08)',
    severityBorder: 'rgba(148,163,184,0.15)',
    message: 'AI Threat Prediction model v2.4 synchronized',
    ip: null,
    time: '25m ago',
  },
];

// ---------------------------------------------------------------------------
// Header component
// ---------------------------------------------------------------------------

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(true);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setShowNotifications(false);
        setShowDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click-outside handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (showDropdown) setShowDropdown(false);
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  if (!mounted) return null;

  const page = pageConfig[pathname];
  const pageTitle = page?.title ?? 'Dashboard';
  const pageSection = page?.section ?? '';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    router.push(`/logs?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const filteredLinks = searchQuery.trim()
    ? navigationLinks.filter(
        (l) =>
          l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navigationLinks;

  const userInitials = (user?.firstName?.[0] ?? 'A') + (user?.lastName?.[0] ?? 'D');

  return (
    <header
      className="h-16 flex items-center justify-between shrink-0 z-30 sticky top-0"
      style={{
        background: 'rgba(9, 11, 18, 0.96)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 24px',
      }}
    >
      {/* ----------------------------------------------------------------- */}
      {/* Left: Breadcrumb page title                                         */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-2 min-w-0 mr-6">
        {pageSection && (
          <>
            <span className="text-[12px] text-slate-500 font-medium hidden sm:block">
              {pageSection}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700 hidden sm:block shrink-0" />
          </>
        )}
        <h1 className="text-[15px] font-semibold text-white tracking-tight truncate">
          {pageTitle}
        </h1>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Right: Search + Notifications + User                               */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-2.5 shrink-0">

        {/* ── Search ─────────────────────────────────────────────────── */}
        <div ref={searchContainerRef} className="relative hidden md:block w-64 lg:w-72">
          <form onSubmit={handleSearchSubmit}>
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 ${
                isSearchFocused
                  ? 'ring-1 ring-cyan-500/40'
                  : ''
              }`}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: isSearchFocused
                  ? '1px solid rgba(6,182,212,0.45)'
                  : '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0 select-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search threats, IPs, tactics..."
                className="flex-1 min-w-0 bg-transparent text-[12px] font-mono text-white placeholder:text-slate-600 focus:outline-none border-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-600 hover:text-slate-300 p-0.5 cursor-pointer transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-slate-600 bg-slate-900/80 border border-slate-800/80 shrink-0 select-none">
                  ⌘K
                </kbd>
              )}
            </div>
          </form>

          {/* Quick Search Dropdown */}
          {isSearchFocused && (
            <div
              className="absolute right-0 top-full mt-2 w-80 py-2 rounded-xl z-50 animate-fade-in"
              style={{
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>QUICK NAVIGATION</span>
                <span>ENTER TO SEARCH</span>
              </div>

              {searchQuery.trim() && (
                <div className="p-2 border-b border-white/[0.04]">
                  <button
                    onClick={() => {
                      setIsSearchFocused(false);
                      router.push(`/logs?search=${encodeURIComponent(searchQuery.trim())}`);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono cursor-pointer text-left transition-colors"
                    style={{
                      background: 'rgba(6,182,212,0.08)',
                      border: '1px solid rgba(6,182,212,0.2)',
                      color: '#22d3ee',
                    }}
                  >
                    <span className="truncate">Search logs for &quot;{searchQuery}&quot;</span>
                    <ArrowUpRight className="w-3.5 h-3.5 shrink-0 ml-2" />
                  </button>
                </div>
              )}

              <div className="p-1.5 space-y-0.5 max-h-60 overflow-y-auto">
                {filteredLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={link.path}
                      onClick={() => {
                        setIsSearchFocused(false);
                        router.push(link.path);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left cursor-pointer group transition-colors"
                      style={{ color: '#94a3b8' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          color: '#22d3ee',
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold text-slate-200 truncate">{link.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{link.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Notifications ──────────────────────────────────────────── */}
        <div ref={notificationsRef} className="relative shrink-0">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setHasUnreadAlerts(false);
            }}
            className="relative p-2 rounded-xl transition-all duration-150 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#6b7280',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e2e8f0';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6b7280';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            }}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {hasUnreadAlerts && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-70" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-[#090b12]" />
              </span>
            )}
          </button>

          {/* Notifications panel */}
          {showNotifications && (
            <div
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl z-50 animate-fade-in overflow-hidden"
              style={{
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[12px] font-bold text-white tracking-wide">Security Alerts</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                  LIVE
                </span>
              </div>

              {/* Notifications list */}
              <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl transition-colors"
                    style={{
                      background: n.severityBg,
                      border: `1px solid ${n.severityBorder}`,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{
                          background: n.severityBg,
                          color: n.severityColor,
                          border: `1px solid ${n.severityBorder}`,
                        }}
                      >
                        {n.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[12px] font-medium text-slate-200 leading-snug">{n.message}</p>
                    {n.ip && (
                      <span className="text-[10px] font-mono text-slate-500 mt-1 block">{n.ip}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-white/[0.06]">
                <Link
                  href="/alerts"
                  onClick={() => setShowNotifications(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-mono font-medium transition-colors"
                  style={{ color: '#22d3ee' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>View All Incidents</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Divider ────────────────────────────────────────────────── */}
        <div className="w-px h-5 bg-white/[0.07] shrink-0" />

        {/* ── User menu ──────────────────────────────────────────────── */}
        <div className="relative shrink-0">
          <button
            className="flex items-center gap-2 rounded-xl transition-all duration-150 cursor-pointer"
            style={{
              padding: '5px 8px 5px 5px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}
            >
              {userInitials}
            </div>
            {/* Name + Role */}
            <div className="hidden sm:block text-left leading-tight min-w-0">
              <p className="text-[12px] font-semibold text-slate-200 truncate max-w-[100px]">
                {user?.firstName ?? 'System'} {user?.lastName ?? 'Admin'}
              </p>
              <p className="text-[9px] uppercase tracking-widest font-bold text-cyan-400 mt-0.5">
                {user?.role ?? 'ADMIN'}
              </p>
            </div>
            <ChevronDown
              className="w-3.5 h-3.5 text-slate-600 shrink-0 hidden sm:block transition-transform duration-150"
              style={{ transform: showDropdown ? 'rotate(180deg)' : 'none' }}
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl z-50 animate-fade-in overflow-hidden"
              style={{
                background: '#0d1117',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              {/* User info */}
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-[12px] font-semibold text-white truncate">
                  {user?.firstName ?? 'System'} {user?.lastName ?? 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {user?.email ?? 'admin@cybershield.ai'}
                </p>
              </div>

              {/* Menu items */}
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => { setShowDropdown(false); router.push('/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <User className="w-3.5 h-3.5 text-slate-500" /> Profile
                </button>
                <button
                  onClick={() => { setShowDropdown(false); router.push('/settings'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" /> Settings
                </button>
              </div>

              <div className="mx-3 border-t border-white/[0.06]" />

              <div className="p-1.5">
                <button
                  onClick={() => { logout(); router.push('/login'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-semibold cursor-pointer transition-colors"
                  style={{ color: '#f87171' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
