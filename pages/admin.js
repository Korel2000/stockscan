import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAppData } from '../lib/useAppData';
import { useToast } from '../components/Toast';
import { useLanguage } from '../lib/i18n';

export default function Admin() {
  const data = useAppData();
  const { toast, ToastEl } = useToast();
  const { t } = useLanguage();
  const router = useRouter();
  const [users, setUsers] = useState(null);

  useEffect(() => {
    if (!data.ready) return;
    if (!data.profile?.isAdmin) { router.replace('/dashboard'); return; }
    data.apiFetch('/api/admin/users').then(setUsers).catch(() => setUsers([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.ready, data.profile]);

  if (!data.ready || !data.profile?.isAdmin) return <Layout><div className="page" /></Layout>;

  async function setApproved(id, approved) {
    await data.apiFetch('/api/admin/users', { method: 'POST', body: JSON.stringify({ id, approved }) });
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, approved } : u)));
    toast(approved ? t('approveBtn') + ' ✓' : t('revokeBtn') + ' ✓');
  }

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page">
        <div className="page-head"><div><h1>{t('adminTitle')}</h1><p>{t('adminSub')}</p></div></div>

        <div className="panel">
          {users === null ? null : users.length === 0 ? (
            <p className="hint muted">{t('noUsers')}</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="account-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ textAlign: 'start' }}>
                  <div className="aname">{u.email}</div>
                  <div className="hint muted" style={{ fontSize: 12 }}>
                    {t('signedUpOn')}{new Date(u.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="account-pill" style={{ color: u.approved ? 'var(--green)' : 'var(--amber)' }}>
                    {u.approved ? t('approvedBadge') : t('pendingBadge')}
                  </span>
                  {u.approved ? (
                    <button className="btn btn-ghost" onClick={() => setApproved(u.id, false)}>{t('revokeBtn')}</button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setApproved(u.id, true)}>{t('approveBtn')}</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <ToastEl />
      </section>
    </Layout>
  );
}
