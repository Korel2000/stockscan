import { requireApprovedUser } from '../../lib/apiAuth';

export default async function handler(req, res) {
  const auth = await requireApprovedUser(req, res);
  if (!auth) return;
  const { supabase, user } = auth;

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('guard_settings').select('*').eq('user_id', user.id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || {
      loss_streak_limit: 3, max_trades_per_day: 10, daily_loss_limit: 200,
      daily_profit_target: 500, scanner_provider: 'demo', provider_api_key: '', ibkr_gateway_url: ''
    });
  }

  if (req.method === 'POST') {
    const body = req.body;
    const { error } = await supabase.from('guard_settings').upsert({
      user_id: user.id,
      loss_streak_limit: body.loss_streak_limit,
      max_trades_per_day: body.max_trades_per_day,
      daily_loss_limit: body.daily_loss_limit,
      daily_profit_target: body.daily_profit_target,
      scanner_provider: body.scanner_provider,
      provider_api_key: body.provider_api_key,
      ibkr_gateway_url: body.ibkr_gateway_url,
      updated_at: new Date().toISOString()
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end();
}
