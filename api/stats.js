import supabase from './db-client.js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const today = new Date().toISOString().slice(0, 10);
    const [buses, students, drivers, routes, trips, alerts] = await Promise.all([
      supabase.from('buses').select('id, status'),
      supabase.from('students').select('id'),
      supabase.from('drivers').select('id, status'),
      supabase.from('routes').select('id'),
      supabase.from('trips').select('id, status, trip_date'),
      supabase.from('emergency_alerts').select('id, status'),
    ]);
    const tripsToday = (trips.data || []).filter((t) => t.trip_date === today);
    res.status(200).json({
      total_buses: buses.data?.length || 0,
      active_buses: (buses.data || []).filter((b) => b.status === 'active').length,
      total_students: students.data?.length || 0,
      total_drivers: drivers.data?.length || 0,
      total_routes: routes.data?.length || 0,
      trips_today: tripsToday.length,
      active_trips: (trips.data || []).filter((t) => t.status === 'in_progress').length,
      total_trips: trips.data?.length || 0,
      active_alerts: (alerts.data || []).filter((a) => a.status === 'active').length,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
