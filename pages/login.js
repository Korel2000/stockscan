import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';

const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Google', color: '#fff', bg: '#fff', textColor: '#111' }
];

export default function Login() {
  const { t, lang, toggle } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.push('/dashboard');
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function signInWithOAuth(provider) {
    setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined }
    });
    if (error) setErr(error.message);
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <button onClick={toggle} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
            {lang === 'he' ? 'English' : 'עברית'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="logo" style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 14px', fontSize: 24 }}>S</div>
          <h1 style={{ color: 'var(--blue)', fontSize: 26, margin: '0 0 4px' }}>StockScan</h1>
          <p style={{ color: 'var(--text-dim)', margin: 0 }}>{t('tagline')}</p>
        </div>
        <div className="panel">
          <h2 style={{ textAlign: 'center', fontSize: 22 }}>{mode === 'signin' ? t('signInTitle') : t('signUpTitle')}</h2>
          <p className="hint muted" style={{ textAlign: 'center' }}>
            {mode === 'signin' ? t('signInSub') : t('signUpSub')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {OAUTH_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => signInWithOAuth(p.id)}
                className="btn"
                style={{ width: '100%', justifyContent: 'center', background: p.bg, color: p.textColor, border: '1px solid var(--border)' }}
              >
                {p.label} · {t('signIn')}
              </button>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-faint)', margin: '0 0 14px' }}>{t('orContinueWith')}</p>

          <form onSubmit={submit}>
            <div className="field">
              <label>{t('email')}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="trader@example.com" required />
            </div>
            <div className="field">
              <label>{t('password')}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            {err && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: -8 }}>{err}</p>}
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={busy}>
              {busy ? '...' : mode === 'signin' ? t('signIn') : t('signUp')}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-dim)' }}>
            {mode === 'signin' ? (
              <>{t('noAccount')} <a style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => setMode('signup')}>{t('signUp')}</a></>
            ) : (
              <>{t('haveAccount')} <a style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => setMode('signin')}>{t('signIn')}</a></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
