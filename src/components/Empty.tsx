import type { LucideIcon } from 'lucide-react';

export default function Empty({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-ink-400" />
      </div>
      <div className="font-semibold text-ink-800 dark:text-ink-200">{title}</div>
      {hint && <div className="text-sm text-ink-500 mt-1 max-w-sm">{hint}</div>}
    </div>
  );
}
