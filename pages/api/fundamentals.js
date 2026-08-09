import { requireApprovedUser } from '../../lib/apiAuth';
import { getFundamentals } from '../../lib/fundamentalsProvider';

export default async function handler(req, res) {
  const auth = await requireApprovedUser(req, res);
  if (!auth) return;

  const symbol = String(req.query.symbol || '').toUpperCase().trim();
  if (!symbol) return res.status(400).json({ error: 'חסר סימבול' });

  try {
    const fundamentals = await getFundamentals(symbol);
    return res.status(200).json(fundamentals);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
