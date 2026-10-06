'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-lg border border-white/[0.14] bg-white/[0.03] transition-all duration-150 cursor-pointer select-none',
      'hover:border-white/[0.25] hover:bg-white/[0.06]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]',
      'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/[0.14] disabled:hover:bg-white/[0.03]',
      'data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-400 data-[state=checked]:text-slate-950 data-[state=checked]:shadow-[0_0_8px_rgba(6,182,212,0.2)]',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <Check className="h-3 w-3 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
