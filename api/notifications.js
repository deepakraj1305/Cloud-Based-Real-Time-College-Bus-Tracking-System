import supabase from './db-client.js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method === 'GET') {
      const { role } = req.query;
      let q = supabase.from('notifications').select('*').order('created_at', { ascending: false });
      const { data, error } = await q;
      if (error) throw error;
      const filtered = role
        ? data.filter((n) => !n.target_role || n.target_role === 'all' || n.target_role === role)
        : data;
      return res.status(200).json(filtered);
    }
    if (req.method === 'POST') {
      const { title, message, target_role } = req.body;
      const { data, error } = await supabase
        .from('notifications')
        .insert({ title, message, target_role: target_role || 'all', created_at: new Date().toISOString() })
        .select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
