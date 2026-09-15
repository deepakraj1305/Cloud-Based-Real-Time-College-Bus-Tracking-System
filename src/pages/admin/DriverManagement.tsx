import { useEffect, useMemo, useState } from 'react';
import { UserCog, Plus, Pencil, Trash2, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { Field, inputCls, btnPrimary, btnDanger, btnGhost, btnSecondary } from '../../components/Field';
import StatusBadge from '../../components/StatusBadge';
import Empty from '../../components/Empty';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';

interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  experience_years: number;
  status: string;
  assigned_bus_id?: number | null;
}

const emptyDriver: Partial<Driver> = {
  name: '', email: '', phone: '', license_number: '', experience_years: 1, status: 'on_duty', assigned_bus_id: null,
};

export default function DriverManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Driver> | null>(null);

  const load = async () => {
    setLoading(true);
    const [d, b] = await Promise.all([apiGet<Driver[]>('/api/drivers'), apiGet<any[]>('/api/buses')]);
    setDrivers(d);
    setBuses(b);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return drivers;
    return drivers.filter((d) =>
      d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.license_number?.toLowerCase().includes(q)
    );
  }, [drivers, search]);

  const busNumber = (id?: number | null) => buses.find((b) => b.id === id)?.bus_number || '—';

  const save = async () => {
    if (!editing) return;
    const payload = {
      ...editing,
      experience_years: Number(editing.experience_years || 0),
      assigned_bus_id: editing.assigned_bus_id || null,
    };
    if ((editing as any).id) await apiPut('/api/drivers', payload);
    else await apiPost('/api/drivers', payload);
    setModalOpen(false); setEditing(null); load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this driver?')) return;
    await apiDelete('/api/drivers', { id });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Driver Management"
        subtitle={`${drivers.length} drivers registered.`}
        actions={<button className={btnPrimary} onClick={() => { setEditing(emptyDriver); setModalOpen(true); }}><Plus className="w-4 h-4" /> Add driver</button>}
      />

      <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 overflow-hidden">
        <div className="p-4 border-b border-ink-200 dark:border-ink-800">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search driver name, email, license…" className={inputCls + ' pl-10'} />
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 shimmer rounded" />)}</div>
        ) : filtered.length === 0 ? (
          <Empty icon={UserCog} title="No drivers found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-800/50 text-left text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">License</th>
                  <th className="px-4 py-3 font-medium">Experience</th>
                  <th className="px-4 py-3 font-medium">Bus</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-t border-ink-100 dark:border-ink-800/60">
                    <td className="px-4 py-3 font-semibold text-ink-900 dark:text-white">{d.name}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 font-mono text-xs">{d.email}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{d.phone}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 font-mono text-xs">{d.license_number}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{d.experience_years} yrs</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{busNumber(d.assigned_bus_id)}</td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button className={btnGhost} onClick={() => { setEditing(d); setModalOpen(true); }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                        <button className={btnDanger} onClick={() => remove(d.id)}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={(editing as any)?.id ? 'Edit driver' : 'Add driver'}>
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
            <Field label="Full name"><input required className={inputCls} value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Email"><input required type="email" className={inputCls} value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone"><input className={inputCls} value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
              <Field label="License #"><input className={inputCls} value={editing.license_number || ''} onChange={(e) => setEditing({ ...editing, license_number: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Experience (yrs)"><input type="number" className={inputCls} value={editing.experience_years || 0} onChange={(e) => setEditing({ ...editing, experience_years: Number(e.target.value) })} /></Field>
              <Field label="Status">
                <select className={inputCls} value={editing.status || 'on_duty'} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  <option value="on_duty">On duty</option>
                  <option value="off_duty">Off duty</option>
                </select>
              </Field>
            </div>
            <Field label="Assigned bus">
              <select className={inputCls} value={editing.assigned_bus_id || ''} onChange={(e) => setEditing({ ...editing, assigned_bus_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— Unassigned —</option>
                {buses.map((b) => <option key={b.id} value={b.id}>{b.bus_number}</option>)}
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
