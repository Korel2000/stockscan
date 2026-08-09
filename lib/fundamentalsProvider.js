// Company profile + core financial statement data, used for the "about the
// company" section and to feed the AI assistant's executive-summary feature.
//
// Real corporate fundamentals (income statement, balance sheet) aren't part
// of Alpaca/IBKR market-data feeds already wired into this app — they need a
// separate fundamentals provider. This supports Financial Modeling Prep's
// free tier (set FMP_API_KEY) and falls back to clearly-labeled demo data
// when that's not configured, so the feature is always previewable.

function hashSymbol(sym) {
  let h = 0;
  for (const ch of sym) h = (h * 31 + ch.charCodeAt(0)) % 100000;
  return h || 1;
}

const SECTORS = ['Technology', 'Healthcare', 'Energy', 'Consumer Discretionary', 'Industrials'];

export function generateDemoFundamentals(symbol) {
  const seed = hashSymbol(symbol);
  const revenue = 5 + (seed % 200); // $M
  const netMargin = -0.15 + ((seed % 40) / 100); // can be negative — typical for small caps
  const netIncome = +(revenue * netMargin).toFixed(2);
  const sharesOut = 20 + (seed % 80); // M shares
  const eps = +(netIncome / sharesOut).toFixed(2);
  const debtToEquity = +(0.2 + (seed % 300) / 100).toFixed(2);
  const freeCashFlow = +(netIncome * (0.6 + (seed % 50) / 100)).toFixed(2);

  return {
    symbol,
    sector: SECTORS[seed % SECTORS.length],
    industry: 'Specialty ' + SECTORS[seed % SECTORS.length],
    description: `${symbol} היא חברה קטנה בשווי שוק נמוך הפעילה בתחום ${SECTORS[seed % SECTORS.length]}. (נתוני דמו סינתטיים)`,
    revenue, netIncome, eps, debtToEquity, freeCashFlow,
    source: 'demo'
  };
}

async function fetchFmpFundamentals(symbol, apiKey) {
  const [profileRes, incomeRes, ratiosRes, cashRes] = await Promise.all([
    fetch(`https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`),
    fetch(`https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=1&apikey=${apiKey}`),
    fetch(`https://financialmodelingprep.com/api/v3/ratios/${symbol}?limit=1&apikey=${apiKey}`),
    fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=1&apikey=${apiKey}`)
  ]);
  const [profile] = await profileRes.json();
  const [income] = await incomeRes.json();
  const [ratios] = await ratiosRes.json();
  const [cash] = await cashRes.json();
  if (!profile) throw new Error('No profile data returned');

  return {
    symbol,
    sector: profile.sector || '—',
    industry: profile.industry || '—',
    description: profile.description || '',
    revenue: income ? +(income.revenue / 1e6).toFixed(2) : null,
    netIncome: income ? +(income.netIncome / 1e6).toFixed(2) : null,
    eps: income?.eps ?? null,
    debtToEquity: ratios?.debtEquityRatio ?? null,
    freeCashFlow: cash ? +(cash.freeCashFlow / 1e6).toFixed(2) : null,
    source: 'fmp'
  };
}

export async function getFundamentals(symbol) {
  const fmpKey = process.env.FMP_API_KEY;
  if (fmpKey) {
    try {
      return await fetchFmpFundamentals(symbol, fmpKey);
    } catch (e) {
      console.warn('FMP fundamentals fetch failed, using demo:', e.message);
    }
  }
  return generateDemoFundamentals(symbol);
}
