import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export default function Modal({
  open, onClose, title, children, size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!open) return null;
  const w = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-md';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full ${w} bg-white dark:bg-ink-900 rounded-xl shadow-2xl border border-ink-200 dark:border-ink-800 max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-ink-200 dark:border-ink-800">
          <h3 className="font-semibold text-lg text-ink-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
