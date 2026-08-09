import { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { useAppData } from '../lib/useAppData';
import QuoteModal from '../components/QuoteModal';
import { useToast } from '../components/Toast';
import { useLanguage } from '../lib/i18n';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export default function Scanner() {
  const data = useAppData();
  const { t } = useLanguage();
  const { toast, ToastEl } = useToast();
  const [results, setResults] = useState([]);
  const [provider, setProvider] = useState('demo');
  const [search, setSearch] = useState('');
  const [lastScan, setLastScan] = useState('');
  const [scanning, setScanning] = useState(false);
  const [dismissDisclaimer, setDismissDisclaimer] = useState(false);
  const [pushStatus, setPushStatus] = useState('unknown');
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const timerRef = useRef(null);
  const seenHotRef = useRef(new Set());

  async function runScan() {
    setScanning(true);
    try {
      const res = await data.apiFetch('/api/scan-preview');
      setResults(res.results);
      setProvider(res.provider);
      setLastScan(new Date().toLocaleTimeString('he-IL'));

      // In-app fallback: while real push isn't active (unsupported browser, or
      // just not enabled yet), surface newly-hot stocks as an in-page toast so
      // the trader still gets a signal as long as this tab stays open.
      if (pushStatus !== 'enabled') {
        const currentHot = new Set((res.results || []).filter((r) => r.heat >= 85).map((r) => r.sym));
        for (const sym of currentHot) {
          if (!seenHotRef.current.has(sym)) {
            const stock = res.results.find((r) => r.sym === sym);
            toast(`🔥 ${sym} · ${stock.chg >= 0 ? '+' : ''}${stock.chg}% · $${stock.price}`);
          }
        }
        seenHotRef.current = currentHot;
      }
    } catch (e) { /* silent - keep last results */
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    if (!data.ready) return;
    runScan();
    timerRef.current = setInterval(runScan, 15000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.ready]);

  async function enablePush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported');
      toast(t('pushFallbackNote'));
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { setPushStatus('denied'); return; }
    const reg = await navigator.serviceWorker.register('/sw.js');
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey)
    });
    await data.apiFetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ subscription: sub.toJSON() }) });
    setPushStatus('enabled');
  }

  if (!data.ready) return <Layout><div className="page" /></Layout>;

  const filtered = results.filter(r => !search || r.sym.includes(search.toUpperCase()));

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page">
        {!dismissDisclaimer && (
          <div className="panel" style={{ borderColor: 'rgba(245,158,11,.35)', background: 'rgba(245,158,11,.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
              <div>
                <strong style={{ color: 'var(--amber)' }}>{t('disclaimerTitle')}</strong>
                <p className="hint muted" style={{ marginTop: 6 }}>
                  {t('disclaimerBody')}
                </p>
              </div>
              <button onClick={() => setDismissDisclaimer(true)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', fontSize: 16 }}>✕</button>
            </div>
          </div>
        )}

        <div className="scanner-bar">
          <button className={`btn btn-ghost ${scanning ? 'btn-scanning' : ''}`} onClick={runScan} disabled={scanning}>
            {scanning ? `⏳ ${t('scan')}...` : t('scan')}
          </button>
          <span className="account-pill" style={{ color: 'var(--green)', borderColor: 'rgba(34,197,94,.3)' }}>{t('liveLabel')}</span>
          {pushStatus !== 'enabled' && (
            <button className="btn btn-primary" onClick={enablePush}>{t('enablePush')}</button>
          )}
          {pushStatus === 'enabled' && <span className="account-pill" style={{ color: 'var(--green)' }}>{t('pushActive')}</span>}
          {pushStatus === 'denied' && <span className="account-pill" style={{ color: 'var(--red)' }}>{t('pushDenied')}</span>}
          {pushStatus === 'unsupported' && <span className="account-pill" style={{ color: 'var(--amber)' }}>{t('pushUnsupported')}</span>}
          <div className="scan-title" style={{ width: '100%', order: 5 }}>
            <span className="dot" /> {t('scannerTitle')}
          </div>
        </div>
        <p className="scan-sub" style={{ textAlign: 'end', marginBottom: 16 }}>{t('realtimeScanner')} • {lastScan}</p>

        <input className="search-input" placeholder={t('searchTicker')} value={search} onChange={(e) => setSearch(e.target.value)} />

        <div style={{ marginTop: 16 }}>
          {filtered.length === 0 ? (
            <p className="scan-sub" style={{ textAlign: 'center', marginTop: 30 }}>{t('noMatch')}</p>
          ) : filtered.map((r) => (
            <div key={r.sym} className="stock-row" role="button" tabIndex={0} style={{ cursor: 'pointer' }}
              onClick={() => setSelectedSymbol(r.sym)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedSymbol(r.sym)}>
              <span className="sym">{r.sym}</span>
              <span className={`heat-pill ${r.heat >= 85 ? 'heat-hot' : r.heat >= 65 ? 'heat-warm' : 'heat-mild'}`}>🔥 {r.heat}</span>
              <span className="price">${r.price}</span>
              <span className={`chg ${r.chg >= 0 ? 'pos' : 'neg'}`}>{r.chg >= 0 ? '+' : ''}{r.chg}%</span>
              <span className="meta" style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{t('floatLabel')} {r.float}M</span>
              <span className="meta" style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{t('volLabel')} {(r.vol / 1e6).toFixed(1)}M</span>
            </div>
          ))}
        </div>

        {selectedSymbol && (
          <QuoteModal symbol={selectedSymbol} apiFetch={data.apiFetch} onClose={() => setSelectedSymbol(null)} />
        )}
        <ToastEl />

        <div className="criteria-box">
          <h3>{t('scannerCriteria')}</h3>
          <div className="criteria-grid">
            <span className="criteria-pill">{t('criteriaChange')}</span>
            <span className="criteria-pill">{t('criteriaPrice')}</span>
            <span className="criteria-pill">{t('criteriaFloat')}</span>
            <span className="criteria-pill">{t('criteriaData')}: {provider === 'demo' ? t('demoLabel') : provider === 'alpaca' ? 'Alpaca' : 'IBKR'} ●</span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
