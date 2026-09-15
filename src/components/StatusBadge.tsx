export default function StatusBadge({ status }: { status?: string | null }) {
  const s = (status || 'unknown').toLowerCase();
  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    inactive: 'bg-ink-200 text-ink-700 dark:bg-ink-800 dark:text-ink-300',
    maintenance: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    scheduled: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    in_progress: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    running: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    on_duty: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    off_duty: 'bg-ink-200 text-ink-700 dark:bg-ink-800 dark:text-ink-300',
    unknown: 'bg-ink-200 text-ink-700 dark:bg-ink-800 dark:text-ink-300',
  };
  const label = s.replace(/_/g, ' ');
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[s] || styles.unknown}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
