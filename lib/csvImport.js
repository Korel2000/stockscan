// Lightweight CSV parser (handles quoted fields with commas) and a flexible
// column-mapper for importing trades from broker exports (IBKR, Alpaca, etc).
// No external dependency — keeps bundle size small for a fairly simple format.

function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field); field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const HEADER_ALIASES = {
  symbol: ['symbol', 'ticker', 'sym'],
  side: ['side', 'direction', 'type', 'action'],
  entry: ['entry', 'entry_price', 'buy_price', 'open', 'open_price'],
  exit: ['exit', 'exit_price', 'sell_price', 'close', 'close_price'],
  qty: ['qty', 'quantity', 'shares', 'size'],
  trade_date: ['trade_date', 'date', 'closed_date', 'close_date']
};

function normalizeSide(raw) {
  const v = String(raw || '').trim().toLowerCase();
  if (['long', 'buy', 'l', 'b'].includes(v)) return 'long';
  if (['short', 'sell', 's'].includes(v)) return 'short';
  return null;
}

function normalizeDate(raw) {
  const v = String(raw || '').trim();
  if (!v) return null;
  // Already ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  // MM/DD/YYYY or M/D/YYYY
  const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const [, mo, d, y] = m;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const d = new Date(v);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

// Parses raw CSV text into { trades, errors } ready to send to /api/trades.
export function parseTradesCsv(text) {
  const rows = parseCsvText(text.trim());
  if (!rows.length) return { trades: [], errors: ['הקובץ ריק'] };

  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const colIndex = {};
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = header.findIndex((h) => aliases.includes(h));
    if (idx !== -1) colIndex[key] = idx;
  }

  const missing = Object.keys(HEADER_ALIASES).filter((k) => colIndex[k] === undefined);
  if (missing.length) {
    return { trades: [], errors: [`עמודות חסרות בקובץ: ${missing.join(', ')}`] };
  }

  const trades = [];
  const errors = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r.some((c) => c.trim() !== '')) continue;
    const symbol = (r[colIndex.symbol] || '').trim();
    const side = normalizeSide(r[colIndex.side]);
    const entry = parseFloat(r[colIndex.entry]);
    const exit = parseFloat(r[colIndex.exit]);
    const qty = parseFloat(r[colIndex.qty]);
    const trade_date = normalizeDate(r[colIndex.trade_date]);

    if (!symbol || !side || !Number.isFinite(entry) || !Number.isFinite(exit) || !Number.isFinite(qty) || !trade_date) {
      errors.push(`שורה ${i + 1}: נתונים חסרים או לא תקינים`);
      continue;
    }
    trades.push({ symbol, side, entry, exit, qty, trade_date });
  }

  return { trades, errors };
}
