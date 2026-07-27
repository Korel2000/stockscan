import Layout from '../components/Layout';
import { useAppData } from '../lib/useAppData';
import { useLanguage } from '../lib/i18n';

export default function Analytics() {
  const data = useAppData();
  const { t } = useLanguage();
  if (!data.ready) return <Layout><div className="page" /></Layout>;

  const trades = data.trades;
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  const avgWin = wins.length ? wins.reduce((s, t) => s + Number(t.pnl), 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0) / losses.length) : 0;
  const grossWin = wins.reduce((s, t) => s + Number(t.pnl), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + Number(t.pnl), 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : 0;
  const winRate = trades.length ? (wins.length / trades.length) * 100 : 0;
  const totalPnl = trades.reduce((s, t) => s + Number(t.pnl), 0);
  const tradingDays = new Set(trades.map(t => t.trade_date)).size;

  const sorted = [...trades].sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date));
  let running = 0, peak = 0, maxDrawdown = 0;
  for (const tr of sorted) {
    running += Number(tr.pnl);
    if (running > peak) peak = running;
    const dd = peak - running;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const bySymbol = {};
  for (const tr of trades) {
    const s = tr.symbol;
    if (!bySymbol[s]) bySymbol[s] = { symbol: s, count: 0, wins: 0, pnl: 0 };
    bySymbol[s].count += 1;
    bySymbol[s].pnl += Number(tr.pnl);
    if (Number(tr.pnl) > 0) bySymbol[s].wins += 1;
  }
  const topSymbols = Object.values(bySymbol).sort((a, b) => b.pnl - a.pnl).slice(0, 8);

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page">
        <div className="page-head">
          <div><h1>{t('analyticsTitle')}</h1><p>{t('analyticsSub')}</p></div>
        </div>
        <h2 style={{ fontSize: 15, marginBottom: 14 }}>{t('performanceOverview')} <span style={{ color: 'var(--blue)' }}>●</span></h2>
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <div className="stat-card"><div className="stat-top">📊 {t('avgWinLoss')}</div><div className="stat-value" style={{ fontSize: 20 }}>${avgWin.toFixed(2)} / ${avgLoss.toFixed(2)}</div><div className="stat-sub">Per trade average</div></div>
          <div className="stat-card"><div className="stat-top">⚖️ {t('profitFactor')}</div><div className="stat-value">{profitFactor.toFixed(2)}</div><div className="stat-sub">Risk/Reward ratio</div></div>
          <div className="stat-card"><div className="stat-top">🎯 {t('winRate')}</div><div className="stat-value">{winRate.toFixed(2)}%</div><div className="stat-sub">{t('tradingDays')} {tradingDays}</div></div>
          <div className="stat-card"><div className="stat-top">💲 {t('totalPnl')}</div><div className="stat-value" style={{ color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{totalPnl >= 0 ? '$' : '-$'}{Math.abs(totalPnl).toFixed(2)}</div><div className="stat-sub">{t('trades')} {trades.length}</div></div>
        </div>
        {!!trades.length && (
          <>
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(1,1fr)', marginTop: 4 }}>
              <div className="stat-card"><div className="stat-top">📉 {t('maxDrawdown')}</div><div className="stat-value" style={{ color: 'var(--red)' }}>-${maxDrawdown.toFixed(2)}</div><div className="stat-sub">{t('maxDrawdownSub')}</div></div>
            </div>
            <div className="panel" style={{ marginTop: 16 }}>
              <h2 style={{ textAlign: 'end' }}>{t('topSymbols')}</h2>
              <p className="hint muted" style={{ textAlign: 'end' }}>{t('topSymbolsSub')}</p>
              {topSymbols.map((s) => (
                <div key={s.symbol} className="trade-row" style={{ borderInlineStartColor: s.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  <span className="sym">{s.symbol}</span>
                  <span className="meta">{s.count} {t('trades')} · {Math.round((s.wins / s.count) * 100)}% {t('winRate')}</span>
                  <span className={`pnl ${s.pnl >= 0 ? 'pos' : 'neg'}`}>{s.pnl >= 0 ? '+' : ''}${Math.abs(s.pnl).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {!trades.length && (
          <div className="empty-state" style={{ marginTop: 20 }}>
            <div className="icon">📉</div>
            <p>{t('noAnalyticsData')}</p>
          </div>
        )}
      </section>
    </Layout>
  );
}
