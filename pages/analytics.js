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
