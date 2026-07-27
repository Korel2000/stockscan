import { useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useAppData } from '../lib/useAppData';
import AddTradeModal, { useTradeModal } from '../components/AddTradeModal';
import { useToast } from '../components/Toast';
import { parseTradesCsv } from '../lib/csvImport';
import { useLanguage } from '../lib/i18n';

export default function Journal() {
  const data = useAppData();
  const tradeModal = useTradeModal(data);
  const { toast, ToastEl } = useToast();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);

  if (!data.ready) return <Layout><div className="page" /></Layout>;

  async function del(id) {
    if (!window.confirm(t('confirmDeleteTrade'))) return;
    await data.apiFetch(`/api/trades?id=${id}`, { method: 'DELETE' });
    await data.refreshTrades();
  }

  function triggerImport() {
    if (!data.activeAccountId) { toast(t('importCsvNoAccount')); return; }
    fileInputRef.current?.click();
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const text = await file.text();
    const { trades, errors } = parseTradesCsv(text);
    if (!trades.length) { toast(errors[0] || t('importCsvError')); return; }
    if (!window.confirm(t('importCsvConfirm').replace('{n}', trades.length))) return;

    setImporting(true);
    try {
      const res = await data.apiFetch('/api/trades', {
        method: 'POST',
        body: JSON.stringify({ account_id: data.activeAccountId, trades })
      });
      await data.refreshTrades();
      toast(t('importCsvSuccess').replace('{n}', res.imported).replace('{s}', res.skipped || 0));
    } catch (err) {
      toast(err.message || t('importCsvError'));
    } finally {
      setImporting(false);
    }
  }

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page">
        <div className="page-head">
          <div><h1>{t('journalTitle')}</h1><p>{t('journalSub')}</p></div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={triggerImport} disabled={importing}>
              {importing ? t('saving') : `📥 ${t('importCsv')}`}
            </button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFile} style={{ display: 'none' }} />
            <button className="btn btn-primary" onClick={tradeModal.open}>➕ {t('addTrade')}</button>
          </div>
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
      <ToastEl />
    </Layout>
  );
}
