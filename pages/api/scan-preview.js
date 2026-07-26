import { runScanForProvider } from '../../lib/scanner';
import { requireApprovedUser } from '../../lib/apiAuth';

export default async function handler(req, res) {
  const auth = await requireApprovedUser(req, res);
  if (!auth) return;
  const { supabase, user } = auth;

  const { data: guard } = await supabase.from('guard_settings').select('*').eq('user_id', user.id).maybeSingle();
  const provider = guard?.scanner_provider || 'demo';
  const results = await runScanForProvider(provider, guard?.provider_api_key);
  return res.status(200).json({ provider, results });
}
