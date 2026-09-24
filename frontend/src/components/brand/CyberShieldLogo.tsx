import Image from 'next/image';

/**
 * CyberShieldLogo
 *
 * variant="icon"  → icon-only shield mark (square layout, good for sidebars/favicons)
 * variant="full"  → full wordmark: icon + "CyberShield AI" text
 *
 * Use `size` to control the height in pixels (width scales proportionally via aspect-ratio).
 */

interface CyberShieldLogoProps {
  /** Which logo asset to render */
  variant?: 'icon' | 'full';
  /** Rendered height in px (width auto-scales). Default: 44 */
  size?: number;
  /** Explicit width in px (height auto-scales to preserve aspect ratio) */
  width?: number;
  /** Extra className applied to the root element */
  className?: string;
}

// Aspect ratios based on new official CyberShield AI logo assets
// icon crop: 244 × 281 ≈ 0.8683
// full crop: 653 × 156 ≈ 4.1859
const ICON_ASPECT = 244 / 281;
const FULL_ASPECT = 653 / 156;

export default function CyberShieldLogo({
  variant = 'full',
  size = 44,
  width: explicitWidth,
  className = '',
}: CyberShieldLogoProps) {
  const isIcon = variant === 'icon';
  const aspectRatio = isIcon ? ICON_ASPECT : FULL_ASPECT;

  const renderedWidth =
    explicitWidth != null ? explicitWidth : Math.round(size * aspectRatio);
  const renderedHeight =
    explicitWidth != null ? Math.round(explicitWidth / aspectRatio) : size;

  return (
    <Image
      src={isIcon ? '/cybershield-ai-icon.png' : '/cybershield-ai-logo.png'}
      alt={isIcon ? 'CyberShield AI mark' : 'CyberShield AI'}
      width={renderedWidth}
      height={renderedHeight}
      priority
      draggable={false}
      className={`select-none ${className}`}
      style={{
        width: renderedWidth,
        height: renderedHeight,
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  );
}
