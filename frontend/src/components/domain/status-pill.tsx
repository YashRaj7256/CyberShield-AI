import * as React from 'react';
import { cn } from '@/lib/utils';

export type StatusPillVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusPillProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  variant?: StatusPillVariant;
  online?: boolean;
  pulse?: boolean;
}

const variantConfig: Record<
  StatusPillVariant,
  { dot: string; valueColor: string }
> = {
  success: {
    dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]',
    valueColor: 'text-slate-200',
  },
  warning: {
    dot: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]',
    valueColor: 'text-amber-300',
  },
  danger: {
    dot: 'bg-rose-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]',
    valueColor: 'text-rose-300',
  },
  info: {
    dot: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]',
    valueColor: 'text-cyan-300',
  },
  neutral: {
    dot: 'bg-slate-500',
    valueColor: 'text-slate-300',
  },
};

export function StatusPill({
  label,
  value,
  variant,
  online,
  pulse = false,
  className,
  ...props
}: StatusPillProps) {
  const resolvedVariant: StatusPillVariant =
    variant ?? (online !== undefined ? (online ? 'success' : 'danger') : 'neutral');

  const config = variantConfig[resolvedVariant];

  return (
    <div
      className={cn('inline-flex items-center gap-2 select-none', className)}
      {...props}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0 items-center justify-center">
        {pulse && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              config.dot.split(' ')[0]
            )}
          />
        )}
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dot)} />
      </span>
      <span className="text-[11px] font-mono text-slate-500">{label}:</span>
      <span className={cn('text-[11px] font-mono font-medium', config.valueColor)}>
        {value}
      </span>
    </div>
  );
}

export default StatusPill;
