import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useAppData } from '../lib/useAppData';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';

export default function Settings() {
  const data = useAppData();
  const router = useRouter();
  const { toast, ToastEl } = useToast();
  const { t } = useLanguage();
  const [guardForm, setGuardForm] = useState(null);
  const [newAcc, setNewAcc] = useState({ name: '', type: 'demo', balance: '' });
  const [showAccModal, setShowAccModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [dismissTip, setDismissTip] = useState(false);

  useEffect(() => { if (data.guard) setGuardForm(data.guard); }, [data.guard]);

  if (!data.ready || !guardForm) return <Layout><div className="page" /></Layout>;

  async function saveGuard() {
    setSaving(true);
    try {
      await data.apiFetch('/api/settings', { method: 'POST', body: JSON.stringify(guardForm) });
      toast('ההגדרות נשמרו');
    } finally {
      setSaving(false);
    }
  }

  async function createAccount() {
    if (!newAcc.name.trim()) { toast('נא להזין שם חשבון'); return; }
    await data.apiFetch('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({ name: newAcc.name, type: newAcc.type, balance: parseFloat(newAcc.balance) || 0 })
    });
    await data.refreshAccounts();
    setShowAccModal(false);
    setNewAcc({ name: '', type: 'demo', balance: '' });
    toast('החשבון נוצר');
  }

  async function deleteAccount(id) {
    if (data.accounts.length === 1) { toast('חייב להישאר לפחות חשבון אחד'); return; }
    if (!window.confirm(t('confirmDeleteAccount'))) return;
    await data.apiFetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
    await data.refreshAccounts();
  }

  async function connectGoogle() {
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/settings` : undefined }
      });
      if (error) throw error;
    } catch (e) {
      toast(e.message || t('connectError'));
    }
  }

  async function signOutNow() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function sendTestNotif() {
    if (Notification.permission === 'granted') {
      new Notification('בדיקת התראה 🔔', { body: 'זו התראת בדיקה מ-StockScan', icon: '/icons/icon-192.png' });
    } else {
      toast('צריך קודם להפעיל התראות בעמוד הסורק');
    }
  }

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page">
        <div className="page-head"><div><h1>{t('settingsTitle')}</h1><p>{t('settingsSub')}</p></div></div>

        <div className="profile-card">
          <div className="profile-top">
            <div className="profile-avatar">{(data.user?.email || '?')[0].toUpperCase()}</div>
            <div className="profile-name-wrap">
              <div className="profile-name">{data.user?.email}</div>
              <span className="profile-badge">{data.profile?.isAdmin ? t('adminTitle') : t('accountLabel')}</span>
            </div>
          </div>
          <div className="profile-stats">
            <div className="profile-stat"><div className="profile-stat-num">{data.accounts.length}</div><div className="profile-stat-label">{t('tradingAccounts')}</div></div>
            <div className="profile-stat"><div className="profile-stat-num">{data.trades.length}</div><div className="profile-stat-label">{t('trades')}</div></div>
            <div className="profile-stat"><div className="profile-stat-num">{data.trades.length ? Math.round((data.trades.filter(tr => tr.pnl > 0).length / data.trades.length) * 100) : 0}%</div><div className="profile-stat-label">{t('winRate')}</div></div>
          </div>
        </div>

        <div className="profile-shortcuts">
          <a className="shortcut-card" href="#accounts-panel">
            <span className="shortcut-icon">💼</span>
            <div className="shortcut-title">{t('tradingAccounts')}</div>
            <div className="shortcut-sub">{t('shortcutAccountsSub')}</div>
          </a>
          <Link className="shortcut-card" href="/assistant">
            <span className="shortcut-icon">🤖</span>
            <div className="shortcut-title">{t('assistantTitle')}</div>
            <div className="shortcut-sub">{t('shortcutAssistantSub')}</div>
          </Link>
        </div>

        {!dismissTip && (
          <div className="tip-card">
            <button className="tip-close" onClick={() => setDismissTip(true)} aria-label={t('cancel')}>✕</button>
            <h3>{t('tipTitle')}</h3>
            <p>{t('tipBody')}</p>
            <Link href="/journal" className="tip-btn">‹ {t('journalTitle')}</Link>
          </div>
        )}

        <div className="menu-list">
          <a className="menu-row" href="#guard-panel"><span>{t('traderGuard')}</span><span className="menu-icon">⚙️</span></a>
          <a className="menu-row" href="#datasource-panel"><span>{t('dataSource')}</span><span className="menu-icon">🔌</span></a>
          <a className="menu-row" href="#push-panel"><span>{t('pushNotifications')}</span><span className="menu-icon">🔔</span></a>
          <div className="menu-row" role="button" tabIndex={0} onClick={connectGoogle} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && connectGoogle()}>
            <span>{t('connectGoogleBtn')}</span><span className="menu-icon">🔗</span>
          </div>
          <div className="menu-row danger" role="button" tabIndex={0} onClick={signOutNow} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && signOutNow()}>
            <span>{t('signOut')}</span><span className="menu-icon">↪</span>
          </div>
        </div>

        <div className="panel" id="push-panel">
          <h2 style={{ textAlign: 'end' }}>{t('pushNotifications')}</h2>
          <p className="hint" style={{ textAlign: 'end' }}>תקבל התראות Push כאשר מניה חמה (Heat ≥ 85) מופיעה בסורק — גם כשהאפליקציה סגורה, לאחר שהופעל בעמוד הסורק.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={sendTestNotif}>{t('sendTest')}</button>
            <a className="btn btn-ghost" href="/scanner">להפעלה → עמוד הסורק</a>
          </div>
        </div>

        <div className="panel" id="guard-panel">
          <h2 style={{ textAlign: 'end' }}>{t('traderGuard')}</h2>
          <p className="hint" style={{ textAlign: 'end' }}>הגדר את מגבלות ניהול הסיכון. תקבל התראות כשמגיעים לסף.</p>
          <Slider label={t('lossStreakLimit')} value={guardForm.loss_streak_limit} min={1} max={10}
            onChange={(v) => setGuardForm({ ...guardForm, loss_streak_limit: v })}
            desc={t('lossStreakDesc')} />
          <Slider label={t('maxTradesPerDay')} value={guardForm.max_trades_per_day} min={1} max={30}
            onChange={(v) => setGuardForm({ ...guardForm, max_trades_per_day: v })}
            desc={t('maxTradesDesc')} />
          <Slider label={t('dailyLossLimit')} value={guardForm.daily_loss_limit} min={10} max={2000} step={10}
            onChange={(v) => setGuardForm({ ...guardForm, daily_loss_limit: v })}
            desc={t('dailyLossDesc')} />
          <Slider label={t('dailyProfitTarget')} value={guardForm.daily_profit_target} min={10} max={5000} step={10}
            onChange={(v) => setGuardForm({ ...guardForm, daily_profit_target: v })}
            desc={t('dailyProfitDesc')} />
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={saveGuard} disabled={saving}>{saving ? t('saving') : t('saveChanges')}</button>
            <button className="btn btn-ghost" onClick={() => setGuardForm(data.guard)}>{t('reset')}</button>
          </div>
        </div>

        <div className="panel" id="accounts-panel">
          <h2 style={{ textAlign: 'end' }}>{t('tradingAccounts')}</h2>
          <p className="hint" style={{ textAlign: 'end' }}>כמה חשבונות (Live / Demo) — לכל אחד נתונים נפרדים בדשבורד וביומן.</p>
          {data.accounts.map((a) => (
            <div key={a.id} className="account-card">
              <span className="del" role="button" tabIndex={0} aria-label={t('confirmDeleteAccount')}
                onClick={() => deleteAccount(a.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && deleteAccount(a.id)}
                style={{ color: 'var(--text-faint)', cursor: 'pointer' }}>✕</span>
              <div style={{ textAlign: 'end' }}>
                <span className={`atype ${a.type}`}>{a.type === 'live' ? t('liveLabel') : t('demoLabel')}</span>
                <div className="aname">{a.name}</div>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 10, justifyContent: 'center' }} onClick={() => setShowAccModal(true)}>{t('addAccount')}</button>
        </div>

        <div className="panel" id="datasource-panel">
          <h2 style={{ textAlign: 'end' }}>{t('dataSource')}</h2>
          <p className="hint muted" style={{ textAlign: 'end' }}>בחר את מקור הנתונים לסריקת מניות בזמן אמת.</p>
          <div className="provider-row">
            {['ibkr', 'alpaca', 'demo'].map((p) => (
              <div key={p} className={`provider-opt ${guardForm.scanner_provider === p ? 'selected' : ''}`}
                role="button" tabIndex={0}
                onClick={() => setGuardForm({ ...guardForm, scanner_provider: p })}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setGuardForm({ ...guardForm, scanner_provider: p })}
                style={{ cursor: 'pointer' }}>
                {p === 'ibkr' ? 'IBKR' : p === 'alpaca' ? 'Alpaca' : t('demoLabel')}
              </div>
            ))}
          </div>
          {guardForm.scanner_provider === 'alpaca' && (
            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="alpaca-key">Alpaca API Key:Secret</label>
              <input id="alpaca-key" value={guardForm.provider_api_key || ''} onChange={(e) => setGuardForm({ ...guardForm, provider_api_key: e.target.value })} placeholder="KEY_ID:SECRET_KEY" />
              <p className="desc">עובד ישירות מהדפדפן — נתונים אמיתיים מהשוק.</p>
            </div>
          )}
          {guardForm.scanner_provider === 'ibkr' && (
            <div className="field" style={{ marginTop: 14 }}>
              <label htmlFor="ibkr-gateway">כתובת IB Gateway / Client Portal Gateway המקומי</label>
              <input id="ibkr-gateway" value={guardForm.ibkr_gateway_url || ''} onChange={(e) => setGuardForm({ ...guardForm, ibkr_gateway_url: e.target.value })} placeholder="https://localhost:5000" />
              <p className="desc">
                דורש הרצה של IB Gateway פעיל על המחשב שלך, עם התחברות ידנית ואישור 2FA.
                עובד רק כשהוא פעיל על אותה רשת שבה נמצא המכשיר שגולש כאן — לא ניתן להריץ את זה מהענן בלי מחשב שלך פועל.
              </p>
            </div>
          )}
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={saveGuard} disabled={saving}>{saving ? t('saving') : t('saveDataSource')}</button>
        </div>

      </section>

      {showAccModal && (
        <div className="modal-backdrop show">
          <div className="modal">
            <h2 style={{ textAlign: 'end' }}>יצירת חשבון</h2>
            <div className="field"><input value={newAcc.name} onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })} placeholder="שם החשבון (למשל: IBKR Live, Colmex Demo)" style={{ textAlign: 'end' }} /></div>
            <div className="field"><input type="number" value={newAcc.balance} onChange={(e) => setNewAcc({ ...newAcc, balance: e.target.value })} placeholder="יתרה התחלתית ($) — אופציונלי" style={{ textAlign: 'end' }} /></div>
            <div className="grid-2">
              <button className={`provider-opt ${newAcc.type === 'demo' ? 'selected' : ''}`} onClick={() => setNewAcc({ ...newAcc, type: 'demo' })}>נסיון · Demo</button>
              <button className={`provider-opt ${newAcc.type === 'live' ? 'selected' : ''}`} style={{ color: 'var(--green)' }} onClick={() => setNewAcc({ ...newAcc, type: 'live' })}>אמיתי · Live</button>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={createAccount}>יצירת חשבון</button>
              <button className="btn btn-ghost" onClick={() => setShowAccModal(false)}>ביטול</button>
            </div>
          </div>
        </div>
      )}
      <ToastEl />
    </Layout>
  );
}

function Slider({ label, value, min, max, step = 1, onChange, desc }) {
  return (
    <div className="field">
      <label>{label} <span className="slider-val">{value}</span></label>
      <div className="slider-row"><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} /></div>
      <p className="desc">{desc}</p>
    </div>
  );
}
