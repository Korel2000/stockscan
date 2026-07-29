import type { NextApiRequest, NextApiResponse } from 'next';

type BenzingaMover = {
  symbol?: string;
  companyName?: string;
  price?: number | string;
  changePercent?: number | string;
  volume?: number | string;
  shareFloat?: number | string;
  marketCap?: number | string;
};

type ScanResult = {
  sym: string;
  name: string;
  price: number;
  chg: number;
  vol: number;
  float: number;
  heat: number;
};

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function calcHeat(chg: number, vol: number, floatShares: number) {
  const chgScore = Math.min(chg, 100) * 0.55;
  const volScore = Math.min(vol / 1_000_000, 20) * 1.2;
  const floatScore = floatShares < 20_000_000 ? 18 : floatShares < 50_000_000 ? 10 : 0;
  return Math.max(1, Math.min(99, Math.round(chgScore + volScore + floatScore)));
}

function normalize(row: BenzingaMover): ScanResult | null {
  const sym = row.symbol?.trim().toUpperCase();
  const name = row.companyName?.trim() || sym || '';
  const price = toNumber(row.price);
  const chg = toNumber(row.changePercent);
  const vol = toNumber(row.volume);
  const shareFloat = toNumber(row.shareFloat);

  if (!sym || price === null || chg === null || vol === null || shareFloat === null) {
    return null;
  }

  if (shareFloat <= 0) return null;

  return {
    sym,
    name,
    price,
    chg,
    vol,
    float: Number((shareFloat / 1_000_000).toFixed(1)),
    heat: calcHeat(chg, vol, shareFloat),
  };
}

function matchesCriteria(stock: ScanResult) {
  return (
    stock.price >= 2 &&
    stock.price <= 20 &&
    stock.chg >= 20 &&
    stock.float > 0 &&
    stock.float < 20 &&
    stock.vol >= 300_000
  );
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = process.env.BENZINGA_API_KEY;

  if (!token) {
    return res.status(500).json({ error: 'Missing BENZINGA_API_KEY' });
  }

  const session =
    typeof req.query.session === 'string' && req.query.session
      ? req.query.session
      : 'PRE_MARKET';

  try {
    const url = new URL('https://api.benzinga.com/api/v1/market/movers');
    url.searchParams.set('token', token);
    url.searchParams.set('session', session);
    url.searchParams.set('maxResults', '200');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Benzinga request failed',
        details: errorText,
      });
    }

    const payload = await response.json();

    const rows: BenzingaMover[] = [
      ...(Array.isArray(payload?.movers) ? payload.movers : []),
      ...(Array.isArray(payload?.gainers) ? payload.gainers : []),
    ];

    const unique = new Map<string, ScanResult>();

    for (const row of rows) {
      const stock = normalize(row);
      if (!stock) continue;
      if (!matchesCriteria(stock)) continue;

      const existing = unique.get(stock.sym);
      if (!existing || stock.chg > existing.chg) {
        unique.set(stock.sym, stock);
      }
    }

    const results = [...unique.values()]
      .sort((a, b) => {
        if (b.heat !== a.heat) return b.heat - a.heat;
        if (b.chg !== a.chg) return b.chg - a.chg;
        return b.vol - a.vol;
      })
      .slice(0, 50);

    return res.status(200).json({
      provider: 'benzinga',
      results,
      count: results.length,
      session,
      criteria: {
        priceMin: 2,
        priceMax: 20,
        changePercentMin: 20,
        floatMaxMillions: 20,
        volumeMin: 300000,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal scanner error',
      details: error?.message || 'Unknown error',
    });
  }
}
