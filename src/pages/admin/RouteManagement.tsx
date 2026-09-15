import { useEffect, useMemo, useState } from 'react';
import { Route as RouteIcon, Plus, Pencil, Trash2, Search, MapPinned } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { Field, inputCls, btnPrimary, btnDanger, btnGhost, btnSecondary } from '../../components/Field';
import Empty from '../../components/Empty';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';

interface RouteRow {
  id: number;
  name: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  duration_min: number;
  color?: string;
}
interface Stop {
  id: number;
  route_id: number;
  name: string;
  sequence: number;
  lat: number;
  lng: number;
}

const emptyRoute: Partial<RouteRow> = { name: '', start_location: '', end_location: '', distance_km: 0, duration_min: 0, color: '#2563eb' };

export default function RouteManagement() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<RouteRow> | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [stopModal, setStopModal] = useState(false);
  const [stopEdit, setStopEdit] = useState<Partial<Stop> | null>(null);

  const load = async () => {
    setLoading(true);
    const [r, s] = await Promise.all([apiGet<RouteRow[]>('/api/routes'), apiGet<Stop[]>('/api/stops')]);
    setRoutes(r);
    setStops(s);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return routes.filter((r) => !q || r.name.toLowerCase().includes(q) || r.start_location.toLowerCase().includes(q) || r.end_location.toLowerCase().includes(q));
  }, [routes, search]);

  const stopCount = (rid: number) => stops.filter((s) => s.route_id === rid).length;
  const selectedStops = stops.filter((s) => s.route_id === selectedRouteId).sort((a, b) => a.sequence - b.sequence);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, distance_km: Number(editing.distance_km || 0), duration_min: Number(editing.duration_min || 0) };
    if ((editing as any).id) await apiPut('/api/routes', payload);
    else await apiPost('/api/routes', payload);
    setModalOpen(false); setEditing(null); load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this route (and its stops)?')) return;
    await apiDelete('/api/routes', { id });
    load();
  };

  const saveStop = async () => {
    if (!stopEdit || !selectedRouteId) return;
    const payload = {
      ...stopEdit,
      route_id: selectedRouteId,
      sequence: Number(stopEdit.sequence || 1),
      lat: Number(stopEdit.lat || 0),
      lng: Number(stopEdit.lng || 0),
    };
    if ((stopEdit as any).id) await apiPut('/api/stops', payload);
    else await apiPost('/api/stops', payload);
    setStopModal(false); setStopEdit(null); load();
  };

  const removeStop = async (id: number) => {
    if (!confirm('Delete this stop?')) return;
    await apiDelete('/api/stops', { id });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Route Management"
        subtitle={`${routes.length} routes · ${stops.length} stops.`}
        actions={<button className={btnPrimary} onClick={() => { setEditing(emptyRoute); setModalOpen(true); }}><Plus className="w-4 h-4" /> Add route</button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 overflow-hidden">
          <div className="p-4 border-b border-ink-200 dark:border-ink-800">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search route name or location…" className={inputCls + ' pl-10'} />
            </div>
          </div>
          {loading ? (
            <div className="p-6 space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 shimmer rounded" />)}</div>
          ) : filtered.length === 0 ? (
            <Empty icon={RouteIcon} title="No routes yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 dark:bg-ink-800/50 text-left text-ink-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Route</th>
                    <th className="px-4 py-3 font-medium">Start</th>
                    <th className="px-4 py-3 font-medium">End</th>
                    <th className="px-4 py-3 font-medium">Distance</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Stops</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}
                      className={`border-t border-ink-100 dark:border-ink-800/60 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800/40 ${selectedRouteId === r.id ? 'bg-brand-50 dark:bg-brand-950/40' : ''}`}
                      onClick={() => setSelectedRouteId(r.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: r.color || '#2563eb' }} />
                          <span className="font-semibold text-ink-900 dark:text-white">{r.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{r.start_location}</td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{r.end_location}</td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{r.distance_km} km</td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{r.duration_min} min</td>
                      <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{stopCount(r.id)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button className={btnGhost} onClick={() => { setEditing(r); setModalOpen(true); }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                          <button className={btnDanger} onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stops panel */}
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-ink-900 dark:text-white flex items-center gap-2"><MapPinned className="w-4 h-4" /> Stops</div>
              <div className="text-xs text-ink-500">{selectedRouteId ? `${routes.find((r) => r.id === selectedRouteId)?.name}` : 'Select a route to manage stops.'}</div>
            </div>
            {selectedRouteId && (
              <button className={btnSecondary} onClick={() => { setStopEdit({ name: '', sequence: selectedStops.length + 1, lat: 12.97, lng: 77.59 }); setStopModal(true); }}>
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[420px]">
            {!selectedRouteId ? (
              <div className="text-sm text-ink-500 py-6 text-center">Click a route to see its stops.</div>
            ) : selectedStops.length === 0 ? (
              <div className="text-sm text-ink-500 py-6 text-center">No stops yet. Add the first stop.</div>
            ) : (
              <ol className="space-y-2">
                {selectedStops.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-ink-50 dark:bg-ink-800/40">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center">{s.sequence}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink-900 dark:text-white truncate">{s.name}</div>
                      <div className="text-[10px] text-ink-500 font-mono">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</div>
                    </div>
                    <button className={btnGhost + ' px-2 py-1'} onClick={() => { setStopEdit(s); setStopModal(true); }}><Pencil className="w-3 h-3" /></button>
                    <button className={btnDanger + ' px-2 py-1'} onClick={() => removeStop(s.id)}><Trash2 className="w-3 h-3" /></button>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={(editing as any)?.id ? 'Edit route' : 'Add route'}>
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
            <Field label="Route name"><input required className={inputCls} value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start location"><input required className={inputCls} value={editing.start_location || ''} onChange={(e) => setEditing({ ...editing, start_location: e.target.value })} /></Field>
              <Field label="End location"><input required className={inputCls} value={editing.end_location || ''} onChange={(e) => setEditing({ ...editing, end_location: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Distance (km)"><input type="number" step="0.1" className={inputCls} value={editing.distance_km || 0} onChange={(e) => setEditing({ ...editing, distance_km: Number(e.target.value) })} /></Field>
              <Field label="Duration (min)"><input type="number" className={inputCls} value={editing.duration_min || 0} onChange={(e) => setEditing({ ...editing, duration_min: Number(e.target.value) })} /></Field>
              <Field label="Color"><input type="color" className={inputCls + ' h-10 p-1'} value={editing.color || '#2563eb'} onChange={(e) => setEditing({ ...editing, color: e.target.value })} /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btnSecondary} onClick={() => { setModalOpen(false); setEditing(null); }}>Cancel</button>
              <button type="submit" className={btnPrimary}>Save</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={stopModal} onClose={() => { setStopModal(false); setStopEdit(null); }} title={(stopEdit as any)?.id ? 'Edit stop' : 'Add stop'}>
        {stopEdit && (
          <form onSubmit={(e) => { e.preventDefault(); saveStop(); }} className="space-y-4">
            <Field label="Stop name"><input required className={inputCls} value={stopEdit.name || ''} onChange={(e) => setStopEdit({ ...stopEdit, name: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Sequence"><input type="number" required className={inputCls} value={stopEdit.sequence || 1} onChange={(e) => setStopEdit({ ...stopEdit, sequence: Number(e.target.value) })} /></Field>
              <Field label="Latitude"><input type="number" step="0.0001" required className={inputCls} value={stopEdit.lat || 0} onChange={(e) => setStopEdit({ ...stopEdit, lat: Number(e.target.value) })} /></Field>
              <Field label="Longitude"><input type="number" step="0.0001" required className={inputCls} value={stopEdit.lng || 0} onChange={(e) => setStopEdit({ ...stopEdit, lng: Number(e.target.value) })} /></Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={btnSecondary} onClick={() => { setStopModal(false); setStopEdit(null); }}>Cancel</button>
              <button type="submit" className={btnPrimary}>Save stop</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
