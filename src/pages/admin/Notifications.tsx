import { useEffect, useState } from 'react';
import { Bell, Plus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Modal from '../../components/Modal';
import { Field, inputCls, btnPrimary, btnDanger, btnSecondary } from '../../components/Field';
import Empty from '../../components/Empty';
import { apiDelete, apiGet, apiPost } from '../../lib/api';

interface Notif {
  id: number;
  title: string;
  message: string;
  target_role: string;
  created_at: string;
}

export default function Notifications() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState({ title: '', message: '', target_role: 'all' });

  const load = async () => {
    setLoading(true);
    const data = await apiGet<Notif[]>('/api/notifications');
    setItems(data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    await apiPost('/api/notifications', draft);
    setModal(false); setDraft({ title: '', message: '', target_role: 'all' }); load();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this notification?')) return;
    await apiDelete('/api/notifications', { id });
    load();
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Broadcast announcements to admins, drivers, or students."
        actions={<button className={btnPrimary} onClick={() => setModal(true)}><Plus className="w-4 h-4" /> New notification</button>}
      />

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg shimmer" />)}</div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800">
          <Empty icon={Bell} title="No notifications yet" hint="Send a message to your team or students." />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n.id} className="bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 p-4 flex gap-4">
              <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0"><Bell className="w-5 h-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-ink-900 dark:text-white">{n.title}</div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">{n.target_role}</span>
                </div>
                <div className="text-sm text-ink-600 dark:text-ink-300 mt-1">{n.message}</div>
                <div className="text-xs text-ink-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <button className={btnDanger} onClick={() => remove(n.id)}><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="New notification">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="space-y-4">
          <Field label="Title"><input required className={inputCls} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
          <Field label="Message"><textarea required rows={4} className={inputCls} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} /></Field>
          <Field label="Send to">
            <select className={inputCls} value={draft.target_role} onChange={(e) => setDraft({ ...draft, target_role: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="admin">Admins</option>
              <option value="driver">Drivers</option>
              <option value="student">Students</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className={btnSecondary} onClick={() => setModal(false)}>Cancel</button>
            <button type="submit" className={btnPrimary}>Send</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
