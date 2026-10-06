import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-mono font-medium transition-all duration-150 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
        secondary:
          'bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:border-white/[0.14] hover:text-white',
        outline:
          'border border-white/[0.12] bg-transparent text-slate-300 hover:bg-white/[0.04] hover:border-white/[0.2] hover:text-white',
        destructive:
          'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:border-red-500/50 hover:text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
        ghost:
          'border border-transparent text-slate-400 hover:bg-white/[0.05] hover:text-slate-200',
        link:
          'text-cyan-400 underline-offset-4 hover:underline border-transparent p-0 h-auto font-normal',
      },
      size: {
        default: 'h-10 px-4 py-2 gap-2',
        sm: 'h-[34px] px-3 py-1.5 gap-1.5 text-[11px]',
        lg: 'h-11 px-5 py-2.5 gap-2 text-sm',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-[34px] w-[34px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
