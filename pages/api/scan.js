import webpush from 'web-push';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { runScanForProvider } from '../../lib/scanner';

// Cron entry point — meant to be hit every 1-2 minutes by an external
// scheduler (Vercel Hobby's built-in cron only runs once/day, see README).
// For every user with a saved Trader Guard, scans their chosen provider and
// sends a real push notification for any stock with heat >= 85. Stale
// subscriptions (410/404 from the push service) are cleaned up automatically.
const HEAT_THRESHOLD = 85;

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return res.status(500).json({ error: 'VAPID keys not configured' });
  }
  webpush.setVapidDetails(
    `mailto:${process.env.ADMIN_EMAIL || 'admin@example.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  const admin = supabaseAdmin();
  const { data: guardRows, error: guardErr } = await admin.from('guard_settings').select('*');
  if (guardErr) return res.status(500).json({ error: guardErr.message });

  let notified = 0;

  for (const guard of guardRows || []) {
    const provider = guard.scanner_provider || 'demo';
    let results = [];
    try {
      results = await runScanForProvider(provider, guard.provider_api_key);
    } catch (e) {
      console.warn(`scan failed for user ${guard.user_id}:`, e.message);
      continue;
    }

    const hot = results.filter((r) => r.heat >= HEAT_THRESHOLD);
    if (!hot.length) continue;

    const { data: subs } = await admin
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', guard.user_id);
    if (!subs || !subs.length) continue;

    for (const stock of hot) {
      const payload = JSON.stringify({
        title: `⚡ ${stock.sym} פרץ ${stock.heat >= 90 ? 'חזק' : ''}`,
        body: `$${stock.price} · ${stock.chg >= 0 ? '+' : ''}${stock.chg}% · Heat ${stock.heat}`,
        url: '/scanner'
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
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
