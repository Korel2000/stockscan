import { useState } from 'react';

export function useTradeModal(data) {
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
    if (!data.activeAccountId) { setErr('צור קודם חשבון מסחר בהגדרות'); return; }
    const { symbol, side, entry, exit, qty, date } = form;
    if (!symbol || entry === '' || exit === '' || qty === '') { setErr('נא למלא את כל השדות'); return; }
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
  if (!show) return null;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="modal-backdrop show">
      <div className="modal">
        <h2>הוספת טרייד</h2>
        <div className="grid-2">
          <div className="field"><label>סימבול</label><input value={form.symbol} onChange={set('symbol')} placeholder="AAPL" /></div>
          <div className="field">
            <label>כיוון</label>
            <select value={form.side} onChange={set('side')} style={{ width: '100%', background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 9, padding: 12 }}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="field"><label>מחיר כניסה</label><input type="number" value={form.entry} onChange={set('entry')} placeholder="0.00" /></div>
          <div className="field"><label>מחיר יציאה</label><input type="number" value={form.exit} onChange={set('exit')} placeholder="0.00" /></div>
        </div>
        <div className="grid-2">
          <div className="field"><label>כמות</label><input type="number" value={form.qty} onChange={set('qty')} placeholder="100" /></div>
          <div className="field"><label>תאריך</label><input value={form.date} onChange={set('date')} placeholder="YYYY-MM-DD" /></div>
        </div>
        {err && <p style={{ color: 'var(--red)', fontSize: 13 }}>{err}</p>}
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={save}>שמור טרייד</button>
          <button className="btn btn-ghost" onClick={close}>ביטול</button>
        </div>
      </div>
    </div>
  );
}
