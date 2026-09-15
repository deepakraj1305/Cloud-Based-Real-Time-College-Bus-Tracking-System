import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth, type Role } from '../contexts/AuthContext';

export default function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow?: Role[];
}) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-ink-500">Loading CampusTransit…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (allow && profile && !allow.includes(profile.role)) {
    const home =
      profile.role === 'admin' ? '/admin' : profile.role === 'driver' ? '/driver' : '/student';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
