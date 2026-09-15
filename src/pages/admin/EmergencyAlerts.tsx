import { useEffect, useState } from 'react';
import { ShieldAlert, Check, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Empty from '../../components/Empty';
import { btnDanger, btnGhost } from '../../components/Field';
import { apiDelete, apiGet, apiPut } from '../../lib/api';

interface Alert {
  id: number;
  bus_id: number;
  driver_id: number;
  message: string;
  status: string;
  location_lat?: number | null;
  location_lng?: number | null;
  created_at: string;
  resolved_at?: string | null;
}

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [a, b, d] = await Promise.all([
      apiGet<Alert[]>('/api/emergency-alerts'),
      apiGet<any[]>('/api/buses'),
      apiGet<any[]>('/api/drivers'),
    ]);
    setAlerts(a); setBuses(b); setDrivers(d); setLoading(false);
  };
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, []);

  const busN = (id: number) => buses.find((b) => b.id === id)?.bus_number || '—';
  const driverN = (id: number) => drivers.find((d) => d.id === id)?.name || '—';

  const resolve = async (id: number) => {
    await apiPut('/api/emergency-alerts', { id, status: 'resolved' });
    load();
  };
  const remove = async (id: number) => {
    if (!confirm('Delete this alert?')) return;
    await apiDelete('/api/emergency-alerts', { id });
    load();
  };

  const active = alerts.filter((a) => a.status === 'active');
  const resolved = alerts.filter((a) => a.status !== 'active');

  return (
    <div>
      <PageHeader
        title="Emergency Alerts"
        subtitle={`${active.length} active · ${resolved.length} resolved.`}
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-lg shimmer" />)}</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800">
          <Empty icon={ShieldAlert} title="No alerts" hint="Drivers can raise alerts from their dashboard." />
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <div className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-3">Active</div>
            {active.length === 0 ? (
              <div className="text-sm text-ink-500 py-4">All clear right now.</div>
            ) : (
              <div className="space-y-3">
                {active.map((a) => (
                  <div key={a.id} className="bg-white dark:bg-ink-900 rounded-xl border-2 border-red-300 dark:border-red-800 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center justify-center shrink-0 pulse-ring"><ShieldAlert className="w-5 h-5" /></div>
                      <div className="flex-1">
                        <div className="font-semibold text-ink-900 dark:text-white">Bus {busN(a.bus_id)} · Driver {driverN(a.driver_id)}</div>
                        <div className="text-sm text-ink-700 dark:text-ink-300 mt-1">{a.message}</div>
                        <div className="text-xs text-ink-500 mt-1 font-mono">
                          {a.location_lat && a.location_lng ? `${a.location_lat.toFixed(4)}, ${a.location_lng.toFixed(4)} · ` : ''}
                          {new Date(a.created_at).toLocaleString()}
                        </div>
                      </div>
                      <StatusBadge status={a.status} />
                      <button className={btnGhost} onClick={() => resolve(a.id)}><Check className="w-4 h-4" /> Resolve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="text-xs font-semibold uppercase tracking-widest text-ink-500 mb-3">Resolved</div>
            <div className="space-y-2">
              {resolved.map((a) => (
                <div key={a.id} className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-500 flex items-center justify-center"><ShieldAlert className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink-800 dark:text-ink-200 truncate">Bus {busN(a.bus_id)} · {a.message}</div>
                    <div className="text-xs text-ink-500">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                  <StatusBadge status={a.status} />
                  <button className={btnDanger} onClick={() => remove(a.id)}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
