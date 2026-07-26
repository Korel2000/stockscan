import webpush from 'web-push';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { runScanForProvider } from '../../lib/scanner';

// This endpoint is meant to be called by an external scheduler every 1-5 minutes
// (e.g. cron-job.org, or Vercel Cron on a paid plan) — NOT by the browser.
// Protect it with a shared secret so random visitors can't trigger it or drain your API quota.
export default async function handler(req, res) {
  const secret = req.query.secret || req.headers['x-cron-secret'];
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  webpush.setVapidDetails(
    'mailto:alerts@stockscan.app',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const admin = supabaseAdmin();
  const { data: approvedProfiles, error: profErr } = await admin
    .from('profiles')
    .select('id')
    .eq('approved', true);
  if (profErr) return res.status(500).json({ error: profErr.message });
  const approvedIds = (approvedProfiles || []).map((p) => p.id);
  if (!approvedIds.length) {
    return res.status(200).json({ ok: true, usersScanned: 0, notificationsSent: 0 });
  }

  const { data: guardRows, error } = await admin
    .from('guard_settings')
    .select('*')
    .in('user_id', approvedIds);
  if (error) return res.status(500).json({ error: error.message });

  let notified = 0;
  const results = {};

  for (const guard of guardRows || []) {
    const provider = guard.scanner_provider || 'demo';
    const cacheKey = provider + ':' + (guard.provider_api_key || '');
    if (!results[cacheKey]) {
      results[cacheKey] = await runScanForProvider(provider, guard.provider_api_key);
    }
    const hot = results[cacheKey].filter(r => r.heat >= 85);
    if (!hot.length) continue;

    const { data: subs } = await admin.from('push_subscriptions').select('*').eq('user_id', guard.user_id);
    for (const sub of subs || []) {
      for (const stock of hot.slice(0, 3)) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify({
              title: `מניה חמה 🔥 ${stock.sym}`,
              body: `${stock.sym} · ${stock.chg >= 0 ? '+' : ''}${stock.chg}% · $${stock.price} · Heat ${stock.heat}`,
              url: '/scanner'
            })
          );
          notified++;
        } catch (e) {
          if (e.statusCode === 410 || e.statusCode === 404) {
            await admin.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
          } else {
            console.warn('push failed:', e.message);
          }
        }
      }
    }
  }

  return res.status(200).json({ ok: true, usersScanned: (guardRows || []).length, notificationsSent: notified });
}
