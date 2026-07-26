import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';
import AssistantWidget from './AssistantWidget';

export default function Layout({ children, activeAccountName, accountCount = 1, isAdmin = false }) {
  const router = useRouter();
  const { t, lang, toggle } = useLanguage();

  const NAV = [
    { href: '/dashboard', label: t('dashboard') },
    { href: '/journal', label: t('journal') },
    { href: '/analytics', label: t('analytics') },
    { href: '/scanner', label: t('scanner') },
    { href: '/assistant', label: t('assistantTitle') },
    { href: '/settings', label: t('settings') },
    ...(isAdmin ? [{ href: '/admin', label: t('adminTitle') }] : [])
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div id="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">S</div>
          <div className="name">StockScan</div>
          <div className="badge">{accountCount}</div>
        </div>
        <nav className="nav">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <button onClick={toggle} className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}>
            {lang === 'he' ? 'EN' : 'עב'}
          </button>
          <div className="avatar">U</div>
          <a className="signout" onClick={signOut} style={{ cursor: 'pointer' }}>{t('signOut')}</a>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <span className="account-pill">{activeAccountName || t('noActiveAccount')}</span>
          <button onClick={toggle} className="account-select" style={{ border: 'none', cursor: 'pointer' }}>
            {lang === 'he' ? 'English' : 'עברית'}
          </button>
          <Link href="/settings" className="account-select">{t('accountSettings')}</Link>
        </div>
        {children}
      </div>
      <AssistantWidget />
    </div>
  );
}
