import { createClient } from '@supabase/supabase-js';

function clientFromReq(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  return supabase;
}

export default async function handler(req, res) {
  const supabase = clientFromReq(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return res.status(401).json({ error: 'לא מחובר' });

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('trades').select('*').order('trade_date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { account_id, symbol, side, entry, exit, qty, trade_date } = req.body;
    if (!account_id || !symbol || !side || entry == null || exit == null || !qty) {
      return res.status(400).json({ error: 'חסרים שדות חובה' });
    }
    const pnl = side === 'long' ? (exit - entry) * qty : (entry - exit) * qty;
    const { data, error } = await supabase.from('trades').insert({
      user_id: user.id, account_id, symbol: symbol.toUpperCase(), side, entry, exit, qty, pnl, trade_date
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end();
}
