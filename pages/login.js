import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';

export default function Login() {
  const { t, lang, toggle } = useLanguage();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
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
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined }
    });
    if (error) setErr(error.message);
  }

  return (
    <div className="page" style={{ maxWidth: 420, margin: '60px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20, position: 'relative' }}>
        <button onClick={toggle} className="btn btn-ghost" style={{ position: 'absolute', insetInlineStart: 0, top: 0 }}>
          {lang === 'he' ? 'English' : 'עברית'}
        </button>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, var(--red), var(--green))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, margin: '0 auto 12px' }}>S</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--blue)', margin: '0 0 4px' }}>StockScan</h1>
        <p className="hint muted" style={{ margin: 0 }}>{t('tagline')}</p>
      </div>

      <div className="panel">
        <h2>{mode === 'signin' ? t('signInTitle') : t('signUpTitle')}</h2>
        <p className="hint muted">{mode === 'signin' ? t('signInSub') : t('signUpSub')}</p>

        {err && <p className="assistant-err">{err}</p>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>{t('email')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
          </div>
          <div className="field">
            <label>{t('password')}</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? t('saving') : (mode === 'signin' ? t('signIn') : t('signUp'))}
          </button>
        </form>

        <p style={{ textAlign: 'center', margin: '16px 0 0' }}>
          {mode === 'signin' ? (
            <span>{t('noAccount')} <a href="#" onClick={(e) => { e.preventDefault(); setMode('signup'); }} style={{ color: 'var(--blue)' }}>{t('signUp')}</a></span>
          ) : (
            <span>{t('haveAccount')} <a href="#" onClick={(e) => { e.preventDefault(); setMode('signin'); }} style={{ color: 'var(--blue)' }}>{t('signIn')}</a></span>
          )}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span className="hint muted" style={{ margin: 0 }}>{t('orContinueWith')}</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={signInWithGoogle}>
          Google
        </button>
      </div>
    </div>
  );
}
