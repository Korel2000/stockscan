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

  const [alpacaKey, setAlpacaKey] = useState('');
  const [alpacaSecret, setAlpacaSecret] = useState('');

  useEffect(() => { 
    if (data.guard) {
      setGuardForm(data.guard);
      if (data.guard.provider_api_key?.includes(':')) {
        const [key, secret] = data.guard.provider_api_key.split(':');
        setAlpacaKey(key || '');
        setAlpacaSecret(secret || '');
      }
    } 
  }, [data.guard]);

  if (!data.ready || !guardForm) return <Layout><div className="page" /></Layout>;

  async function saveGuard() {
    setSaving(true);
    try {
      const payload = { ...guardForm };
      if (payload.scanner_provider === 'alpaca') {
        payload.provider_api_key = `${alpacaKey}:${alpacaSecret}`;
      }
      await data.apiFetch('/api/settings', { method: 'POST', body: JSON.stringify(payload) });
      toast('ההגדרות נשמרו בהצלחה 💾');
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
    toast('החשבון נוצר בהצלחה 🎉');
  }

  async function deleteAccount(id) {
    if (data.accounts.length === 1) { toast('חייב להישאר לפחות חשבון אחד'); return; }
    if (!window.confirm(t('confirmDeleteAccount'))) return;
    await data.apiFetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
    await data.refreshAccounts();
    toast('החשבון נמחק');
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
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification('בדיקת התראה 🔔', { body: 'זו התראת בדיקה מ-StockScan', icon: '/icons/icon-192.png' });
    } else {
      toast('יש להפעיל התראות בעמוד הסורק קודם לכן');
    }
  }

  // בדיקה אם המשתמש מחובר (לפי קיום כתובת מייל)
  const isConnected = !!data.user?.email;

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page modern-settings">
        
        <header className="page-head">
          <div className="head-content">
            <h1>{t('settingsTitle')}</h1>
            <p className="subtitle">{t('settingsSub')}</p>
          </div>
        </header>

        <div className="panel profile-card">
          <div className="profile-top">
            <div className="profile-avatar">{(data.user?.email || '?')[0].toUpperCase()}</div>
            <div className="profile-name-wrap">
              <div className="profile-name">{data.user?.email}</div>
              <span className={`profile-badge ${data.profile?.isAdmin ? 'admin' : 'user'}`}>
                {data.profile?.isAdmin ? t('adminTitle') : t('accountLabel')}
              </span>
            </div>
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-num">{data.accounts.length}</div>
              <div className="profile-stat-label">{t('tradingAccounts')}</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-num">{data.trades.length}</div>
              <div className="profile-stat-label">{t('trades')}</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-num">
                {data.trades.length ? Math.round((data.trades.filter(tr => tr.pnl > 0).length / data.trades.length) * 100) : 0}%
              </div>
              <div className="profile-stat-label">{t('winRate')}</div>
            </div>
          </div>
        </div>

        <div className="profile-shortcuts">
          <Link href="#accounts-panel" passHref legacyBehavior>
            <a className="shortcut-card">
              <span className="shortcut-icon">💼</span>
              <div className="shortcut-title">{t('tradingAccounts')}</div>
              <div className="shortcut-sub">{t('shortcutAccountsSub')}</div>
            </a>
          </Link>
          <Link href="/assistant" passHref legacyBehavior>
            <a className="shortcut-card">
              <span className="shortcut-icon">🤖</span>
              <div className="shortcut-title">{t('assistantTitle')}</div>
              <div className="shortcut-sub">{t('shortcutAssistantSub')}</div>
            </a>
          </Link>
        </div>

        {!dismissTip && (
          <div className="panel tip-card">
            <div className="tip-header">
              <h3>{t('tipTitle')}</h3>
              <button className="btn-icon tip-close" onClick={() => setDismissTip(true)} aria-label={t('cancel')}>✕</button>
            </div>
            <p className="tip-body-text">{t('tipBody')}</p>
            <Link href="/journal" passHref legacyBehavior>
              <a className="tip-btn">יומן מסחר ←</a>
            </Link>
          </div>
        )}

        <nav className="menu-list">
          <a className="menu-row" href="#guard-panel"><span>{t('traderGuard')}</span><span className="menu-icon">⚙️</span></a>
          <a className="menu-row" href="#datasource-panel"><span>{t('dataSource')}</span><span className="menu-icon">🔌</span></a>
          <a className="menu-row" href="#push-panel"><span>{t('pushNotifications')}</span><span className="menu-icon">🔔</span></a>
          
          {/* כרטיסיית Google החדשה */}
          <div className="menu-row" style={{ backgroundColor: isConnected ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.05)', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #334155' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'white', borderRadius: '50%', padding: '6px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                <span style={{ color: 'white', fontWeight: 'bold' }}>
                  {isConnected ? 'מחובר באמצעות Google' : t('connectGoogleBtn')}
                </span>
                {isConnected && <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal' }}>{data.user?.email}</span>}
              </div>
            </div>

            {!isConnected ? (
              <button onClick={connectGoogle} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                התחבר
              </button>
            ) : (
              <button onClick={signOutNow} style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                התנתק
              </button>
            )}
          </div>
        </nav>

        <div className="panel" id="push-panel">
          <h2>{t('pushNotifications')}</h2>
          <p className="hint">קבל התראות Push כאשר מניה חמה מופיעה בסורק — גם כשהאפליקציה סגורה.</p>
          <div className="panel-actions left">
            <button className="btn btn-secondary" onClick={sendTestNotif}>{t('sendTest')}</button>
            <Link href="/scanner" passHref legacyBehavior>
              <a className="btn btn-primary">להפעלה בסורק ←</a>
            </Link>
          </div>
        </div>

        <div className="panel" id="guard-panel">
          <h2>{t('traderGuard')}</h2>
          <p className="hint">הגדר את מגבלות ניהול הסיכון שלך. המערכת תתריע כשתגיע לסף.</p>
          
          <div className="sliders-container">
            <Slider label={t('lossStreakLimit')} value={guardForm.loss_streak_limit} min={1} max={10}
              onChange={(v) => setGuardForm({ ...guardForm, loss_streak_limit: v })} desc={t('lossStreakDesc')} />
            <Slider label={t('maxTradesPerDay')} value={guardForm.max_trades_per_day} min={1} max={30}
              onChange={(v) => setGuardForm({ ...guardForm, max_trades_per_day: v })} desc={t('maxTradesDesc')} />
            <Slider label={t('dailyLossLimit')} value={guardForm.daily_loss_limit} min={10} max={2000} step={10}
              onChange={(v) => setGuardForm({ ...guardForm, daily_loss_limit: v })} desc={t('dailyLossDesc')} />
            <Slider label={t('dailyProfitTarget')} value={guardForm.daily_profit_target} min={10} max={5000} step={10}
              onChange={(v) => setGuardForm({ ...guardForm, daily_profit_target: v })} desc={t('dailyProfitDesc')} />
          </div>

          <div className="panel-actions left mt-20">
            <button className="btn btn-ghost" onClick={() => setGuardForm(data.guard)}>{t('reset')}</button>
            <button className="btn btn-primary" onClick={saveGuard} disabled={saving}>
              {saving ? 'שומר...' : t('saveChanges')}
            </button>
          </div>
        </div>

        <div className="panel" id="accounts-panel">
          <h2>{t('tradingAccounts')}</h2>
          <p className="hint">ניהול חשבונות המסחר שלך. לכל חשבון יומן נתונים נפרד.</p>
          
          <div className="accounts-list">
            {data.accounts.map((a) => (
              <div key={a.id} className="account-card">
                <div className="account-info">
                  <span className={`atype ${a.type}`}>{a.type === 'live' ? t('liveLabel') : t('demoLabel')}</span>
                  <div className="aname">{a.name}</div>
                </div>
                <button className="btn-icon danger" onClick={() => deleteAccount(a.id)} aria-label={t('confirmDeleteAccount')} title="מחק חשבון">
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <button className="btn btn-outline full-width mt-10" onClick={() => setShowAccModal(true)}>
            + {t('addAccount')}
          </button>
        </div>

        <div className="panel" id="datasource-panel">
          <h2>{t('dataSource')}</h2>
          <p className="hint">בחר את מקור הנתונים לסריקת מניות בזמן אמת.</p>
          
          <div className="provider-grid">
            {['ibkr', 'alpaca', 'demo'].map((p) => (
              <button key={p} 
                className={`provider-opt ${guardForm.scanner_provider === p ? 'selected' : ''}`}
                onClick={() => setGuardForm({ ...guardForm, scanner_provider: p })}>
                {p === 'ibkr' ? 'IBKR' : p === 'alpaca' ? 'Alpaca' : t('demoLabel')}
              </button>
            ))}
          </div>

          {guardForm.scanner_provider === 'alpaca' && (
            <div className="api-fields mt-15">
              <div className="field">
                <label>Key ID</label>
                <input value={alpacaKey} onChange={(e) => setAlpacaKey(e.target.value)} placeholder="AK..." dir="ltr" />
              </div>
              <div className="field">
                <label>Secret Key</label>
                <input type="password" value={alpacaSecret} onChange={(e) => setAlpacaSecret(e.target.value)} placeholder="••••••••••••" dir="ltr" />
              </div>
            </div>
          )}

          {guardForm.scanner_provider === 'ibkr' && (
            <div className="api-fields mt-15">
              <div className="field">
                <label>כתובת IB Gateway</label>
                <input value={guardForm.ibkr_gateway_url || ''} onChange={(e) => setGuardForm({ ...guardForm, ibkr_gateway_url: e.target.value })} placeholder="https://localhost:5000" dir="ltr" />
              </div>
            </div>
          )}
          
          <div className="panel-actions left mt-20">
            <button className="btn btn-primary" onClick={saveGuard} disabled={saving}>
              {saving ? 'שומר...' : t('saveDataSource')}
            </button>
          </div>
        </div>

      </section>

      {showAccModal && (
        <div className="modal-backdrop show">
          <div className="modal panel">
            <h2>יצירת חשבון מסחר</h2>
            <div className="field">
              <label>שם החשבון</label>
              <input value={newAcc.name} onChange={(e) => setNewAcc({ ...newAcc, name: e.target.value })} placeholder="למשל: IBKR Live" />
            </div>
            <div className="field">
              <label>יתרה התחלתית ($)</label>
              <input type="number" min="0" value={newAcc.balance} onChange={(e) => setNewAcc({ ...newAcc, balance: e.target.value })} placeholder="אופציונלי" dir="ltr" />
            </div>
            
            <div className="provider-grid">
              <button className={`provider-opt ${newAcc.type === 'demo' ? 'selected' : ''}`} onClick={() => setNewAcc({ ...newAcc, type: 'demo' })}>נסיון · Demo</button>
              <button className={`provider-opt live-opt ${newAcc.type === 'live' ? 'selected' : ''}`} onClick={() => setNewAcc({ ...newAcc, type: 'live' })}>אמיתי · Live</button>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAccModal(false)}>ביטול</button>
              <button className="btn btn-primary" onClick={createAccount}>צור חשבון</button>
            </div>
          </div>
        </div>
      )}
      <ToastEl />

      <style jsx>{`
        .modern-settings {
          padding: 16px;
          direction: rtl;
          color: #f8fafc;
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding-bottom: 80px;
        }

        .page-head { margin-bottom: 24px; text-align: right; }
        .page-head h1 { font-size: 28px; font-weight: 800; margin: 0 0 4px 0; color: #ffffff; }
        .subtitle { color: #94a3b8; font-size: 15px; margin: 0; }

        .panel { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .panel h2 { font-size: 18px; margin: 0 0 16px 0; color: #ffffff; border-bottom: 1px solid #334155; padding-bottom: 12px; }
        .hint { color: #94a3b8; font-size: 14px; margin-bottom: 20px; line-height: 1.4; }

        .profile-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .profile-avatar { flex-shrink: 0; width: 56px; height: 56px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
        .profile-name-wrap { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 4px; overflow: hidden; width: 100%; }
        .profile-name { font-size: 16px; font-weight: bold; color: #fff; direction: ltr; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .profile-badge { font-size: 12px; padding: 4px 10px; border-radius: 6px; background: #334155; color: #cbd5e1; font-weight: 600; }
        
        .profile-stats { display: flex; justify-content: space-between; border-top: 1px solid #334155; padding-top: 16px; gap: 8px; }
        .profile-stat { text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .profile-stat-num { font-size: 20px; font-weight: bold; color: #fff; }
        .profile-stat-label { font-size: 12px; color: #94a3b8; }

        .profile-shortcuts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .shortcut-card { background: #1e293b; border: 1px solid #334155; padding: 20px 12px; border-radius: 16px; text-decoration: none; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 8px; transition: background 0.2s; }
        .shortcut-card:hover { background: #334155; }
        .shortcut-icon { font-size: 32px; line-height: 1; }
        .shortcut-title { font-weight: bold; font-size: 15px; margin: 0; }
        .shortcut-sub { font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.3; }

        .tip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .tip-header h3 { margin: 0; color: #fbbf24; font-size: 16px; }
        .tip-body-text { color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-bottom: 16px; margin-top: 0; }
        .tip-btn { display: inline-block; background: #3b82f6; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; transition: 0.2s; }
        .tip-btn:hover { background: #2563eb; }

        .menu-list { background: #1e293b; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px; overflow: hidden; }
        .menu-row { display: flex; justify-content: space-between; align-items: center; padding: 22px 20px; text-decoration: none; color: #fff; font-weight: 600; font-size: 17px; border-bottom: 1px solid #334155; width: 100%; transition: background 0.2s; }
        .menu-row:last-child { border-bottom: none; }
        .menu-row:hover { background: #334155; }
        .menu-icon { opacity: 0.8; font-size: 22px; }
        
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; font-size: 15px; font-weight: 600; border-radius: 10px; cursor: pointer; border: none; text-decoration: none; transition: 0.2s; }
        .btn:disabled { opacity: 0.5; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover:not(:disabled) { background: #2563eb; }
        .btn-secondary { background: #334155; color: white; }
        .btn-outline { background: transparent; border: 1px solid #475569; color: #cbd5e1; }
        .btn-ghost { background: transparent; color: #94a3b8; }
        
        .btn-icon { background: transparent; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 8px; }
        .btn-icon.danger { color: #f87171; background: rgba(248, 113, 113, 0.1); }
        .btn-icon.tip-close { padding: 4px; font-size: 16px; margin-right: -8px; }

        .full-width { width: 100%; }
        .mt-10 { margin-top: 10px; }
        .mt-15 { margin-top: 15px; }
        .mt-20 { margin-top: 20px; }
        .panel-actions.left { display: flex; gap: 12px; justify-content: flex-end; }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

        .provider-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .provider-opt { padding: 12px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; color: #cbd5e1; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 14px; text-align: center; }
        .provider-opt.selected { background: #1e3a8a; border-color: #3b82f6; color: white; }
        .provider-opt.live-opt.selected { background: #064e3b; border-color: #10b981; color: white; }

        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 14px; color: #cbd5e1; margin-bottom: 8px; }
        .field input { width: 100%; padding: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; color: white; font-size: 15px; }
        .field input:focus { outline: none; border-color: #3b82f6; }
        
        .account-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; margin-bottom: 12px; }
        .account-info { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
        .atype { font-size: 12px; padding: 4px 8px; border-radius: 6px; font-weight: bold; display: inline-block; }
        .atype.live { background: #064e3b; color: #34d399; }
        .atype.demo { background: #1e3a8a; color: #60a5fa; }
        .aname { font-size: 16px; font-weight: bold; color: white; margin: 0; }

        .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .modal { width: 100%; max-width: 400px; margin: 0; }
      `}</style>
    </Layout>
  );
}

function Slider({ label, value, min, max, step = 1, onChange, desc }) {
  return (
    <div className="field" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ margin: 0, alignSelf: 'center' }}>{label}</label>
        <span style={{ background: '#3b82f6', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }} />
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0 0 0' }}>{desc}</p>
    </div>
  );
}
