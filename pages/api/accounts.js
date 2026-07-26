import { requireApprovedUser } from '../../lib/apiAuth';

export default async function handler(req, res) {
  const auth = await requireApprovedUser(req, res);
  if (!auth) return;
  const { supabase, user } = auth;

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('accounts').select('*').order('created_at');
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { name, type, balance } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'חסר שם או סוג חשבון' });
    const { data, error } = await supabase.from('accounts').insert({
      user_id: user.id, name, type, balance: balance || 0
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end();
}
