import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import BusMap, { type RouteStop } from '../../components/BusMap';
import { Route as RouteIcon, MapPin } from 'lucide-react';

export default function MyRoute() {
  const { user } = useAuth();
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [pickup, setPickup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user?.email) return;
      const students = await apiGet<any[]>(`/api/students?email=${encodeURIComponent(user.email)}`);
      const st = students[0];
      if (!st) return setLoading(false);
      const [buses, routes, allStops] = await Promise.all([
        apiGet<any[]>('/api/buses'), apiGet<any[]>('/api/routes'), apiGet<any[]>('/api/stops'),
      ]);
      const b = buses.find((x) => x.id === st.assigned_bus_id);
      const r = routes.find((x) => x.id === b?.route_id);
      setRoute(r);
      const rs = allStops.filter((s) => s.route_id === r?.id).sort((a, b) => a.sequence - b.sequence);
      setStops(rs);
      setPickup(allStops.find((s) => s.id === st.pickup_stop_id));
      setLoading(false);
    })();
  }, [user?.email]);

  if (loading) return <div className="h-64 shimmer rounded-xl" />;
  if (!route) return <div className="bg-white dark:bg-ink-900 rounded-xl border p-8 text-center"><RouteIcon className="w-10 h-10 text-ink-400 mx-auto mb-2" /><div className="font-semibold">No route assigned</div></div>;

  const rs: RouteStop[] = stops.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, sequence: s.sequence }));
  const path: [number, number][] = rs.map((s) => [s.lat, s.lng]);

  return (
    <div>
      <PageHeader title="My Route" subtitle={`${route.name} · ${route.start_location} → ${route.end_location}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <BusMap stops={rs} routePath={path} height={480} />
        </div>
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
          <div className="font-semibold text-ink-900 dark:text-white mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Stops ({stops.length})</div>
          <ol className="space-y-2">
            {stops.map((s) => (
              <li key={s.id} className={`flex items-center gap-3 p-2 rounded ${pickup?.id === s.id ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900' : ''}`}>
                <span className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">{s.sequence}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-ink-900 dark:text-white">{s.name}</div>
                  <div className="text-[10px] font-mono text-ink-500">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</div>
                </div>
                {pickup?.id === s.id && <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Yours</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
