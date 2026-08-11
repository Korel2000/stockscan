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

        <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', gap: 10 }} onClick={signInWithGoogle}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
          </svg>
          Google
        </button>
      </div>
    </div>
  );
}
