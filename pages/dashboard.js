import Layout from '../components/Layout';
import { useAppData } from '../lib/useAppData';
import AddTradeModal, { useTradeModal } from '../components/AddTradeModal';
import { useLanguage } from '../lib/i18n';

function StatCard({ icon, label, value, sub, tone }) {
  const cls = tone === 'pos' ? 'pos' : tone === 'neg' ? 'neg' : '';
  return (
    <div className={`stat-card ${cls}`}>
      <div className="stat-top"><span className="stat-icon">{icon}</span>{label}</div>
      <div className={`stat-value ${cls}`}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const data = useAppData();
  const tradeModal = useTradeModal(data);
  const { t } = useLanguage();

  if (!data.ready) return <Layout><div className="page" /></Layout>;

  const trades = data.trades;
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const todayTrades = trades.filter(t => t.trade_date === today);
  const weekTrades = trades.filter(t => t.trade_date >= weekAgo);
  const todayPnl = todayTrades.reduce((s, t) => s + Number(t.pnl), 0);
  const weekPnl = weekTrades.reduce((s, t) => s + Number(t.pnl), 0);
  const wins = trades.filter(t => t.pnl > 0).length;
  const winRate = trades.length ? Math.round((wins / trades.length) * 100) : 0;
  let streak = 0;
  for (const t of trades) { if (t.pnl < 0) streak++; else break; }

  const fmt = (v) => (v >= 0 ? '$' : '-$') + Math.abs(v).toFixed(2);

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page">
        <div className="page-head">
          <div><h1>{t('dashTitle')}</h1><p>{t('dashSub')}</p></div>
        </div>
        <div className="stat-grid">
          <StatCard icon="⚡" label={t('weekPnl')} value={fmt(weekPnl)} sub={t('last7days')} tone={weekPnl > 0 ? 'pos' : weekPnl < 0 ? 'neg' : ''} />
          <StatCard icon="🎯" label={t('lossStreak')} value={streak} sub={`${t('limit')}: ${data.guard?.loss_streak_limit ?? 3}`} />
          <StatCard icon="🔁" label={t('tradesToday')} value={todayTrades.length} sub={`${t('outOfMax')} ${data.guard?.max_trades_per_day ?? 10} ${t('maxWord')}`} />
          <StatCard icon="📈" label={t('todayPnl')} value={fmt(todayPnl)} sub={t('allAccounts')} tone={todayPnl > 0 ? 'pos' : todayPnl < 0 ? 'neg' : ''} />
          <StatCard icon="⚡" label={t('winRate')} value={winRate + '%'} sub={t('winRateSub')} tone={trades.length ? (winRate >= 50 ? 'pos' : 'neg') : ''} />
          <StatCard icon="🔁" label={t('totalTrades')} value={trades.length} sub={t('allTime')} />
        </div>
        <div className="panel">
          <h2>{t('quickActions')}</h2>
          <div className="quick-actions">
            <a className="qa-btn" href="/settings">⚙<span>{t('settings')}</span></a>
            <a className="qa-btn" href="/journal">📖<span>{t('journal')}</span></a>
            <button className="qa-btn primary" onClick={tradeModal.open}>➕<span>{t('addTrade')}</span></button>
          </div>
        </div>
      </section>
      <AddTradeModal {...tradeModal} />
    </Layout>
  );
}
