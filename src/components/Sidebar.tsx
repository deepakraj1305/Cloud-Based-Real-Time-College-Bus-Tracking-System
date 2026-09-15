import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Bus, UserCog, GraduationCap, Route, CalendarClock,
  MapPin, Bell, ShieldAlert, BarChart3, Navigation, MapPinned
} from 'lucide-react';
import { useAuth, type Role } from '../contexts/AuthContext';

type Item = { to: string; label: string; icon: any };

const adminNav: Item[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/buses', label: 'Buses', icon: Bus },
  { to: '/admin/drivers', label: 'Drivers', icon: UserCog },
  { to: '/admin/students', label: 'Students', icon: GraduationCap },
  { to: '/admin/routes', label: 'Routes', icon: Route },
  { to: '/admin/trips', label: 'Trips', icon: CalendarClock },
  { to: '/admin/tracking', label: 'Live Tracking', icon: MapPin },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/alerts', label: 'Emergency Alerts', icon: ShieldAlert },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

const driverNav: Item[] = [
  { to: '/driver', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/driver/tracking', label: 'Live Tracking', icon: Navigation },
];

const studentNav: Item[] = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/bus', label: 'My Bus', icon: Bus },
  { to: '/student/route', label: 'My Route', icon: MapPinned },
  { to: '/student/tracking', label: 'Live Tracking', icon: MapPin },
];

function navFor(role: Role): Item[] {
  if (role === 'admin') return adminNav;
  if (role === 'driver') return driverNav;
  return studentNav;
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { profile } = useAuth();
  const items = profile ? navFor(profile.role) : [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-white dark:bg-ink-900 border-r border-ink-200 dark:border-ink-800 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-ink-200 dark:border-ink-800">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-600 to-brand-900 flex items-center justify-center text-white shadow-md">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-ink-900 dark:text-white tracking-tight">CampusTransit</div>
            <div className="text-[10px] uppercase tracking-widest text-ink-500">Cloud Bus System</div>
          </div>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin' || to === '/driver' || to === '/student'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}

          <div className="pt-6 mt-6 border-t border-ink-200 dark:border-ink-800">
            <div className="px-3 text-[10px] uppercase font-semibold tracking-widest text-ink-500 mb-2">Signed in as</div>
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-ink-900 dark:text-white truncate">{profile?.full_name}</div>
              <div className="text-xs text-ink-500 capitalize">{profile?.role}</div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
