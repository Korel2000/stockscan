import { requireApprovedUser } from '../../lib/apiAuth';

export default async function handler(req, res) {
  const auth = await requireApprovedUser(req, res);
  if (!auth) return;
  const { supabase, user } = auth;

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('trades').select('*').order('trade_date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    if (Array.isArray(req.body?.trades)) {
      const { account_id, trades } = req.body;
      if (!account_id) return res.status(400).json({ error: 'חסר חשבון יעד' });
      if (!trades.length) return res.status(400).json({ error: 'לא נמצאו טריידים בקובץ' });
      if (trades.length > 500) return res.status(400).json({ error: 'עד 500 טריידים בייבוא אחד' });

      const rows = [];
      const errors = [];
      trades.forEach((t, i) => {
        const { symbol, side, entry, exit, qty, trade_date } = t;
        if (!symbol || !side || entry == null || exit == null || !qty || !trade_date) {
          errors.push(`שורה ${i + 2}: חסרים שדות`);
          return;
        }
        if (side !== 'long' && side !== 'short') {
          errors.push(`שורה ${i + 2}: כיוון לא תקין (long/short)`);
          return;
        }
        const e = Number(entry), x = Number(exit), q = Number(qty);
        if (!Number.isFinite(e) || !Number.isFinite(x) || !Number.isFinite(q)) {
          errors.push(`שורה ${i + 2}: ערך מספרי לא תקין`);
          return;
        }
        const pnl = side === 'long' ? (x - e) * q : (e - x) * q;
        rows.push({
          user_id: user.id, account_id, symbol: String(symbol).toUpperCase(),
          side, entry: e, exit: x, qty: q, pnl, trade_date
        });
      });

      if (!rows.length) return res.status(400).json({ error: 'אף שורה לא תקינה לייבוא', errors });

      const { data, error } = await supabase.from('trades').insert(rows).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ imported: data.length, skipped: errors.length, errors });
    }

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
