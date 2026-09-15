import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { apiGet } from '../../lib/api';
import { Bus, Users, UserCog, CalendarClock, ShieldAlert, TrendingUp } from 'lucide-react';
import StatCard from '../../components/StatCard';

interface Trip { id: number; bus_id: number; route_id: number; trip_date: string; status: string; }

export default function Reports() {
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiGet('/api/buses'), apiGet('/api/drivers'), apiGet('/api/students'),
      apiGet('/api/routes'), apiGet('/api/trips'), apiGet('/api/emergency-alerts'),
    ]).then(([b, d, s, r, t, a]) => {
      setBuses(b as any); setDrivers(d as any); setStudents(s as any);
      setRoutes(r as any); setTrips(t as Trip[]); setAlerts(a as any);
    });
  }, []);

  // Trips per route
  const tripsPerRoute = useMemo(() => {
    return routes.map((r) => ({
      name: r.name,
      count: trips.filter((t) => t.route_id === r.id).length,
      color: r.color || '#2563eb',
    }));
  }, [routes, trips]);

  // Trips over last 7 days
  const last7 = useMemo(() => {
    const out: { label: string; date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      out.push({ label, date: key, count: trips.filter((t) => t.trip_date === key).length });
    }
    return out;
  }, [trips]);

  const maxRouteCount = Math.max(1, ...tripsPerRoute.map((x) => x.count));
  const max7 = Math.max(1, ...last7.map((x) => x.count));

  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="System-wide performance and utilization summary." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Buses" value={buses.length} icon={Bus} accent="brand" />
        <StatCard label="Drivers" value={drivers.length} icon={UserCog} accent="green" />
        <StatCard label="Students" value={students.length} icon={Users} accent="purple" />
        <StatCard label="Total Trips" value={trips.length} icon={CalendarClock} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trips per route */}
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-brand-600" />
            <div className="font-semibold text-ink-900 dark:text-white">Trips per route</div>
          </div>
          <div className="space-y-3">
            {tripsPerRoute.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                    <span className="text-ink-700 dark:text-ink-300">{r.name}</span>
                  </div>
                  <span className="font-mono text-ink-500">{r.count}</span>
                </div>
                <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(r.count / maxRouteCount) * 100}%`, background: r.color }} />
                </div>
              </div>
            ))}
            {tripsPerRoute.length === 0 && <div className="text-sm text-ink-500 py-4 text-center">No data yet.</div>}
          </div>
        </div>

        {/* Trips last 7 days */}
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="w-4 h-4 text-brand-600" />
            <div className="font-semibold text-ink-900 dark:text-white">Trips — last 7 days</div>
          </div>
          <div className="flex items-end gap-2 h-40">
            {last7.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex-1 flex items-end">
                  <div className="w-full rounded-t bg-gradient-to-t from-brand-700 to-brand-400" style={{ height: `${(d.count / max7) * 100}%`, minHeight: 2 }} title={`${d.count} trip(s)`} />
                </div>
                <div className="text-[10px] text-ink-500 font-medium">{d.label}</div>
                <div className="text-[10px] font-mono text-ink-400">{d.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bus status */}
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bus className="w-4 h-4 text-brand-600" />
            <div className="font-semibold text-ink-900 dark:text-white">Bus status breakdown</div>
          </div>
          <div className="space-y-3">
            {['active', 'inactive', 'maintenance'].map((s) => {
              const c = buses.filter((b) => b.status === s).length;
              const pct = buses.length ? (c / buses.length) * 100 : 0;
              const color = s === 'active' ? '#10b981' : s === 'maintenance' ? '#f59e0b' : '#94a3b8';
              return (
                <div key={s}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-ink-700 dark:text-ink-300">{s}</span>
                    <span className="font-mono text-ink-500">{c} · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-4 h-4 text-brand-600" />
            <div className="font-semibold text-ink-900 dark:text-white">Emergency alerts</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4">
              <div className="text-3xl font-bold text-red-700 dark:text-red-300">{alerts.filter((a) => a.status === 'active').length}</div>
              <div className="text-xs text-red-700/70 dark:text-red-300/70 uppercase tracking-widest">Active</div>
            </div>
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950 p-4">
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{alerts.filter((a) => a.status === 'resolved').length}</div>
              <div className="text-xs text-emerald-700/70 dark:text-emerald-300/70 uppercase tracking-widest">Resolved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
