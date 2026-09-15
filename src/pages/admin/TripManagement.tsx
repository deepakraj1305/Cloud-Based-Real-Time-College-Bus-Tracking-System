import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Plus, Pencil, Trash2, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { Field, inputCls, btnPrimary, btnDanger, btnGhost, btnSecondary } from '../../components/Field';
import StatusBadge from '../../components/StatusBadge';
import Empty from '../../components/Empty';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';

interface Trip {
  id: number;
  bus_id: number;
  route_id: number;
  driver_id: number;
  start_time: string;
  end_time?: string | null;
  status: string;
  trip_date: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const emptyTrip: Partial<Trip> = { bus_id: 0, route_id: 0, driver_id: 0, start_time: '07:00', end_time: '08:30', status: 'scheduled', trip_date: today() };

export default function TripManagement() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | string>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Trip> | null>(null);

  const load = async () => {
    setLoading(true);
    const [t, b, r, d] = await Promise.all([
      apiGet<Trip[]>('/api/trips'),
      apiGet<any[]>('/api/buses'),
      apiGet<any[]>('/api/routes'),
      apiGet<any[]>('/api/drivers'),
    ]);
    setTrips(t); setBuses(b); setRoutes(r); setDrivers(d); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const busN = (id: number) => buses.find((b) => b.id === id)?.bus_number || '—';
  const routeN = (id: number) => routes.find((r) => r.id === id)?.name || '—';
  const driverN = (id: number) => drivers.find((d) => d.id === id)?.name || '—';

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trips
      .filter((t) => status === 'all' ? true : t.status === status)
      .filter((t) => !q || busN(t.bus_id).toLowerCase().includes(q) || routeN(t.route_id).toLowerCase().includes(q) || driverN(t.driver_id).toLowerCase().includes(q));
    // eslint-disable-next-line
  }, [trips, search, status, buses, routes, drivers]);

  const save = async () => {
    if (!editing) return;
    const payload = {
      ...editing,
      bus_id: Number(editing.bus_id),
      route_id: Number(editing.route_id),
      driver_id: Number(editing.driver_id),
    };
    if ((editing as any).id) await apiPut('/api/trips', payload);
    else await apiPost('/api/trips', payload);
    setModalOpen(false); setEditing(null); load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this trip?')) return;
    await apiDelete('/api/trips', { id });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Trip Management"
        subtitle={`${trips.length} total trips.`}
        actions={<button className={btnPrimary} onClick={() => { setEditing(emptyTrip); setModalOpen(true); }}><Plus className="w-4 h-4" /> Schedule trip</button>}
      />

      <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 overflow-hidden">
        <div className="p-4 border-b border-ink-200 dark:border-ink-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bus, route, driver…" className={inputCls + ' pl-10'} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'scheduled', 'in_progress', 'completed', 'cancelled'] as const).map((f) => (
              <button key={f} onClick={() => setStatus(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${status === f ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300'}`}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 shimmer rounded" />)}</div>
        ) : filtered.length === 0 ? (
          <Empty icon={CalendarClock} title="No trips found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-800/50 text-left text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Trip #</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Bus</th>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Start</th>
                  <th className="px-4 py-3 font-medium">End</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-t border-ink-100 dark:border-ink-800/60">
                    <td className="px-4 py-3 font-mono text-ink-800 dark:text-ink-200">#{t.id}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{t.trip_date}</td>
                    <td className="px-4 py-3 font-semibold text-ink-900 dark:text-white">{busN(t.bus_id)}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{routeN(t.route_id)}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{driverN(t.driver_id)}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{t.start_time || '—'}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{t.end_time || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button className={btnGhost} onClick={() => { setEditing(t); setModalOpen(true); }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                        <button className={btnDanger} onClick={() => remove(t.id)}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={(editing as any)?.id ? 'Edit trip' : 'Schedule trip'}>
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><input type="date" required className={inputCls} value={editing.trip_date || ''} onChange={(e) => setEditing({ ...editing, trip_date: e.target.value })} /></Field>
              <Field label="Status">
                <select className={inputCls} value={editing.status || 'scheduled'} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </Field>
            </div>
            <Field label="Bus">
              <select required className={inputCls} value={editing.bus_id || ''} onChange={(e) => setEditing({ ...editing, bus_id: Number(e.target.value) })}>
                <option value="">Select bus…</option>
                {buses.map((b) => <option key={b.id} value={b.id}>{b.bus_number}</option>)}
              </select>
            </Field>
            <Field label="Route">
              <select required className={inputCls} value={editing.route_id || ''} onChange={(e) => setEditing({ ...editing, route_id: Number(e.target.value) })}>
                <option value="">Select route…</option>
                {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Driver">
              <select required className={inputCls} value={editing.driver_id || ''} onChange={(e) => setEditing({ ...editing, driver_id: Number(e.target.value) })}>
                <option value="">Select driver…</option>
                {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start time"><input type="time" className={inputCls} value={editing.start_time || ''} onChange={(e) => setEditing({ ...editing, start_time: e.target.value })} /></Field>
              <Field label="End time"><input type="time" className={inputCls} value={editing.end_time || ''} onChange={(e) => setEditing({ ...editing, end_time: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btnSecondary} onClick={() => { setModalOpen(false); setEditing(null); }}>Cancel</button>
              <button type="submit" className={btnPrimary}>Save</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
