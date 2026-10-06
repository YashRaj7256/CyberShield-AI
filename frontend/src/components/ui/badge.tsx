import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-semibold font-mono uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]',
  {
    variants: {
      variant: {
        default:
          'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
        secondary:
          'bg-white/[0.04] text-slate-300 border border-white/[0.08]',
        outline:
          'text-slate-300 border border-white/[0.12] bg-transparent',
        destructive:
          'bg-red-500/15 text-red-400 border border-red-500/30',
        critical:
          'bg-red-500/15 text-red-400 border border-red-500/30',
        high:
          'bg-orange-500/15 text-orange-400 border border-orange-500/30',
        warning:
          'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        medium:
          'bg-amber-500/15 text-amber-400 border border-amber-500/30',
        success:
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        low:
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        info:
          'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30',
      },
      pill: {
        true: 'rounded-full px-3',
        false: 'rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      pill: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, pill, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, pill }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
