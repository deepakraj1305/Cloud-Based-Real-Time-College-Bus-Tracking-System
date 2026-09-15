import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import BusMap, { useDemoBus, type BusOnMap, type RouteStop } from '../../components/BusMap';
import { apiGet, apiPost } from '../../lib/api';
import { Bus, Play, Square, RefreshCw } from 'lucide-react';
import { btnPrimary, btnSecondary, inputCls } from '../../components/Field';

export default function LiveTracking() {
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(null);
  const [demo, setDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [b, r, s, l] = await Promise.all([
      apiGet<any[]>('/api/buses'),
      apiGet<any[]>('/api/routes'),
      apiGet<any[]>('/api/stops'),
      apiGet<any[]>('/api/bus-locations'),
    ]);
    setBuses(b); setRoutes(r); setStops(s); setLocations(l);
    if (!selectedBusId && b.length) setSelectedBusId(b[0].id);
    setLoading(false);
  };
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, []); // eslint-disable-line

  const selectedBus = buses.find((b) => b.id === selectedBusId);
  const selectedRoute = routes.find((r) => r.id === selectedBus?.route_id);
  const routeStops: RouteStop[] = useMemo(
    () => stops.filter((s) => s.route_id === selectedRoute?.id).sort((a, b) => a.sequence - b.sequence).map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng, sequence: s.sequence })),
    [stops, selectedRoute]
  );
  const path: [number, number][] = routeStops.map((s) => [s.lat, s.lng]);

  // Demo bus movement
  const demoPos = useDemoBus(demo && path.length > 1 ? path : []);
  const busLocation = locations.find((l) => l.bus_id === selectedBusId);

  const displayBuses: BusOnMap[] = useMemo(() => {
    if (!selectedBus) return [];
    if (demo && demoPos) {
      return [{ id: selectedBus.id, bus_number: selectedBus.bus_number, route_name: selectedRoute?.name, lat: demoPos[0], lng: demoPos[1], status: 'active' }];
    }
    if (busLocation) {
      return [{ id: selectedBus.id, bus_number: selectedBus.bus_number, route_name: selectedRoute?.name, lat: busLocation.lat, lng: busLocation.lng, status: busLocation.status }];
    }
    if (path[0]) {
      return [{ id: selectedBus.id, bus_number: selectedBus.bus_number, route_name: selectedRoute?.name, lat: path[0][0], lng: path[0][1], status: 'inactive' }];
    }
    return [];
  }, [selectedBus, demo, demoPos, busLocation, selectedRoute, path]);

  // If demo, persist the moving location to DB every 3s
  useEffect(() => {
    if (!demo || !selectedBus || !demoPos) return;
    const id = setTimeout(() => {
      apiPost('/api/bus-locations', { bus_id: selectedBus.id, lat: demoPos[0], lng: demoPos[1], speed: 32, heading: 90, status: 'active' }).catch(() => {});
    }, 2500);
    return () => clearTimeout(id);
  }, [demo, selectedBus, demoPos]);

  return (
    <div>
      <PageHeader
        title="Live Tracking"
        subtitle="Real-time bus map powered by Leaflet + OpenStreetMap."
        actions={
          <>
            <button className={btnSecondary} onClick={load}><RefreshCw className="w-4 h-4" /> Refresh</button>
            <button className={demo ? btnSecondary : btnPrimary} onClick={() => setDemo((d) => !d)}>
              {demo ? <><Square className="w-4 h-4" /> Stop demo</> : <><Play className="w-4 h-4" /> Start demo</>}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-4 flex flex-col gap-3">
          <div>
            <div className="text-xs uppercase text-ink-500 tracking-widest mb-1">Select bus</div>
            <select className={inputCls} value={selectedBusId || ''} onChange={(e) => setSelectedBusId(Number(e.target.value))}>
              {buses.map((b) => <option key={b.id} value={b.id}>{b.bus_number} · {routes.find((r) => r.id === b.route_id)?.name || 'No route'}</option>)}
            </select>
          </div>

          {selectedBus && (
            <div className="rounded-lg bg-ink-50 dark:bg-ink-800/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center"><Bus className="w-4 h-4" /></div>
                <div>
                  <div className="font-semibold text-ink-900 dark:text-white">{selectedBus.bus_number}</div>
                  <div className="text-xs text-ink-500">{selectedBus.model}</div>
                </div>
              </div>
              <div className="text-xs space-y-1 text-ink-600 dark:text-ink-300">
                <div>Route: <span className="font-medium">{selectedRoute?.name || '—'}</span></div>
                <div>Driver: <span className="font-mono text-[10px]">{selectedBus.driver_email || '—'}</span></div>
                <div>Capacity: {selectedBus.capacity}</div>
                <div>Status: <span className="capitalize">{selectedBus.status}</span></div>
              </div>
            </div>
          )}

          <div>
            <div className="text-xs uppercase text-ink-500 tracking-widest mb-2">Route stops ({routeStops.length})</div>
            <ol className="space-y-1.5 max-h-64 overflow-y-auto">
              {routeStops.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-sm text-ink-700 dark:text-ink-300">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-[10px] font-bold flex items-center justify-center">{s.sequence}</span>
                  <span className="truncate">{s.name}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-[560px] rounded-xl shimmer" />
          ) : (
            <BusMap buses={displayBuses} stops={routeStops} routePath={path} demoMode={demo} height={560} />
          )}
        </div>
      </div>
    </div>
  );
}
