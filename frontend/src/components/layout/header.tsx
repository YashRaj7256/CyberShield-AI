'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

const pageTitles: Record<string, string> = {
  '/overview': 'Dashboard Overview',
  '/logs': 'Security Logs',
  '/alerts': 'Alert Management',
  '/threats': 'Threat Analysis',
  '/predictions': 'AI Predictions',
  '/geo-map': 'Geographic Map',
  '/reports': 'Reports',
  '/users': 'User Management',
  '/settings': 'Settings',
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClick = () => setShowDropdown(false);
    if (showDropdown) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [showDropdown]);

  if (!mounted) return null;

  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30 sticky top-0"
      style={{
        background: 'rgba(17, 17, 24, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #2a2a3a',
      }}
    >
      {/* Left: Page Title */}
      <div className="flex items-center min-w-0 mr-4">
        <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Search + Notifications + User Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-500"
          />
          <input
            type="text"
            placeholder="Search threats, IPs, alerts..."
            className="w-48 lg:w-64 xl:w-72 pl-9 pr-12 py-2 rounded-xl text-xs bg-[#131927] border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <kbd
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-500 bg-slate-800/80 border border-slate-700/50 pointer-events-none"
          >
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all shrink-0 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          {/* Critical notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"
          />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-white/10 shrink-0" />

        {/* User Dropdown */}
        <div className="relative shrink-0">
          <button
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              }}
            >
              {user?.firstName?.[0] || 'A'}
              {user?.lastName?.[0] || 'D'}
            </div>
            <div className="hidden sm:block text-left max-w-[110px] lg:max-w-[150px]">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.firstName || 'Admin'} {user?.lastName || 'User'}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 leading-tight mt-0.5">
                {user?.role || 'ADMIN'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:block" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl z-50 animate-fade-in border border-white/10 bg-[#111118] shadow-2xl"
            >
              <div className="px-4 py-2 mb-1 border-b border-white/10">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email || 'admin@cti.com'}
                </p>
              </div>
              <button
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <User className="w-4 h-4 text-slate-400" /> Profile
              </button>
              <button
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-400" /> Settings
              </button>
              <div className="my-1 border-t border-white/10" />
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-400" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
