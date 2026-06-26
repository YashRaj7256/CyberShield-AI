'use client';

import { useEffect, useState } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: '#0a0a0f' }}
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 cyber-grid-bg opacity-60" />

      {/* Animated gradient orbs */}
      {mounted && (
        <>
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[100px]"
            style={{
              background: 'radial-gradient(circle, #06b6d4, transparent)',
              top: '-200px',
              right: '-200px',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[100px]"
            style={{
              background: 'radial-gradient(circle, #3b82f6, transparent)',
              bottom: '-150px',
              left: '-150px',
              animation: 'float 10s ease-in-out infinite reverse',
            }}
          />
          <div
            className="absolute w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px]"
            style={{
              background: 'radial-gradient(circle, #8b5cf6, transparent)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'float 12s ease-in-out infinite',
            }}
          />
        </>
      )}

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Scan line effect */}
      {mounted && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6, 182, 212, 0.02) 2px, rgba(6, 182, 212, 0.02) 4px)',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
