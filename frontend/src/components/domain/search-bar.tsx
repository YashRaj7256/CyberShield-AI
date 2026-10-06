'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Search...',
      className,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClear = () => {
      onChange('');
      onClear?.();
    };

    return (
      <div
        className={cn(
          'flex h-11 items-center gap-3 rounded-xl border border-white/[0.07] bg-[rgba(13,17,23,0.92)] px-4 transition-colors duration-150',
          'focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/30',
          disabled && 'opacity-40 pointer-events-none',
          containerClassName
        )}
      >
        <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 bg-transparent text-[12px] font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none',
            className
          )}
          {...props}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-500 transition-colors hover:text-slate-300 hover:bg-white/[0.04] focus:outline-none focus:ring-1 focus:ring-cyan-500/40 cursor-pointer"
            aria-label="Clear search input"
          >
            <span className="hidden sm:inline">Clear</span>
            <X className="h-3 w-3 sm:hidden" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
