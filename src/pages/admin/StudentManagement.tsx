import { useEffect, useMemo, useState } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, Search } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { Field, inputCls, btnPrimary, btnDanger, btnGhost, btnSecondary } from '../../components/Field';
import Empty from '../../components/Empty';
import { apiDelete, apiGet, apiPost, apiPut } from '../../lib/api';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  roll_no: string;
  department: string;
  year: number;
  pickup_stop_id?: number | null;
  assigned_bus_id?: number | null;
}

const emptyStudent: Partial<Student> = {
  name: '', email: '', phone: '', roll_no: '', department: 'CSE', year: 1, pickup_stop_id: null, assigned_bus_id: null,
};

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [stops, setStops] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState<'all' | string>('all');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Student> | null>(null);

  const load = async () => {
    setLoading(true);
    const [s, b, st] = await Promise.all([
      apiGet<Student[]>('/api/students'),
      apiGet<any[]>('/api/buses'),
      apiGet<any[]>('/api/stops'),
    ]);
    setStudents(s);
    setBuses(b);
    setStops(st);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const departments = useMemo(() => Array.from(new Set(students.map((s) => s.department))).sort(), [students]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return students
      .filter((s) => dept === 'all' ? true : s.department === dept)
      .filter((s) => !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.roll_no.toLowerCase().includes(q));
  }, [students, search, dept]);

  const busNumber = (id?: number | null) => buses.find((b) => b.id === id)?.bus_number || '—';
  const stopName = (id?: number | null) => stops.find((s) => s.id === id)?.name || '—';

  const save = async () => {
    if (!editing) return;
    const payload = {
      ...editing,
      year: Number(editing.year || 1),
      pickup_stop_id: editing.pickup_stop_id || null,
      assigned_bus_id: editing.assigned_bus_id || null,
    };
    if ((editing as any).id) await apiPut('/api/students', payload);
    else await apiPost('/api/students', payload);
    setModalOpen(false); setEditing(null); load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this student?')) return;
    await apiDelete('/api/students', { id });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Student Management"
        subtitle={`${students.length} students enrolled.`}
        actions={<button className={btnPrimary} onClick={() => { setEditing(emptyStudent); setModalOpen(true); }}><Plus className="w-4 h-4" /> Add student</button>}
      />

      <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 overflow-hidden">
        <div className="p-4 border-b border-ink-200 dark:border-ink-800 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, roll number…" className={inputCls + ' pl-10'} />
          </div>
          <select className={inputCls + ' max-w-xs'} value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="all">All departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="p-6 space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 shimmer rounded" />)}</div>
        ) : filtered.length === 0 ? (
          <Empty icon={GraduationCap} title="No students found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 dark:bg-ink-800/50 text-left text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Roll #</th>
                  <th className="px-4 py-3 font-medium">Dept</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Bus</th>
                  <th className="px-4 py-3 font-medium">Pickup</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-ink-100 dark:border-ink-800/60">
                    <td className="px-4 py-3 font-semibold text-ink-900 dark:text-white">{s.name}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 font-mono text-xs">{s.roll_no}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{s.department}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">Y{s.year}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{busNumber(s.assigned_bus_id)}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300">{stopName(s.pickup_stop_id)}</td>
                    <td className="px-4 py-3 text-ink-600 dark:text-ink-300 text-xs"><div>{s.email}</div><div className="text-ink-400">{s.phone}</div></td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button className={btnGhost} onClick={() => { setEditing(s); setModalOpen(true); }}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                        <button className={btnDanger} onClick={() => remove(s.id)}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={(editing as any)?.id ? 'Edit student' : 'Add student'}>
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-4">
            <Field label="Full name"><input required className={inputCls} value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Email"><input required type="email" className={inputCls} value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Roll #"><input className={inputCls} value={editing.roll_no || ''} onChange={(e) => setEditing({ ...editing, roll_no: e.target.value })} /></Field>
              <Field label="Phone"><input className={inputCls} value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Department"><input className={inputCls} value={editing.department || ''} onChange={(e) => setEditing({ ...editing, department: e.target.value })} /></Field>
              <Field label="Year">
                <select className={inputCls} value={editing.year || 1} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })}>
                  <option value={1}>Year 1</option>
                  <option value={2}>Year 2</option>
                  <option value={3}>Year 3</option>
                  <option value={4}>Year 4</option>
                </select>
              </Field>
            </div>
            <Field label="Assigned bus">
              <select className={inputCls} value={editing.assigned_bus_id || ''} onChange={(e) => setEditing({ ...editing, assigned_bus_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— Unassigned —</option>
                {buses.map((b) => <option key={b.id} value={b.id}>{b.bus_number}</option>)}
              </select>
            </Field>
            <Field label="Pickup stop">
              <select className={inputCls} value={editing.pickup_stop_id || ''} onChange={(e) => setEditing({ ...editing, pickup_stop_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">— Unassigned —</option>
                {stops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
