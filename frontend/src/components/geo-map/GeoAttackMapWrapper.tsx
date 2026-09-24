'use client';

import dynamic from 'next/dynamic';
import type { GeoAttackMapHandle } from './GeoAttackMap';
import type { GeoAttackOrigin } from '@/types';
import { forwardRef } from 'react';

/**
 * SSR-safe wrapper for GeoAttackMap.
 * Leaflet requires `window` / DOM APIs so it must only render on the client.
 */
const LazyMap = dynamic(() => import('./GeoAttackMap'), {
  ssr: false,
  loading: () => (
    <div
      className="animate-shimmer"
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 12,
        background: 'rgba(11, 15, 25, 0.92)',
        border: '1px solid rgba(30, 41, 59, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: '#64748b', fontSize: 12 }}>Loading map engine…</span>
    </div>
  ),
});

interface GeoAttackMapWrapperProps {
  origins: GeoAttackOrigin[];
  filteredOrigins?: GeoAttackOrigin[];
}

const GeoAttackMapWrapper = forwardRef<GeoAttackMapHandle, GeoAttackMapWrapperProps>(
  function GeoAttackMapWrapper(props, ref) {
    return <LazyMap ref={ref} {...props} />;
  },
);

export default GeoAttackMapWrapper;
