import { Link } from 'react-router-dom';
import { Bus, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white dark:from-ink-950 dark:to-ink-900 p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white mx-auto flex items-center justify-center shadow-lg mb-5">
          <Bus className="w-7 h-7" />
        </div>
        <div className="text-7xl font-bold text-ink-900 dark:text-white tracking-tight">404</div>
        <div className="text-lg font-semibold text-ink-800 dark:text-ink-200 mt-3">This stop is off the route.</div>
        <p className="text-ink-500 mt-2">The page you’re looking for doesn’t exist or has moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Return home
        </Link>
      </div>
    </div>
  );
}
