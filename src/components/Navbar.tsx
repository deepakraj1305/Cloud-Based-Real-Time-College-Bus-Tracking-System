import { Menu, Moon, Sun, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenu }: { onMenu: () => void }) {
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-ink-900/80 backdrop-blur border-b border-ink-200 dark:border-ink-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="text-xs text-ink-500 uppercase tracking-widest">Welcome</div>
          <div className="font-semibold text-ink-900 dark:text-white truncate max-w-[45vw]">{profile?.full_name}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="relative p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-300"
          onClick={() => navigate(profile?.role === 'admin' ? '/admin/notifications' : profile?.role === 'student' ? '/student' : '/driver')}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-300"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-100 dark:bg-ink-800">
          <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">
            {profile?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-sm font-medium text-ink-800 dark:text-ink-200 capitalize">{profile?.role}</span>
        </div>
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-red-600"
          aria-label="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
