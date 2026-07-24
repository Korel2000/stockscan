const DEMO_TICKERS = ['AAPL','TSLA','NVDA','AMD','SOFI','PLTR','NIO','RIVN','GME','AMC','MARA','RIOT','SNAP','F','SIRI','LCID','CLOV','WISH','TLRY','SPY'];

export function generateDemoScan() {
  const count = 3 + Math.floor(Math.random() * 5);
  const picked = [...DEMO_TICKERS].sort(() => Math.random() - 0.5).slice(0, count);
  return picked.map(sym => {
    const price = +(2 + Math.random() * 18).toFixed(2);
    const chg = +(20 + Math.random() * 60).toFixed(1);
    const float = +(Math.random() * 20).toFixed(1);
    const heat = Math.min(99, Math.round(40 + chg / 2 + Math.random() * 20));
    return { sym, price, chg, float, heat, vol: Math.round(500000 + Math.random() * 8000000) };
  }).sort((a, b) => b.heat - a.heat);
}

export async function fetchAlpacaScan(apiKey) {
  if (!apiKey || !apiKey.includes(':')) return generateDemoScan();
  const [keyId, secret] = apiKey.split(':');
  try {
    const res = await fetch('https://data.alpaca.markets/v2/stocks/snapshots?symbols=' + DEMO_TICKERS.join(','), {
      headers: { 'APCA-API-KEY-ID': keyId, 'APCA-API-SECRET-KEY': secret }
    });
    if (!res.ok) throw new Error('alpaca http ' + res.status);
    const data = await res.json();
    return Object.entries(data).map(([sym, d]) => {
      const price = d.latestTrade ? d.latestTrade.p : 0;
      const prevClose = d.prevDailyBar ? d.prevDailyBar.c : price;
      const chg = prevClose ? +(((price - prevClose) / prevClose) * 100).toFixed(1) : 0;
      const heat = Math.min(99, Math.round(40 + Math.abs(chg)));
      return { sym, price: +price.toFixed(2), chg, float: 0, heat, vol: d.dailyBar ? d.dailyBar.v : 0 };
    }).filter(r => r.price > 0);
  } catch (e) {
    console.warn('Alpaca fetch failed, using demo data:', e.message);
    return generateDemoScan();
  }
}

export async function runScanForProvider(provider, apiKey) {
  if (provider === 'alpaca') return fetchAlpacaScan(apiKey);
  // IBKR cannot be scanned from a server — it requires a locally-running Gateway
  // on the user's own machine, so cron/server-side always falls back to demo for it.
  return generateDemoScan();
}
