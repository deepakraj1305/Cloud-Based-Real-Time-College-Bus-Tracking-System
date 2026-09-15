import { useEffect, useMemo, useState } from 'react';
import { Bus, Route as RouteIcon, MapPin, Clock, Bell, Navigation, GraduationCap } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { btnPrimary } from '../../components/Field';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

function distanceKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [bus, setBus] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [pickup, setPickup] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    const students = await apiGet<any[]>(`/api/students?email=${encodeURIComponent(user.email)}`);
    const st = students[0];
    setStudent(st);
    if (st) {
      const [buses, routes, allStops, locs, ns] = await Promise.all([
        apiGet<any[]>('/api/buses'),
        apiGet<any[]>('/api/routes'),
        apiGet<any[]>('/api/stops'),
        apiGet<any[]>('/api/bus-locations'),
        apiGet<any[]>('/api/notifications?role=student'),
      ]);
      const b = buses.find((x) => x.id === st.assigned_bus_id);
      setBus(b);
      const r = routes.find((x) => x.id === b?.route_id);
      setRoute(r);
      setStops(allStops.filter((s) => s.route_id === r?.id).sort((a, b) => a.sequence - b.sequence));
      setPickup(allStops.find((s) => s.id === st.pickup_stop_id));
      setLocation(locs.find((l) => l.bus_id === b?.id));
      setNotifs(ns);
    }
    setLoading(false);
  };
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); /* eslint-disable-next-line */ }, [user?.email]);

  const eta = useMemo(() => {
    if (!location || !pickup) return null;
    const d = distanceKm([location.lat, location.lng], [pickup.lat, pickup.lng]);
    const speed = Math.max(location.speed || 25, 15);
    return Math.max(1, Math.round((d / speed) * 60));
  }, [location, pickup]);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-xl shimmer" />)}</div>;

  return (
    <div>
      <PageHeader
        title="Student Dashboard"
        subtitle={student ? `Hi ${student.name}, here’s your commute today.` : 'Student profile not linked.'}
        actions={<Link to="/student/tracking" className={btnPrimary}><Navigation className="w-4 h-4" /> Live map</Link>}
      />

      {!student ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-8 text-center">
          <GraduationCap className="w-10 h-10 mx-auto text-ink-400 mb-2" />
          <div className="font-semibold">No student profile linked to {user?.email}</div>
          <div className="text-sm text-ink-500 mt-1">Ask the admin to create a student record with this email.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center"><Bus className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs uppercase text-ink-500 tracking-widest">Assigned bus</div>
                  <div className="font-semibold text-ink-900 dark:text-white">{bus?.bus_number || 'None'}</div>
                </div>
              </div>
              {bus && <div className="mt-2 text-xs text-ink-500">{bus.model} · Cap {bus.capacity}</div>}
            </div>
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center"><RouteIcon className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs uppercase text-ink-500 tracking-widest">Route</div>
                  <div className="font-semibold text-ink-900 dark:text-white">{route?.name || 'None'}</div>
                </div>
              </div>
              {route && <div className="mt-2 text-xs text-ink-500">{route.distance_km} km · {route.duration_min} min</div>}
            </div>
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs uppercase text-ink-500 tracking-widest">Pickup stop</div>
                  <div className="font-semibold text-ink-900 dark:text-white">{pickup?.name || 'Not set'}</div>
                </div>
              </div>
              {pickup && <div className="mt-2 text-xs text-ink-500 font-mono">Stop #{pickup.sequence}</div>}
            </div>
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs uppercase text-ink-500 tracking-widest">ETA to pickup</div>
                  <div className="font-semibold text-ink-900 dark:text-white">{eta ? `${eta} min` : '—'}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-ink-500">{location ? <>Bus status: <StatusBadge status={location.status || 'active'} /></> : 'Waiting for signal'}</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bus status card */}
            <div className="lg:col-span-2 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="font-semibold text-ink-900 dark:text-white mb-3">Bus status</div>
              {location ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg bg-ink-50 dark:bg-ink-800/40 p-3"><div className="text-[10px] uppercase text-ink-500">Location</div><div className="font-mono text-xs mt-1">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</div></div>
                  <div className="rounded-lg bg-ink-50 dark:bg-ink-800/40 p-3"><div className="text-[10px] uppercase text-ink-500">Speed</div><div className="font-semibold mt-1">{location.speed || 0} km/h</div></div>
                  <div className="rounded-lg bg-ink-50 dark:bg-ink-800/40 p-3"><div className="text-[10px] uppercase text-ink-500">Heading</div><div className="font-semibold mt-1">{location.heading || 0}°</div></div>
                  <div className="rounded-lg bg-ink-50 dark:bg-ink-800/40 p-3"><div className="text-[10px] uppercase text-ink-500">Updated</div><div className="text-xs mt-1">{new Date(location.updated_at).toLocaleTimeString()}</div></div>
                </div>
              ) : (
                <div className="text-sm text-ink-500 py-6 text-center">No live position yet. Ask the driver to start a trip, or start the demo from the tracking page.</div>
              )}
              <div className="mt-4">
                <div className="text-xs uppercase text-ink-500 tracking-widest mb-2">All stops on this route</div>
                <ol className="grid sm:grid-cols-2 gap-2">
                  {stops.map((s) => (
                    <li key={s.id} className={`flex items-center gap-2 text-sm p-2 rounded ${pickup?.id === s.id ? 'bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900' : ''}`}>
                      <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center justify-center">{s.sequence}</span>
                      <span className="truncate">{s.name}{pickup?.id === s.id && <span className="ml-2 text-[10px] text-brand-600">YOUR STOP</span>}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="font-semibold text-ink-900 dark:text-white mb-3 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</div>
              {notifs.length === 0 ? (
                <div className="text-sm text-ink-500">No announcements.</div>
              ) : (
                <div className="space-y-3">
                  {notifs.slice(0, 6).map((n) => (
                    <div key={n.id} className="border-l-2 border-brand-500 pl-3">
                      <div className="font-medium text-sm text-ink-900 dark:text-white">{n.title}</div>
                      <div className="text-xs text-ink-600 dark:text-ink-400">{n.message}</div>
                      <div className="text-[10px] text-ink-400">{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
