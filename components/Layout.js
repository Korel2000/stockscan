import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';

export default function Layout({ children, activeAccountName, accountCount = 1, isAdmin = false }) {
  const router = useRouter();
  const { t, lang, toggle } = useLanguage();

  // 5 פריטים קבועים לתפריט התחתון - הגדרות הועבר לכאן (אחרון = צד שמאל ב-RTL)
  const BOTTOM_NAV = [
    { href: '/dashboard', label: t('dashboard') || 'לוח בקרה', icon: '🏠' },
    { href: '/journal', label: t('journal') || 'יומן מסחר', icon: '📝' },
    { href: '/analytics', label: t('analytics') || 'אנליטיקס', icon: '📊' },
    { href: '/scanner', label: t('scanner') || 'סורק', icon: '⚡' },
    { href: '/settings', label: t('settings') || 'הגדרות', icon: '⚙️' }
  ];

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div id="app" className="app-container">
      {/* הבר העליון (Topbar) */}
      <header className="topbar">
        <span className="account-pill">{activeAccountName || 'אין חשבון פעיל'}</span>
        <div className="topbar-actions">
          <button onClick={toggle} className="btn-topbar">
            {lang === 'he' ? 'English' : 'עברית'}
          </button>
          {isAdmin && (
            <Link href="/admin" passHref legacyBehavior>
              <a className="btn-topbar settings-btn" title="ניהול משתמשים">
                <span className="icon">👥</span>
              </a>
            </Link>
          )}
        </div>
      </header>

      {/* תוכן העמוד עצמו */}
      <div className="main-content">
        {children}
      </div>

      {/* תפריט ניווט תחתון למובייל - 5 פריטים קבועים */}
      <nav className="bottom-nav">
        <div className="nav-items-container">
          {BOTTOM_NAV.map((item) => {
            const isActive = router.pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} passHref legacyBehavior>
                <a className={`nav-item ${isActive ? 'active' : ''}`}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx global>{`
        body {
          background-color: #0f172a;
          color: #f8fafc;
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
          direction: rtl;
        }
      `}</style>
      
      <style jsx>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          background-color: #0f172a;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #0f172a;
          border-bottom: 1px solid #1e293b;
          z-index: 10;
        }

        .account-pill {
          background-color: #1e293b;
          color: #cbd5e1;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #334155;
        }

        .topbar-actions {
          display: flex;
          gap: 8px;
        }

        .btn-topbar {
          background-color: #1e293b;
          color: #cbd5e1;
          border: 1px solid #334155;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          transition: 0.2s;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
        }

        .btn-topbar:hover {
          background-color: #334155;
          color: #fff;
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          padding-bottom: 90px; 
        }

        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border-top: 1px solid #1e293b;
          padding: 8px 4px 24px 4px; 
          z-index: 50;
        }

        .nav-items-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          max-width: 600px;
          margin: 0 auto;
          gap: 2px;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 10px 2px;
          color: #94a3b8;
          text-decoration: none;
          border-radius: 12px;
          transition: all 0.2s ease;
          overflow: hidden; 
        }

        .nav-icon {
          font-size: 22px;
          line-height: 1;
          transition: transform 0.2s;
        }

        .nav-label {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          max-width: 100%;
        }

        .nav-item.active {
          color: #fff;
          background-color: #1e3a8a;
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
        }

        .nav-item.active .nav-icon {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
