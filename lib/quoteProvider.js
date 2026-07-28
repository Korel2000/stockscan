// Level 1 (bid/ask) quotes and OHLC bars for the candlestick chart.
// Demo mode generates a plausible synthetic random-walk so the feature is
// fully previewable without a live broker connection. Alpaca mode calls the
// real REST endpoints (latest quote + recent bars).

function seededWalk(seed, n, start) {
  let v = start;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const out = [];
  for (let i = 0; i < n; i++) {
    const drift = (rand() - 0.5) * (start * 0.02);
    const open = v;
    const close = Math.max(0.05, open + drift);
    const high = Math.max(open, close) + rand() * (start * 0.008);
    const low = Math.min(open, close) - rand() * (start * 0.008);
    out.push({ t: Date.now() - (n - i) * 5 * 60 * 1000, o: open, h: high, l: Math.max(0.01, low), c: close });
    v = close;
  }
  return out;
}

function hashSymbol(sym) {
  let h = 0;
  for (const ch of sym) h = (h * 31 + ch.charCodeAt(0)) % 100000;
  return h || 1;
}

export function generateDemoQuote(symbol) {
  const seed = hashSymbol(symbol);
  const base = 2 + (seed % 1800) / 100; // $2 - $20 range like the scanner
  const bars = seededWalk(seed, 30, base);
  const last = bars[bars.length - 1].c;
  const spread = Math.max(0.01, last * 0.002);
  return {
    symbol,
    bid: +(last - spread / 2).toFixed(2),
    ask: +(last + spread / 2).toFixed(2),
    bidSize: 100 * (1 + (seed % 9)),
    askSize: 100 * (1 + ((seed * 7) % 9)),
    last: +last.toFixed(2),
    bars: bars.map((b) => ({ t: b.t, o: +b.o.toFixed(2), h: +b.h.toFixed(2), l: +b.l.toFixed(2), c: +b.c.toFixed(2) })),
    source: 'demo'
  };
}

async function fetchAlpacaQuote(symbol, apiKey) {
  const [keyId, secret] = apiKey.split(':');
  const headers = { 'APCA-API-KEY-ID': keyId, 'APCA-API-SECRET-KEY': secret };

  const [quoteRes, barsRes] = await Promise.all([
    fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/quotes/latest`, { headers }),
    fetch(`https://data.alpaca.markets/v2/stocks/${symbol}/bars?timeframe=5Min&limit=30`, { headers })
  ]);
  if (!quoteRes.ok) throw new Error('alpaca quote http ' + quoteRes.status);
  const quoteData = await quoteRes.json();
  const q = quoteData.quote || {};
  const barsData = barsRes.ok ? await barsRes.json() : { bars: [] };
  const bars = (barsData.bars || []).map((b) => ({
    t: new Date(b.t).getTime(), o: b.o, h: b.h, l: b.l, c: b.c
  }));

  return {
    symbol,
    bid: q.bp || 0,
    ask: q.ap || 0,
    bidSize: (q.bs || 0) * 100,
    askSize: (q.as || 0) * 100,
    last: bars.length ? bars[bars.length - 1].c : (q.bp || 0),
    bars,
    source: 'alpaca'
  };
}

export async function getQuote(provider, apiKey, symbol) {
  if (provider === 'alpaca' && apiKey && apiKey.includes(':')) {
    try {
      return await fetchAlpacaQuote(symbol, apiKey);
    } catch (e) {
      console.warn('Alpaca quote fetch failed, using demo:', e.message);
      return generateDemoQuote(symbol);
    }
  }
  // IBKR requires a locally-running Gateway on the user's own machine and
  // cannot be reached from the server, so it falls back to demo here too.
  return generateDemoQuote(symbol);
}
