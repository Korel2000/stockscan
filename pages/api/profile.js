import { clientFromReq } from '../../lib/apiAuth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end();
  }

  const supabase = clientFromReq(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return res.status(401).json({ error: 'לא מחובר' });

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('approved')
    .eq('id', user.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const isAdmin = !!adminEmail && (user.email || '').toLowerCase().trim() === adminEmail;

  return res.status(200).json({
    email: user.email,
    approved: !!profile?.approved,
    isAdmin
  });
}
