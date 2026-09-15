import { useEffect, useMemo, useState } from 'react';
import { Bus, Plus, Pencil, Trash2, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { Field, inputCls, btnPrimary, btnDanger, btnGhost, btnSecondary } from '../../components/Field';
import StatusBadge from '../../components/StatusBadge';
import Empty from '../../components/Empty';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';

interface BusRow {
  id: number;
  bus_number: string;
  model: string;
  capacity: number;
  status: string;
  route_id?: number | null;
  driver_email?: string | null;
}

const emptyBus: Partial<BusRow> = { bus_number: '', model: '', capacity: 40, status: 'active', route_id: null, driver_email: '' };

export default function BusManagement() {
  const [buses, setBuses] = useState<BusRow[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'maintenance'>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<BusRow> | null>(null);

  const load = async () => {
    setLoading(true);
    const [b, r, d] = await Promise.all([
      apiGet<BusRow[]>('/api/buses'),
      apiGet<any[]>('/api/routes'),
      apiGet<any[]>('/api/drivers'),
    ]);
    setBuses(b);
    setRoutes(r);
    setDrivers(d);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return buses
      .filter((b) => (filter === 'all' ? true : b.status === filter))
      .filter((b) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
          b.bus_number?.toLowerCase().includes(q) ||
          b.model?.toLowerCase().includes(q) ||
          (b.driver_email || '').toLowerCase().includes(q)
        );
      });
  }, [buses, search, filter]);

  const routeName = (id?: number | null) => routes.find((r) => r.id === id)?.name || '—';

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, capacity: Number(editing.capacity), route_id: editing.route_id || null };
    if ((editing as any).id) {
      await apiPut('/api/buses', payload);
    } else {
      await apiPost('/api/buses', payload);
    }
    setModalOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this bus?')) return;
    await apiDelete('/api/buses', { id });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Bus Management"
        subtitle={`${buses.length} buses in the fleet.`}
        actions={
          <button className={btnPrimary} onClick={() => { setEditing(emptyBus); setModalOpen(true); }}>
            <Plus className="w-4 h-4" /> Add bus
          </button>
        }
      />

      <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 overflow-hidden">
        <div className="p-4 border-b border-ink-200 dark:border-ink-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bus number, model, driver…"
              className={inputCls + ' pl-10'}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'inactive', 'maintenance'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${
                  filter === f ? 'bg-brand-600 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 shimmer rounded" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Empty icon={Bus} title="No buses found" hint="Try clearing the search or add a new bus." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-800/50 text-left text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Bus</th>
                  <th className="px-4 py-3 font-medium">Model</th>
                  <th className="px-4 py-3 font-medium">Capacity</th>
                  <th className="px-4 py-3 font-medium">Route</th>
                  <th className="px-4 py-3 font-medium">Driver</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.id} className="border-t border-ink-100 dark:border-ink-800/60">
                    <td className="px-4 py-3 font-semibold text-ink-900 dark:text-white">{b.bus_number}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{b.model}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{b.capacity}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{routeName(b.route_id)}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{b.driver_email || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button className={btnGhost} onClick={() => { setEditing(b); setModalOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button className={btnDanger} onClick={() => remove(b.id)}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={(editing as any)?.id ? 'Edit bus' : 'Add bus'}
      >
        {editing && (
          <form
            onSubmit={(e) => { e.preventDefault(); save(); }}
            className="space-y-4"
          >
            <Field label="Bus number">
              <input required className={inputCls} value={editing.bus_number || ''} onChange={(e) => setEditing({ ...editing, bus_number: e.target.value })} />
            </Field>
            <Field label="Model">
              <input className={inputCls} value={editing.model || ''} onChange={(e) => setEditing({ ...editing, model: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Capacity">
                <input type="number" required className={inputCls} value={editing.capacity || 0} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })} />
              </Field>
              <Field label="Status">
                <select className={inputCls} value={editing.status || 'active'} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </Field>
            </div>
            <Field label="Route">
              <select className={inputCls} value={editing.route_id || ''} onChange={(e) => setEditing({ ...editing, route_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— Unassigned —</option>
                {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Assigned driver (email)">
              <select className={inputCls} value={editing.driver_email || ''} onChange={(e) => setEditing({ ...editing, driver_email: e.target.value })}>
                <option value="">— Unassigned —</option>
                {drivers.map((d) => <option key={d.id} value={d.email}>{d.name} · {d.email}</option>)}
              </select>
            </Field>
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
