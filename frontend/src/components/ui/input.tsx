import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 placeholder:text-slate-500 transition-colors duration-150 file:border-0 file:bg-transparent file:text-xs file:font-medium hover:border-white/[0.14] focus-visible:outline-none focus-visible:border-cyan-500/50 focus-visible:ring-1 focus-visible:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.08] read-only:cursor-default read-only:bg-white/[0.01] read-only:hover:border-white/[0.08] aria-invalid:border-red-500/50 aria-invalid:focus-visible:border-red-500/60 aria-invalid:focus-visible:ring-red-500/30',
  {
    variants: {
      sizeVariant: {
        default: 'h-10 px-3.5 py-2',
        compact: 'h-[34px] px-3 py-1',
      },
    },
    defaultVariants: {
      sizeVariant: 'default',
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', sizeVariant, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={error || props['aria-invalid']}
        className={cn(inputVariants({ sizeVariant }), className)}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
