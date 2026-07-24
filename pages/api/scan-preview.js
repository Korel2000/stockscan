import { createClient } from '@supabase/supabase-js';
import { runScanForProvider } from '../../lib/scanner';

function clientFromReq(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}

export default async function handler(req, res) {
  const supabase = clientFromReq(req);
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return res.status(401).json({ error: 'לא מחובר' });

  const { data: guard } = await supabase.from('guard_settings').select('*').eq('user_id', user.id).maybeSingle();
  const provider = guard?.scanner_provider || 'demo';
  const results = await runScanForProvider(provider, guard?.provider_api_key);
  return res.status(200).json({ provider, results });
}
