import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold font-mono uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        secondary:
          'border-transparent bg-slate-800 text-slate-300 border border-slate-700/50',
        destructive:
          'border-transparent bg-red-500/15 text-red-400 border border-red-500/30',
        warning:
          'border-transparent bg-amber-500/15 text-amber-400 border border-amber-500/30',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
        outline: 'text-slate-300 border border-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
