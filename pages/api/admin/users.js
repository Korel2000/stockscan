import { requireAdmin } from '../../../lib/apiAuth';
import { supabaseAdmin } from '../../../lib/supabaseAdmin';

// Admin-only: list all signed-up users and approve/revoke access.
// Protected by ADMIN_EMAIL (server-side env var) — see requireAdmin in lib/apiAuth.js.
export default async function handler(req, res) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const db = supabaseAdmin();

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('profiles')
      .select('id, email, approved, created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { id, approved } = req.body;
    if (!id || typeof approved !== 'boolean') {
      return res.status(400).json({ error: 'חסר id או approved' });
    }
    const { error } = await db.from('profiles').update({ approved }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end();
}
