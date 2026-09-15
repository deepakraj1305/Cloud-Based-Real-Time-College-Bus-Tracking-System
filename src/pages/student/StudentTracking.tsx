import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import BusMap, { useDemoBus, type RouteStop } from '../../components/BusMap';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { btnPrimary, btnSecondary } from '../../components/Field';
import { Play, Square, RefreshCw } from 'lucide-react';

export default function StudentTracking() {
  const { user } = useAuth();
  const [bus, setBus] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [demo, setDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.email) return;
    setLoading(true);
    const students = await apiGet<any[]>(`/api/students?email=${encodeURIComponent(user.email)}`);
    const st = students[0];
    if (!st) return setLoading(false);
    const [buses, routes, allStops, locs] = await Promise.all([
      apiGet<any[]>('/api/buses'), apiGet<any[]>('/api/routes'),
      apiGet<any[]>('/api/stops'), apiGet<any[]>('/api/bus-locations'),
    ]);
    const b = buses.find((x) => x.id === st.assigned_bus_id);
    setBus(b);
    const r = routes.find((x) => x.id === b?.route_id);
    setRoute(r);
    setStops(allStops.filter((s) => s.route_id === r?.id).sort((a, b) => a.sequence - b.sequence));
    setLocation(locs.find((l) => l.bus_id === b?.id));
    setLoading(false);
  };
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); /* eslint-disable-next-line */ }, [user?.email]);

  const rs: RouteStop[] = useMemo(() => stops.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, sequence: s.sequence })), [stops]);
  const path: [number, number][] = rs.map((s) => [s.lat, s.lng]);
  const demoPos = useDemoBus(demo && path.length > 1 ? path : []);

  const busMarker = bus
    ? demo && demoPos
      ? [{ id: bus.id, bus_number: bus.bus_number, route_name: route?.name, lat: demoPos[0], lng: demoPos[1], status: 'active' }]
      : location
        ? [{ id: bus.id, bus_number: bus.bus_number, route_name: route?.name, lat: location.lat, lng: location.lng, status: location.status || 'active' }]
        : path[0]
          ? [{ id: bus.id, bus_number: bus.bus_number, route_name: route?.name, lat: path[0][0], lng: path[0][1], status: 'inactive' }]
          : []
    : [];

  return (
    <div>
      <PageHeader
        title="Live Tracking"
        subtitle="Follow your bus in real time."
        actions={
          <>
            <button className={btnSecondary} onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</button>
            <button className={demo ? btnSecondary : btnPrimary} onClick={() => setDemo((d) => !d)}>
              {demo ? <><Square className="w-4 h-4" /> Stop demo</> : <><Play className="w-4 h-4" /> Start demo</>}
            </button>
          </>
        }
      />
      {loading ? <div className="h-[520px] shimmer rounded-xl" /> : <BusMap buses={busMarker} stops={rs} routePath={path} demoMode={demo} height={520} />}
    </div>
  );
}
