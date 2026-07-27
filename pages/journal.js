import Layout from '../components/Layout';
import { useAppData } from '../lib/useAppData';
import AddTradeModal, { useTradeModal } from '../components/AddTradeModal';
import { useLanguage } from '../lib/i18n';

export default function Journal() {
  const data = useAppData();
  const tradeModal = useTradeModal(data);
  const { t } = useLanguage();

  if (!data.ready) return <Layout><div className="page" /></Layout>;

  async function del(id) {
    if (!window.confirm(t('confirmDeleteTrade'))) return;
    await data.apiFetch(`/api/trades?id=${id}`, { method: 'DELETE' });
    await data.refreshTrades();
  }

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page">
        <div className="page-head">
          <div><h1>{t('journalTitle')}</h1><p>{t('journalSub')}</p></div>
          <button className="btn btn-primary" onClick={tradeModal.open}>➕ {t('addTrade')}</button>
        </div>
        <div className="tabbar">
          <span className="tab">{t('weekly')}</span>
          <span className="tab">{t('calendar')}</span>
          <span className="tab active">{t('listView')}</span>
        </div>
        {!data.trades.length ? (
          <div className="empty-state"><div className="icon">📖</div><p>{t('noTrades')}</p></div>
        ) : (
          data.trades.map((trade) => (
            <div key={trade.id} className={`trade-row ${trade.pnl >= 0 ? 'win' : 'loss'}`}>
              <span className="sym">{trade.symbol}</span>
              <span className={`side ${trade.side}`}>{trade.side === 'long' ? t('long') : t('short')}</span>
              <span className="meta">{trade.trade_date} · {trade.qty} מניות · כניסה ${trade.entry} → יציאה ${trade.exit}</span>
              <span className={`pnl ${trade.pnl >= 0 ? 'pos' : 'neg'}`}>{trade.pnl >= 0 ? '+' : ''}${Number(trade.pnl).toFixed(2)}</span>
              <span className="del" role="button" tabIndex={0} aria-label={t('confirmDeleteTrade')}
                onClick={() => del(trade.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && del(trade.id)}>✕</span>
            </div>
          ))
        )}
      </section>
      <AddTradeModal {...tradeModal} />
    </Layout>
  );
}
