import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../lib/useAuth';
import { useLanguage } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';

export default function Pending() {
  const { user, loading, apiFetch } = useAuth();
  const { t, lang, toggle } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/login'); return; }
    (async () => {
      try {
        const prof = await apiFetch('/api/profile');
        if (prof.approved) router.replace('/dashboard');
      } catch {
        // ignore — stay on this page
      }
    })();
  }, [loading, user, apiFetch, router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <button onClick={toggle} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px', marginBottom: 20 }}>
          {lang === 'he' ? 'English' : 'עברית'}
        </button>
        <div className="logo" style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 18px', fontSize: 24 }}>S</div>
        <div className="panel">
          <div style={{ fontSize: 34, marginBottom: 10 }}>⏳</div>
          <h2>{t('pendingApprovalTitle')}</h2>
          <p className="hint muted">{t('pendingApprovalBody')}</p>
          <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={signOut}>{t('backToLogin')}</button>
        </div>
      </div>
    </div>
  );
}
