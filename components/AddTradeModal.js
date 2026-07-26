import { useState } from 'react';
import { useLanguage } from '../lib/i18n';

export function useTradeModal(data) {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ symbol: '', side: 'long', entry: '', exit: '', qty: '', date: new Date().toISOString().slice(0, 10) });
  const [err, setErr] = useState('');

  function open() {
    setForm({ symbol: '', side: 'long', entry: '', exit: '', qty: '', date: new Date().toISOString().slice(0, 10) });
    setErr('');
    setShow(true);
  }
  function close() { setShow(false); }

  async function save() {
    if (!data.activeAccountId) { setErr(t('createAccountFirst')); return; }
    const { symbol, side, entry, exit, qty, date } = form;
    if (!symbol || entry === '' || exit === '' || qty === '') { setErr(t('fillAllFields')); return; }
    try {
      await data.apiFetch('/api/trades', {
        method: 'POST',
        body: JSON.stringify({
          account_id: data.activeAccountId, symbol, side,
          entry: parseFloat(entry), exit: parseFloat(exit), qty: parseFloat(qty), trade_date: date
        })
      });
      await data.refreshTrades();
      setShow(false);
    } catch (e) {
      setErr(e.message);
    }
  }

  return { show, form, setForm, err, open, close, save };
}

export default function AddTradeModal({ show, form, setForm, err, close, save }) {
  const { t } = useLanguage();
  if (!show) return null;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="modal-backdrop show">
      <div className="modal">
        <h2>{t('addTradeTitle')}</h2>
        <div className="grid-2">
          <div className="field"><label>{t('symbolLabel')}</label><input value={form.symbol} onChange={set('symbol')} placeholder="AAPL" /></div>
          <div className="field">
            <label>{t('sideLabel')}</label>
            <select value={form.side} onChange={set('side')} style={{ width: '100%', background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 9, padding: 12 }}>
              <option value="long">{t('long')}</option>
              <option value="short">{t('short')}</option>
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="field"><label>{t('entryPrice')}</label><input type="number" value={form.entry} onChange={set('entry')} placeholder="0.00" /></div>
          <div className="field"><label>{t('exitPrice')}</label><input type="number" value={form.exit} onChange={set('exit')} placeholder="0.00" /></div>
        </div>
        <div className="grid-2">
          <div className="field"><label>{t('qtyLabel')}</label><input type="number" value={form.qty} onChange={set('qty')} placeholder="100" /></div>
          <div className="field"><label>{t('dateLabel')}</label><input value={form.date} onChange={set('date')} placeholder="YYYY-MM-DD" /></div>
        </div>
        {err && <p style={{ color: 'var(--red)', fontSize: 13 }}>{err}</p>}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>{t('saveTrade')}</button>
          <button className="btn btn-ghost" onClick={close}>{t('cancel')}</button>
        </div>
      </div>
    </div>
  );
}
