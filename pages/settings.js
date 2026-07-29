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
          <a className="shortcut-card" href="#accounts-panel">
            <span className="shortcut-icon">💼</span>
            <div className="shortcut-text">
              <div className="shortcut-title">{t('tradingAccounts')}</div>
              <div className="shortcut-sub">{t('shortcutAccountsSub')}</div>
            </div>
          </a>
          <Link className="shortcut-card" href="/assistant">
            <span className="shortcut-icon">🤖</span>
            <div className="shortcut-text">
              <div className="shortcut-title">{t('assistantTitle')}</div>
              <div className="shortcut-sub">{t('shortcutAssistantSub')}</div>
            </div>
          </Link>
        </div>

        {!dismissTip && (
          <div className="panel tip-card">
            <div className="tip-header">
              <h3>{t('tipTitle')}</h3>
              <button className="btn-icon tip-close" onClick={() => setDismissTip(true)} aria-label={t('cancel')}>✕</button>
            </div>
            <p>{t('tipBody')}</p>
            <Link href="/journal" className="btn btn-outline tip-btn">יומן מסחר ←</Link>
          </div>
        )}

        <nav className="menu-list">
          <a className="menu-row" href="#guard-panel"><span>{t('traderGuard')}</span><span className="menu-icon">⚙️</span></a>
          <a className="menu-row" href="#datasource-panel"><span>{t('dataSource')}</span><span className="menu-icon">🔌</span></a>
          <a className="menu-row" href="#push-panel"><span>{t('pushNotifications')}</span><span className="menu-icon">🔔</span></a>
          <button className="menu-row btn-reset" onClick={connectGoogle}>
            <span>{t('connectGoogleBtn')}</span><span className="menu-icon">🔗</span>
          </button>
          <button className="menu-row danger btn-reset" onClick={signOutNow}>
            <span>{t('signOut')}</span><span className="menu-icon">↪</span>
          </button>
        </nav>

        <div className="panel" id="push-panel">
          <h2>{t('pushNotifications')}</h2>
          <p className="hint">קבל התראות Push כאשר מניה חמה מופיעה בסורק — גם כשהאפליקציה סגורה.</p>
          <div className="panel-actions left">
            <button className="btn btn-secondary" onClick={sendTestNotif}>{t('sendTest')}</button>
            <a className="btn btn-primary" href="/scanner">להפעלה בסורק ←</a>
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

      {/* העיצוב מוטמע ישירות כאן למניעת תקלות והתאמה למסך הכהה שלך */}
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

        .page-head { margin-bottom: 24px; }
        .page-head h1 { font-size: 28px; font-weight: 800; margin: 0 0 4px 0; color: #ffffff; }
        .subtitle { color: #94a3b8; font-size: 15px; margin: 0; }

        .panel {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .panel h2 { font-size: 18px; margin: 0 0 16px 0; color: #ffffff; border-bottom: 1px solid #334155; padding-bottom: 12px; }
        .hint { color: #94a3b8; font-size: 14px; margin-bottom: 20px; line-height: 1.4; }

        .profile-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .profile-avatar { width: 50px; height: 50px; border-radius: 50%; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; }
        .profile-name { font-size: 18px; font-weight: bold; color: #fff; }
        .profile-badge { font-size: 12px; padding: 4px 8px; border-radius: 6px; background: #334155; color: #cbd5e1; display: inline-block; margin-top: 4px; }
        
        .profile-stats { display: flex; justify-content: space-between; border-top: 1px solid #334155; padding-top: 16px; }
        .profile-stat { text-align: center; flex: 1; }
        .profile-stat-num { font-size: 20px; font-weight: bold; color: #fff; }
        .profile-stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }

        .profile-shortcuts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
        .shortcut-card { background: #1e293b; border: 1px solid #334155; padding: 16px; border-radius: 16px; text-decoration: none; color: #fff; display: flex; flex-direction: column; gap: 8px; transition: background 0.2s; }
        .shortcut-card:hover { background: #334155; }
        .shortcut-icon { font-size: 24px; }
        .shortcut-title { font-weight: bold; font-size: 15px; }
        .shortcut-sub { font-size: 12px; color: #94a3b8; }

        .tip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .tip-header h3 { margin: 0; color: #fbbf24; font-size: 16px; }
        .tip-card p { color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-bottom: 16px; }

        .menu-list { background: #1e293b; border-radius: 16px; border: 1px solid #334155; margin-bottom: 24px; overflow: hidden; }
        .menu-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; text-decoration: none; color: #fff; font-weight: 600; font-size: 15px; border-bottom: 1px solid #334155; width: 100%; transition: background 0.2s; }
        .menu-row:last-child { border-bottom: none; }
        .menu-row:hover { background: #334155; }
        .menu-row.danger { color: #f87171; }
        .menu-icon { opacity: 0.7; }
        
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; font-size: 15px; font-weight: 600; border-radius: 10px; cursor: pointer; border: none; text-decoration: none; transition: 0.2s; }
        .btn:disabled { opacity: 0.5; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover:not(:disabled) { background: #2563eb; }
        .btn-secondary { background: #334155; color: white; }
        .btn-outline { background: transparent; border: 1px solid #475569; color: #cbd5e1; }
        .btn-ghost { background: transparent; color: #94a3b8; }
        .btn-reset { background: none; border: none; padding: 0; font: inherit; cursor: pointer; text-align: inherit; }
        
        .btn-icon { background: transparent; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 8px; border-radius: 8px; }
        .btn-icon.danger { color: #f87171; background: rgba(248, 113, 113, 0.1); }

        .full-width { width: 100%; }
        .mt-10 { margin-top: 10px; }
        .mt-15 { margin-top: 15px; }
        .mt-20 { margin-top: 20px; }
        .panel-actions.left { display: flex; gap: 12px; justify-content: flex-end; }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

        .provider-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .provider-opt { padding: 12px 8px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; color: #cbd5e1; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 14px; }
        .provider-opt.selected { background: #1e3a8a; border-color: #3b82f6; color: white; }
        .provider-opt.live-opt.selected { background: #064e3b; border-color: #10b981; color: white; }

        .field { margin-bottom: 16px; }
        .field label { display: block; font-size: 14px; color: #cbd5e1; margin-bottom: 8px; }
        .field input { width: 100%; padding: 12px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; color: white; font-size: 15px; }
        .field input:focus { outline: none; border-color: #3b82f6; }
        
        .account-card { display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #0f172a; border: 1px solid #334155; border-radius: 12px; margin-bottom: 12px; }
        .atype { font-size: 12px; padding: 4px 8px; border-radius: 6px; font-weight: bold; margin-bottom: 4px; display: inline-block; }
        .atype.live { background: #064e3b; color: #34d399; }
        .atype.demo { background: #1e3a8a; color: #60a5fa; }
        .aname { font-size: 16px; font-weight: bold; color: white; }

        .modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .modal { width: 100%; max-width: 400px; margin: 0; }
      `}</style>
    </Layout>
  );
}

function Slider({ label, value, min, max, step = 1, onChange, desc }) {
  return (
    <div className="field" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <label style={{ margin: 0 }}>{label}</label>
        <span style={{ background: '#3b82f6', color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }} />
      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '8px 0 0 0' }}>{desc}</p>
    </div>
  );
}
