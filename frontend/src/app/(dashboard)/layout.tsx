'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { useAuthStore } from '@/stores/auth-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);

  useEffect(() => {
    loadFromStorage();
    setMounted(true);
  }, [loadFromStorage]);

  // Listen for sidebar width changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const width = parseInt(sidebar.style.width || '280');
        setSidebarWidth(width);
      }
    });

    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
    }

    return () => observer.disconnect();
  }, [mounted]);

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
          <div
            className="w-12 h-12 rounded-xl animate-pulse"
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(59, 130, 246, 0.3))',
            }}
          />
          <p className="text-sm" style={{ color: '#71717a' }}>
            Loading CyberShield AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0f' }}>
      <Sidebar />
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 overflow-x-hidden"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto cyber-grid-bg">
          <div className="max-w-[1600px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
