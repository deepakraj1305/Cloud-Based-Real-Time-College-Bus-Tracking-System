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
      const { bus_id } = req.query;
      let q = supabase.from('bus_locations').select('*').order('updated_at', { ascending: false });
      if (bus_id) q = q.eq('bus_id', Number(bus_id));
      const { data, error } = await q;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      const { bus_id, lat, lng, speed, heading, status } = req.body;
      // upsert-like: delete existing then insert (simplest without unique constraint)
      const now = new Date().toISOString();
      const { data: existing } = await supabase.from('bus_locations').select('id').eq('bus_id', bus_id).maybeSingle();
      if (existing) {
        const { data, error } = await supabase
          .from('bus_locations')
          .update({ lat, lng, speed: speed || 0, heading: heading || 0, status: status || 'active', updated_at: now })
          .eq('bus_id', bus_id).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase
          .from('bus_locations')
          .insert({ bus_id, lat, lng, speed: speed || 0, heading: heading || 0, status: status || 'active', updated_at: now })
          .select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
