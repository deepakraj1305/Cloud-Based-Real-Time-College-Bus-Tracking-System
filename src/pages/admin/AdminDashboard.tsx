import { useEffect, useState } from 'react';
import { Bus, Users, UserCog, Route as RouteIcon, MapPin, ShieldAlert, CalendarClock, Activity } from 'lucide-react';
import StatCard from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { apiGet } from '../../lib/api';
import StatusBadge from '../../components/StatusBadge';
import { Link } from 'react-router-dom';

interface Stats {
  total_buses: number;
  active_buses: number;
  total_students: number;
  total_drivers: number;
  total_routes: number;
  trips_today: number;
  active_trips: number;
  total_trips: number;
  active_alerts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [buses, setBuses] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [s, b, t, r] = await Promise.all([
        apiGet<Stats>('/api/stats'),
        apiGet<any[]>('/api/buses'),
        apiGet<any[]>('/api/trips?today=1'),
        apiGet<any[]>('/api/routes'),
      ]);
      setStats(s);
      setBuses(b);
      setTrips(t);
      setRoutes(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const routeById = (id?: number) => routes.find((r) => r.id === id)?.name || '—';
  const busById = (id?: number) => buses.find((b) => b.id === id)?.bus_number || '—';

  return (
    <div>
      <PageHeader
        title="Admin Overview"
        subtitle="Fleet-wide status of buses, drivers, students and trips."
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl shimmer" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Buses" value={stats.total_buses} icon={Bus} accent="brand" hint={`${stats.active_buses} active`} />
            <StatCard label="Total Students" value={stats.total_students} icon={Users} accent="purple" />
            <StatCard label="Total Drivers" value={stats.total_drivers} icon={UserCog} accent="green" />
            <StatCard label="Total Routes" value={stats.total_routes} icon={RouteIcon} accent="amber" />
            <StatCard label="Trips Today" value={stats.trips_today} icon={CalendarClock} accent="brand" hint={`${stats.active_trips} in progress`} />
            <StatCard label="All-time Trips" value={stats.total_trips} icon={Activity} accent="purple" />
            <StatCard label="Active Alerts" value={stats.active_alerts} icon={ShieldAlert} accent={stats.active_alerts > 0 ? 'red' : 'green'} />
            <StatCard label="Live Map" value={<Link to="/admin/tracking" className="text-brand-600">Open →</Link> as any} icon={MapPin} accent="brand" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <div className="lg:col-span-2 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-semibold text-ink-900 dark:text-white">Today’s Trips</div>
                  <div className="text-xs text-ink-500">Live snapshot of trips scheduled for today.</div>
                </div>
                <Link to="/admin/trips" className="text-sm text-brand-600 hover:underline">Manage →</Link>
              </div>
              {trips.length === 0 ? (
                <div className="text-sm text-ink-500 py-8 text-center">No trips scheduled today. Add one from Trip Management.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-ink-500 border-b border-ink-200 dark:border-ink-800">
                        <th className="py-2 font-medium">Trip #</th>
                        <th className="py-2 font-medium">Bus</th>
                        <th className="py-2 font-medium">Route</th>
                        <th className="py-2 font-medium">Start</th>
                        <th className="py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trips.slice(0, 8).map((t) => (
                        <tr key={t.id} className="border-b border-ink-100 dark:border-ink-800/60">
                          <td className="py-2 font-mono text-ink-800 dark:text-ink-200">#{t.id}</td>
                          <td className="py-2">{busById(t.bus_id)}</td>
                          <td className="py-2">{routeById(t.route_id)}</td>
                          <td className="py-2 text-ink-500">{t.start_time || '—'}</td>
                          <td className="py-2"><StatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="font-semibold text-ink-900 dark:text-white mb-1">Fleet Status</div>
              <div className="text-xs text-ink-500 mb-4">Distribution of bus states.</div>
              {(() => {
                const total = buses.length || 1;
                const groups = ['active', 'inactive', 'maintenance'];
                const counts = groups.map((g) => buses.filter((b) => b.status === g).length);
                const colors = ['bg-emerald-500', 'bg-ink-400', 'bg-amber-500'];
                return (
                  <>
                    <div className="h-3 rounded-full overflow-hidden flex bg-ink-100 dark:bg-ink-800">
                      {counts.map((c, i) => (
                        <div key={i} className={colors[i]} style={{ width: `${(c / total) * 100}%` }} />
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      {groups.map((g, i) => (
                        <div key={g} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${colors[i]}`} />
                            <span className="capitalize text-ink-700 dark:text-ink-300">{g}</span>
                          </div>
                          <span className="font-mono text-ink-500">{counts[i]}</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </>
      ) : (
        <div className="text-ink-500">Failed to load stats.</div>
      )}
    </div>
  );
}
