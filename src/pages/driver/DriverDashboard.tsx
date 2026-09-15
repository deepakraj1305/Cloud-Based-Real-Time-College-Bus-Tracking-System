import { useEffect, useMemo, useState } from 'react';
import { Bus, Route as RouteIcon, MapPin, Play, Square, ShieldAlert, Bell, CalendarClock, User } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { btnPrimary, btnSecondary, btnDanger } from '../../components/Field';
import { apiGet, apiPost, apiPut } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function DriverDashboard() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<any>(null);
  const [bus, setBus] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    const drivers = await apiGet<any[]>(`/api/drivers?email=${encodeURIComponent(user.email)}`);
    const dr = drivers[0];
    setDriver(dr);
    if (dr) {
      const [buses, routes, allStops, allTrips, ns] = await Promise.all([
        apiGet<any[]>('/api/buses'),
        apiGet<any[]>('/api/routes'),
        apiGet<any[]>('/api/stops'),
        apiGet<any[]>(`/api/trips?driver_id=${dr.id}`),
        apiGet<any[]>('/api/notifications?role=driver'),
      ]);
      const b = buses.find((x) => x.id === dr.assigned_bus_id) || buses.find((x) => x.driver_email === dr.email);
      setBus(b);
      const r = routes.find((x) => x.id === b?.route_id);
      setRoute(r);
      setStops(allStops.filter((s) => s.route_id === r?.id).sort((a, b) => a.sequence - b.sequence));
      setTrips(allTrips);
      setNotifs(ns);
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.email]);

  const today = new Date().toISOString().slice(0, 10);
  const todaysTrip = useMemo(() => trips.find((t) => t.trip_date === today), [trips]);

  const startTrip = async () => {
    if (!driver || !bus || !route) return alert('Missing bus/route assignment.');
    const t = todaysTrip;
    if (t) {
      await apiPut('/api/trips', { id: t.id, status: 'in_progress' });
    } else {
      await apiPost('/api/trips', {
        bus_id: bus.id, route_id: route.id, driver_id: driver.id,
        trip_date: today, start_time: new Date().toTimeString().slice(0, 5),
        status: 'in_progress',
      });
    }
    load();
  };

  const endTrip = async () => {
    if (!todaysTrip) return;
    await apiPut('/api/trips', {
      id: todaysTrip.id,
      status: 'completed',
      end_time: new Date().toTimeString().slice(0, 5),
    });
    load();
  };

  const raiseAlert = async () => {
    if (!driver || !bus) return;
    const message = prompt('Describe the emergency briefly:');
    if (!message) return;
    await apiPost('/api/emergency-alerts', {
      bus_id: bus.id, driver_id: driver.id, message,
      location_lat: stops[0]?.lat, location_lng: stops[0]?.lng,
    });
    alert('Emergency alert sent to admin.');
  };

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-xl shimmer" />)}</div>;

  return (
    <div>
      <PageHeader
        title="Driver Dashboard"
        subtitle={driver ? `Hello, ${driver.name}` : 'Driver profile not linked.'}
        actions={
          <>
            <Link to="/driver/tracking" className={btnSecondary}><MapPin className="w-4 h-4" /> Live tracking</Link>
            <button className={btnDanger + ' !py-2 !px-4'} onClick={raiseAlert}><ShieldAlert className="w-4 h-4" /> Emergency</button>
          </>
        }
      />

      {!driver ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-8 text-center">
          <User className="w-10 h-10 mx-auto text-ink-400 mb-2" />
          <div className="font-semibold">No driver profile linked to {user?.email}</div>
          <div className="text-sm text-ink-500 mt-1">Ask the admin to create a driver record with this email.</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Assigned bus */}
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-600 text-white flex items-center justify-center"><Bus className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs uppercase text-ink-500 tracking-widest">Assigned bus</div>
                  <div className="font-semibold text-ink-900 dark:text-white">{bus?.bus_number || 'Not assigned'}</div>
                </div>
              </div>
              {bus && <div className="text-xs text-ink-500">{bus.model} · Capacity {bus.capacity} · <StatusBadge status={bus.status} /></div>}
            </div>

            {/* Assigned route */}
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center"><RouteIcon className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs uppercase text-ink-500 tracking-widest">Assigned route</div>
                  <div className="font-semibold text-ink-900 dark:text-white">{route?.name || 'Not assigned'}</div>
                </div>
              </div>
              {route && <div className="text-xs text-ink-500">{route.start_location} → {route.end_location} · {route.distance_km} km · {route.duration_min} min</div>}
            </div>

            {/* Today's trip */}
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center"><CalendarClock className="w-5 h-5" /></div>
                <div>
                  <div className="text-xs uppercase text-ink-500 tracking-widest">Today’s trip</div>
                  <div className="font-semibold text-ink-900 dark:text-white">{todaysTrip ? `#${todaysTrip.id} · ${todaysTrip.start_time}` : 'No trip scheduled'}</div>
                </div>
              </div>
              {todaysTrip && <div className="text-xs text-ink-500"><StatusBadge status={todaysTrip.status} /></div>}
            </div>
          </div>

          {/* Trip actions */}
          <div className="mt-6 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="font-semibold text-ink-900 dark:text-white">Trip controls</div>
                <div className="text-sm text-ink-500">Start your shift when you begin driving; end when you park.</div>
              </div>
              <div className="flex gap-2">
                <button className={btnPrimary} onClick={startTrip} disabled={todaysTrip?.status === 'in_progress' || todaysTrip?.status === 'completed'}>
                  <Play className="w-4 h-4" /> Start Trip
                </button>
                <button className={btnSecondary} onClick={endTrip} disabled={!todaysTrip || todaysTrip.status !== 'in_progress'}>
                  <Square className="w-4 h-4" /> End Trip
                </button>
              </div>
            </div>
          </div>

          {/* Route stops */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="font-semibold text-ink-900 dark:text-white mb-3">Route stops</div>
              {stops.length === 0 ? (
                <div className="text-sm text-ink-500">No stops in this route yet.</div>
              ) : (
                <ol className="space-y-2">
                  {stops.map((s, i) => (
                    <li key={s.id} className="flex items-center gap-3 text-sm">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-emerald-600 text-white' : i === stops.length - 1 ? 'bg-red-600 text-white' : 'bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300'}`}>{s.sequence}</span>
                      <div className="flex-1">
                        <div className="font-medium text-ink-900 dark:text-white">{s.name}</div>
                        <div className="text-[10px] font-mono text-ink-500">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-5">
              <div className="font-semibold text-ink-900 dark:text-white mb-3 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</div>
              {notifs.length === 0 ? (
                <div className="text-sm text-ink-500">No new announcements.</div>
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
