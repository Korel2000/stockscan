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
    await data.apiFetch(`/api/trades?id=${id}`, { method: 'DELETE' });
    await data.refreshTrades();
  }

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length}>
      <section className="page">
        <div className="page-head">
          <div><h1>{t('journalTitle')}</h1><p>{t('journalSub')}</p></div>
          <button className="btn btn-primary" onClick={tradeModal.open}>➕ {t('addTrade')}</button>
        </div>
        <div className="tabbar">
          <span className="tab">Weekly</span>
          <span className="tab">Calendar</span>
          <span className="tab active">List</span>
        </div>
        {!data.trades.length ? (
          <div className="empty-state"><div className="icon">📖</div><p>{t('noTrades')}</p></div>
        ) : (
          data.trades.map((t) => (
            <div key={t.id} className={`trade-row ${t.pnl >= 0 ? 'win' : 'loss'}`}>
              <span className="sym">{t.symbol}</span>
              <span className={`side ${t.side}`}>{t.side === 'long' ? 'Long' : 'Short'}</span>
              <span className="meta">{t.trade_date} · {t.qty} מניות · כניסה ${t.entry} → יציאה ${t.exit}</span>
              <span className={`pnl ${t.pnl >= 0 ? 'pos' : 'neg'}`}>{t.pnl >= 0 ? '+' : ''}${Number(t.pnl).toFixed(2)}</span>
              <span className="del" onClick={() => del(t.id)}>✕</span>
            </div>
          ))
        )}
      </section>
      <AddTradeModal {...tradeModal} />
    </Layout>
  );
}
