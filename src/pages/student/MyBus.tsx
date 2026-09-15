import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Bus, User } from 'lucide-react';

export default function MyBus() {
  const { user } = useAuth();
  const [bus, setBus] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user?.email) return;
      const students = await apiGet<any[]>(`/api/students?email=${encodeURIComponent(user.email)}`);
      const st = students[0];
      if (!st) return setLoading(false);
      const [buses, drivers, routes] = await Promise.all([
        apiGet<any[]>('/api/buses'), apiGet<any[]>('/api/drivers'), apiGet<any[]>('/api/routes'),
      ]);
      const b = buses.find((x) => x.id === st.assigned_bus_id);
      setBus(b);
      setDriver(drivers.find((d) => d.email === b?.driver_email));
      setRoute(routes.find((r) => r.id === b?.route_id));
      setLoading(false);
    })();
  }, [user?.email]);

  if (loading) return <div className="h-40 shimmer rounded-xl" />;
  if (!bus) return (
    <div className="bg-white dark:bg-ink-900 rounded-xl border p-8 text-center">
      <Bus className="w-10 h-10 text-ink-400 mx-auto mb-2" />
      <div className="font-semibold">No bus assigned</div>
      <div className="text-sm text-ink-500">Contact your admin.</div>
    </div>
  );

  return (
    <div>
      <PageHeader title="My Bus" subtitle="Details of your assigned campus bus." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-white flex items-center justify-center shadow"><Bus className="w-7 h-7" /></div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-500">Bus number</div>
              <div className="text-3xl font-bold text-ink-900 dark:text-white tracking-tight">{bus.bus_number}</div>
            </div>
            <div className="ml-auto"><StatusBadge status={bus.status} /></div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Info label="Model" value={bus.model} />
            <Info label="Capacity" value={`${bus.capacity} seats`} />
            <Info label="Route" value={route?.name || '—'} />
            <Info label="Route distance" value={route ? `${route.distance_km} km` : '—'} />
            <Info label="Route duration" value={route ? `${route.duration_min} min` : '—'} />
            <Info label="Bus ID" value={`#${bus.id}`} mono />
          </div>
        </div>
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center"><User className="w-5 h-5" /></div>
            <div>
              <div className="text-xs uppercase tracking-widest text-ink-500">Driver</div>
              <div className="font-semibold text-ink-900 dark:text-white">{driver?.name || 'Not assigned'}</div>
            </div>
          </div>
          {driver && (
            <div className="space-y-2 text-sm">
              <Info label="Experience" value={`${driver.experience_years} yrs`} />
              <Info label="Phone" value={driver.phone} />
              <Info label="License" value={driver.license_number} mono />
              <Info label="Status" value={driver.status?.replace('_', ' ')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, mono }: { label: string; value: any; mono?: boolean }) {
  return (
    <div className="rounded-lg bg-ink-50 dark:bg-ink-800/40 p-3">
      <div className="text-[10px] uppercase text-ink-500 tracking-widest">{label}</div>
      <div className={`mt-0.5 font-medium text-ink-900 dark:text-white ${mono ? 'font-mono text-sm' : ''}`}>{value}</div>
    </div>
  );
}
