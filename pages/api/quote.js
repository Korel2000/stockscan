import { requireApprovedUser } from '../../lib/apiAuth';
import { getQuote } from '../../lib/quoteProvider';

export default async function handler(req, res) {
  const auth = await requireApprovedUser(req, res);
  if (!auth) return;
  const { supabase, user } = auth;

  const symbol = String(req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ error: 'חסר סימבול' });

  const { data: guard } = await supabase.from('guard_settings').select('scanner_provider, provider_api_key').eq('user_id', user.id).maybeSingle();
  const provider = guard?.scanner_provider || 'demo';

  try {
    const quote = await getQuote(provider, guard?.provider_api_key, symbol);
    return res.status(200).json(quote);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
