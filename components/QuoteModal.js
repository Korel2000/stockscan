import { useEffect, useRef, useState } from 'react';
import CandlestickChart from './CandlestickChart';
import { useLanguage } from '../lib/i18n';

const POLL_MS = 4000;
const BID_JUMP_THRESHOLD = 0.015; // 1.5% jump between polls triggers an alert

export default function QuoteModal({ symbol, onClose, apiFetch }) {
  const { t } = useLanguage();
  const [quote, setQuote] = useState(null);
  const [err, setErr] = useState('');
  const [flash, setFlash] = useState(false);
  const [fundamentals, setFundamentals] = useState(null);
  const [fundErr, setFundErr] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryErr, setSummaryErr] = useState('');
  const lastBidRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const q = await apiFetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
        if (cancelled) return;
        const prevBid = lastBidRef.current;
        if (prevBid && q.bid && (q.bid - prevBid) / prevBid >= BID_JUMP_THRESHOLD) {
          setFlash(true);
          setTimeout(() => setFlash(false), 1800);
          if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
            new Notification(t('bidJumpTitle'), { body: t('bidJumpBody').replace('{symbol}', symbol).replace('{price}', q.bid), icon: '/icons/icon-192.png' });
          }
        }
        lastBidRef.current = q.bid;
        setQuote(q);
        setErr('');
      } catch (e) {
        if (!cancelled) setErr(e.message || t('quoteError'));
      }
    }

    poll();
    timerRef.current = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(timerRef.current); };
  }, [symbol, apiFetch, t]);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/api/fundamentals?symbol=${encodeURIComponent(symbol)}`)
      .then((f) => { if (!cancelled) setFundamentals(f); })
      .catch((e) => { if (!cancelled) setFundErr(e.message || ''); });
    return () => { cancelled = true; };
  }, [symbol, apiFetch]);

  async function getAiSummary() {
    if (!fundamentals) return;
    setSummaryLoading(true);
    setSummaryErr('');
    try {
      const context = [
        `סימבול: ${fundamentals.symbol}`,
        `ענף: ${fundamentals.sector} · תעשייה: ${fundamentals.industry}`,
        fundamentals.description,
        `הכנסות: $${fundamentals.revenue}M · רווח נקי: $${fundamentals.netIncome}M · EPS: ${fundamentals.eps}`,
        `חוב/הון: ${fundamentals.debtToEquity} · תזרים מזומנים חופשי: $${fundamentals.freeCashFlow}M`
      ].join('\n');
      const res = await apiFetch('/api/assistant', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: `תן לי סיכום מנהלים קצר על ${symbol} בהתבסס על הנתונים שסופקו.` }],
          context
        })
      });
      setSummary(res.reply);
    } catch (e) {
      setSummaryErr(e.message || t('quoteError'));
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="modal-backdrop show" onClick={onClose}>
      <div className={`modal quote-modal ${flash ? 'bid-flash' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="quote-modal-head">
          <h2>{symbol} · {t('quoteTitle')}</h2>
          <span className="del" role="button" tabIndex={0} aria-label={t('cancel')} onClick={onClose}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClose()}>✕</span>
        </div>

        {err && <p className="assistant-err">{err}</p>}

        {!quote ? (
          <p className="hint muted">{t('quoteLoading')}</p>
        ) : (
          <>
            <div className="quote-l1-grid">
              <div className="quote-l1-cell bid">
                <div className="quote-l1-label">{t('bidLabel')}</div>
                <div className="quote-l1-value">${quote.bid}</div>
                <div className="quote-l1-size">{quote.bidSize} {t('sharesLabel')}</div>
              </div>
              <div className="quote-l1-cell ask">
                <div className="quote-l1-label">{t('askLabel')}</div>
                <div className="quote-l1-value">${quote.ask}</div>
                <div className="quote-l1-size">{quote.askSize} {t('sharesLabel')}</div>
              </div>
            </div>
            <p className="hint muted" style={{ margin: '10px 0 16px', textAlign: 'center' }}>
              {t('spreadLabel')}: ${(quote.ask - quote.bid).toFixed(2)}
            </p>

            <CandlestickChart bars={quote.bars} />

            {quote.source === 'demo' && <p className="quote-demo-note">{t('quoteDemoNote')}</p>}

            {fundamentals && (
              <div className="fundamentals-box">
                <h3>{t('aboutTitle')}</h3>
                <p className="hint muted" style={{ marginBottom: 10 }}>{fundamentals.description}</p>
                <div className="fundamentals-grid">
                  <div className="fundamentals-cell"><span>{t('sectorLabel')}</span><b>{fundamentals.sector}</b></div>
                  <div className="fundamentals-cell"><span>{t('revenueLabel')}</span><b>${fundamentals.revenue}M</b></div>
                  <div className="fundamentals-cell"><span>{t('netIncomeLabel')}</span><b>${fundamentals.netIncome}M</b></div>
                  <div className="fundamentals-cell"><span>EPS</span><b>{fundamentals.eps}</b></div>
                  <div className="fundamentals-cell"><span>{t('debtEquityLabel')}</span><b>{fundamentals.debtToEquity}</b></div>
                  <div className="fundamentals-cell"><span>{t('fcfLabel')}</span><b>${fundamentals.freeCashFlow}M</b></div>
                </div>
                {fundamentals.source === 'demo' && <p className="quote-demo-note">{t('quoteDemoNote')}</p>}

                {!summary && (
                  <button className="btn btn-ghost" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} onClick={getAiSummary} disabled={summaryLoading}>
                    {summaryLoading ? t('saving') : `🤖 ${t('aiSummaryBtn')}`}
                  </button>
                )}
                {summaryErr && <p className="assistant-err">{summaryErr}</p>}
                {summary && <div className="ai-summary-box">{summary}</div>}
              </div>
            )}
            {fundErr && !fundamentals && <p className="hint muted" style={{ marginTop: 10 }}>{fundErr}</p>}
          </>
        )}
      </div>
    </div>
  );
}
