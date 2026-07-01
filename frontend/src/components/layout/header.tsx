'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
      className="h-16 flex items-center justify-between px-6 shrink-0"
      style={{
        background: 'rgba(17, 17, 24, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #2a2a3a',
      }}
    >
      {/* Left: Page Title */}
      <div>
        <h1 className="text-lg font-semibold" style={{ color: '#e4e4e7' }}>
          {pageTitle}
        </h1>
      </div>

      {/* Right: Search + Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: '#71717a' }}
          />
          <input
            type="text"
            placeholder="Search threats, IPs, alerts..."
            className="w-64 pl-10 pr-16 py-2 rounded-lg text-sm transition-all duration-200"
            style={{
              background: '#1a1a24',
              border: '1px solid #2a2a3a',
              color: '#e4e4e7',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#06b6d4';
              e.target.style.width = '320px';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#2a2a3a';
              e.target.style.width = '256px';
            }}
          />
          <kbd
            className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              background: '#2a2a3a',
              color: '#71717a',
              border: '1px solid #3a3a4a',
            }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg transition-all duration-200"
          style={{ color: '#a1a1aa' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#1a1a24';
            e.currentTarget.style.color = '#e4e4e7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#a1a1aa';
          }}
        >
          <Bell className="w-5 h-5" />
          {/* Critical notification dot */}
          <span
            className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full animate-pulse"
            style={{
              background: '#ef4444',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
            }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-8" style={{ background: '#2a2a3a' }} />

        {/* User Dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{ color: '#e4e4e7' }}
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a24')}
            onMouseLeave={(e) => {
              if (!showDropdown) e.currentTarget.style.background = 'transparent';
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              }}
            >
              {user?.firstName?.[0] || 'A'}
              {user?.lastName?.[0] || 'D'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium">
                {user?.firstName || 'Admin'} {user?.lastName || 'User'}
              </p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: '#06b6d4' }}>
                {user?.role || 'ADMIN'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4" style={{ color: '#71717a' }} />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="absolute right-0 top-full mt-2 w-56 py-2 rounded-xl z-50 animate-fade-in"
              style={{
                background: '#111118',
                border: '1px solid #2a2a3a',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="px-4 py-2 mb-1" style={{ borderBottom: '1px solid #2a2a3a' }}>
                <p className="text-sm font-medium" style={{ color: '#e4e4e7' }}>
                  {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                </p>
                <p className="text-xs" style={{ color: '#71717a' }}>
                  {user?.email || 'admin@cti.com'}
                </p>
              </div>
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                style={{ color: '#a1a1aa' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1a1a24';
                  e.currentTarget.style.color = '#e4e4e7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#a1a1aa';
                }}
              >
                <User className="w-4 h-4" /> Profile
              </button>
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                style={{ color: '#a1a1aa' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1a1a24';
                  e.currentTarget.style.color = '#e4e4e7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#a1a1aa';
                }}
              >
                <Settings className="w-4 h-4" /> Settings
              </button>
              <div className="my-1" style={{ borderTop: '1px solid #2a2a3a' }} />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                style={{ color: '#ef4444' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
