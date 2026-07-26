import { createClient } from '@supabase/supabase-js';

export function clientFromReq(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}

// Authenticates the request and makes sure the user has been manually approved.
// On failure this writes the response itself (401/403) and returns null —
// callers should just `return` when they get null back.
export async function requireApprovedUser(req, res) {
  const supabase = clientFromReq(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    res.status(401).json({ error: 'לא מחובר' });
    return null;
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('approved')
    .eq('id', user.id)
    .maybeSingle();

  if (profileErr || !profile?.approved) {
    res.status(403).json({ error: 'החשבון ממתין לאישור', code: 'not_approved' });
    return null;
  }

  return { supabase, user };
}

// Admin gate for the /api/admin/* routes — checks the caller's email against
// the ADMIN_EMAIL env var (server-side only, never exposed to the client).
export async function requireAdmin(req, res) {
  const supabase = clientFromReq(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    res.status(401).json({ error: 'לא מחובר' });
    return null;
  }
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  if (!adminEmail || (user.email || '').toLowerCase().trim() !== adminEmail) {
    res.status(403).json({ error: 'אין הרשאה' });
    return null;
  }
  return { user };
}
