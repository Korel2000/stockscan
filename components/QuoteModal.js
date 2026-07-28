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
          </>
        )}
      </div>
    </div>
  );
}
