import type { ReactNode } from 'react';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-600 dark:text-ink-400 mb-1.5 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'w-full px-3 py-2 rounded-lg bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-sm text-ink-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent';

export const btnPrimary =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed';

export const btnSecondary =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-800 dark:text-ink-200 font-medium text-sm transition';

export const btnDanger =
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-700 dark:text-red-300 font-medium text-sm transition';

export const btnGhost =
  'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-300 font-medium text-sm transition';
