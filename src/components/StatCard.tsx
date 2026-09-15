import type { LucideIcon } from 'lucide-react';

export default function StatCard({
  label, value, icon: Icon, accent = 'brand', hint,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: 'brand' | 'green' | 'amber' | 'red' | 'purple';
  hint?: string;
}) {
  const map: Record<string, string> = {
    brand: 'from-brand-500 to-brand-700',
    green: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-700',
    red: 'from-red-500 to-red-700',
    purple: 'from-purple-500 to-purple-700',
  };
  return (
    <div className="relative overflow-hidden rounded-xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 p-5 shadow-sm">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${map[accent]} opacity-10`} />
      <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${map[accent]} text-white flex items-center justify-center shadow`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight text-ink-900 dark:text-white">{value}</div>
      <div className="text-sm text-ink-500 mt-0.5">{label}</div>
      {hint && <div className="text-xs text-ink-400 mt-2">{hint}</div>}
    </div>
  );
}
