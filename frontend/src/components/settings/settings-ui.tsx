'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save, Check } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
 * SectionCard: 3-zone standard container
 * ───────────────────────────────────────────────────────────── */
interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function SectionCard({ children, className, id }: SectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        'w-full min-w-0 rounded-[14px] border border-[var(--border)] bg-[var(--surface-1)] overflow-hidden transition-colors',
        className
      )}
    >
      {children}
    </section>
  );
}

interface SectionCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  tag?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionCardHeader({
  title,
  subtitle,
  icon,
  tag,
  action,
  className,
}: SectionCardHeaderProps) {
  return (
    <div
      className={cn(
        'px-6 py-5 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4',
        className
      )}
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {icon && <div className="shrink-0">{icon}</div>}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight leading-tight">
              {title}
            </h2>
            {tag && (
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-normal shrink-0">
                {tag}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[13px] text-slate-400 mt-1 leading-normal truncate sm:whitespace-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0 self-start sm:self-center">{action}</div>}
    </div>
  );
}

interface SectionCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCardBody({ children, className }: SectionCardBodyProps) {
  return (
    <div className={cn('px-6 py-5 min-w-0 overflow-visible', className)}>
      {children}
    </div>
  );
}

interface SectionCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionCardFooter({ children, className }: SectionCardFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-5 border-t border-[var(--border)] flex items-center justify-end gap-3 bg-white/[0.01] min-w-0',
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * FormField: standard form field wrapper & styled input
 * ───────────────────────────────────────────────────────────── */
interface FormFieldProps {
  id?: string;
  label: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  required,
  helperText,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col min-w-0 overflow-visible', className)}>
      <label
        htmlFor={id}
        className="text-[11px] font-mono uppercase tracking-[0.1em] text-slate-400 mb-2 flex items-center gap-1 select-none min-w-0"
      >
        <span className="truncate">{label}</span>
        {required && <span className="text-[var(--accent)] font-bold shrink-0">*</span>}
      </label>
      <div className="min-w-0 overflow-visible">
        {children}
      </div>
      {error ? (
        <p className="text-xs text-[var(--danger)] mt-1.5 leading-normal font-sans min-w-0">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 mt-1.5 leading-normal font-sans min-w-0">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * InfoTile: Read-only metadata tile with safe fallback
 * ───────────────────────────────────────────────────────────── */
interface InfoTileProps {
  label: string;
  value?: React.ReactNode;
  icon?: React.ReactNode;
  fallback?: string;
  className?: string;
}

export function InfoTile({
  label,
  value,
  icon,
  fallback = '—',
  className,
}: InfoTileProps) {
  const displayValue = value === null || value === undefined || value === '' ? fallback : value;

  return (
    <div
      className={cn(
        'rounded-[10px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3.5 flex flex-col justify-between gap-1.5 min-w-0 transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase tracking-wider min-w-0">
        <span className="truncate min-w-0 flex-1">{label}</span>
        {icon && <span className="shrink-0 text-slate-400 ml-2">{icon}</span>}
      </div>
      <div className="text-sm font-medium text-slate-200 truncate min-w-0">
        {displayValue}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * StickyActionBar: Layer 4 sticky bottom action container
 * ───────────────────────────────────────────────────────────── */
interface StickyActionBarProps {
  isDirty?: boolean;
  statusText?: string;
  isLoading?: boolean;
  loadingText?: string;
  submitText?: string;
  submitDisabled?: boolean;
  formId?: string;
  onDiscard?: () => void;
  onSubmit?: (e?: React.FormEvent) => void;
  className?: string;
}

export function StickyActionBar({
  isDirty,
  statusText,
  isLoading = false,
  loadingText = 'Saving Changes...',
  submitText = 'Save Changes',
  submitDisabled = false,
  formId,
  onDiscard,
  onSubmit,
  className,
}: StickyActionBarProps) {
  const computedStatus =
    statusText !== undefined
      ? statusText
      : isDirty !== undefined
      ? isDirty
        ? 'You have unsaved changes'
        : 'All changes saved'
      : '';

  return (
    <div
      className={cn(
        'sticky bottom-4 z-20 w-full min-w-0 flex items-center justify-between gap-4 py-3 px-4 rounded-xl border border-[var(--border)] bg-[#0d1117]/85 backdrop-blur-xl shadow-lg mt-6',
        className
      )}
      style={{
        padding: '12px 16px',
      }}
    >
      <div className="min-w-0 flex-1 flex items-center gap-2 text-xs font-mono">
        {computedStatus ? (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] min-w-0">
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0',
                isDirty ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
              )}
            />
            <span className={cn('truncate text-xs font-medium', isDirty ? 'text-amber-300' : 'text-slate-300')}>
              {computedStatus}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-xs font-mono truncate">SOC Platform Settings</span>
        )}
      </div>

      <div className="flex items-center gap-2.5 shrink-0 m-0">
        {onDiscard && isDirty && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDiscard}
            disabled={isLoading}
            className="h-10 px-4 text-xs font-sans font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-[10px] cursor-pointer transition-colors m-0"
            style={{ height: '40px', margin: 0 }}
          >
            Discard
          </Button>
        )}

        <Button
          type="submit"
          form={formId}
          onClick={onSubmit}
          disabled={submitDisabled || isLoading}
          className="h-10 px-5 text-[13px] font-sans font-semibold tracking-wide rounded-[10px] bg-gradient-to-r from-cyan-400 to-[#22D3EE] hover:from-cyan-300 hover:to-cyan-400 text-slate-950 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_0_18px_rgba(34,211,238,0.3)] hover:shadow-[0_1px_4px_rgba(0,0,0,0.4),0_0_24px_rgba(34,211,238,0.45)] active:scale-[0.98] flex items-center gap-2 cursor-pointer transition-all antialiased disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none m-0"
          style={{
            height: '40px',
            margin: 0,
          }}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950 shrink-0" />
              <span className="font-medium tracking-normal">{loadingText}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="font-semibold tracking-[0.02em]">{submitText}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Input classes helper adhering to Section 2 and Section 3
 * ───────────────────────────────────────────────────────────── */
export const settingsInputClasses = cn(
  'settings-input h-[44px] min-h-[44px] px-[14px] py-0 text-[14px] leading-[44px] box-border rounded-[10px] bg-[var(--surface-2)] border border-[var(--border)] text-slate-100 placeholder:text-slate-500 w-full transition-colors',
  'hover:border-[var(--border-strong)]',
  'focus:outline-none focus:border-[var(--accent)]/50 focus:ring-[3px] focus:ring-[rgba(34,211,238,0.15)]',
  'focus-visible:outline-none focus-visible:border-[var(--accent)]/50 focus-visible:ring-[3px] focus-visible:ring-[rgba(34,211,238,0.15)]',
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-white/[0.02]'
);

/* ─────────────────────────────────────────────────────────────
 * SettingsInput: Standardized presentational input component
 * ───────────────────────────────────────────────────────────── */
export interface SettingsInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const SettingsInput = React.forwardRef<HTMLInputElement, SettingsInputProps>(
  ({ className, style, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          settingsInputClasses,
          error && 'border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[rgba(244,63,94,0.15)] focus-visible:ring-[rgba(244,63,94,0.15)]',
          className
        )}
        style={{
          height: '44px',
          minHeight: '44px',
          padding: '0 14px',
          lineHeight: '44px',
          fontSize: '14px',
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      />
    );
  }
);
SettingsInput.displayName = 'SettingsInput';
