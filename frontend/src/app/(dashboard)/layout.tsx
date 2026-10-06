'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import CyberShieldLogo from '@/components/brand/CyberShieldLogo';
import Header from '@/components/layout/header';
import { useAuthStore } from '@/stores/auth-store';
import { useSidebarStore, SIDEBAR_EXPANDED_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/stores/sidebar-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const { collapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse opacity-80">
            <CyberShieldLogo variant="icon" size={48} />
          </div>
          <p className="text-sm" style={{ color: '#71717a' }}>
            Loading CyberShield AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="dashboard-shell min-h-dvh flex"
      style={{
        background: '#0a0a0f',
        '--dashboard-sidebar-width': `${sidebarWidth}px`,
      } as React.CSSProperties}
    >
      <Sidebar />
      <div
        className="dashboard-main flex-1 flex flex-col min-h-dvh transition-[margin,width] duration-300 ease-in-out min-w-0"
      >
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden cyber-grid-bg">
          <div className="dashboard-page-content w-full pt-5 pb-12 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
