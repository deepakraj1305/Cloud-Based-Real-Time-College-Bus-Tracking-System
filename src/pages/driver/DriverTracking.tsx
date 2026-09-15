import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import BusMap, { useDemoBus, type RouteStop } from '../../components/BusMap';
import { apiGet, apiPost } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { btnPrimary, btnSecondary } from '../../components/Field';
import { Play, Square, RefreshCw } from 'lucide-react';

export default function DriverTracking() {
  const { user } = useAuth();
  const [driver, setDriver] = useState<any>(null);
  const [bus, setBus] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    const drivers = await apiGet<any[]>(`/api/drivers?email=${encodeURIComponent(user.email)}`);
    const dr = drivers[0];
    setDriver(dr);
    if (dr) {
      const [buses, routes, allStops] = await Promise.all([
        apiGet<any[]>('/api/buses'),
        apiGet<any[]>('/api/routes'),
        apiGet<any[]>('/api/stops'),
      ]);
      const b = buses.find((x) => x.id === dr.assigned_bus_id) || buses.find((x) => x.driver_email === dr.email);
      setBus(b);
      const r = routes.find((x) => x.id === b?.route_id);
      setRoute(r);
      setStops(allStops.filter((s) => s.route_id === r?.id).sort((a, b) => a.sequence - b.sequence));
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.email]);

  const routeStops: RouteStop[] = useMemo(() => stops.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, sequence: s.sequence })), [stops]);
  const path: [number, number][] = routeStops.map((s) => [s.lat, s.lng]);
  const demoPos = useDemoBus(demo && path.length > 1 ? path : []);

  useEffect(() => {
    if (!demo || !bus || !demoPos) return;
    const id = setTimeout(() => {
      apiPost('/api/bus-locations', { bus_id: bus.id, lat: demoPos[0], lng: demoPos[1], speed: 30, heading: 90, status: 'active' }).catch(() => {});
    }, 2500);
    return () => clearTimeout(id);
  }, [demo, bus, demoPos]);

  const busMarker = bus && demoPos ? [{ id: bus.id, bus_number: bus.bus_number, route_name: route?.name, lat: demoPos[0], lng: demoPos[1], status: 'active' }] : [];

  return (
    <div>
      <PageHeader
        title="My Live Tracking"
        subtitle="Broadcast your position while driving."
        actions={
          <>
            <button className={btnSecondary} onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</button>
            <button className={demo ? btnSecondary : btnPrimary} onClick={() => setDemo((d) => !d)}>
              {demo ? <><Square className="w-4 h-4" /> Stop demo</> : <><Play className="w-4 h-4" /> Start demo</>}
            </button>
          </>
        }
      />
      {loading ? (
        <div className="h-[560px] rounded-xl shimmer" />
      ) : !bus ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl border p-8 text-center">No assigned bus.</div>
      ) : (
        <BusMap buses={busMarker} stops={routeStops} routePath={path} demoMode={demo} height={560} />
      )}
    </div>
  );
}
