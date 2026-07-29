import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';
import AssistantWidget from './AssistantWidget';

export default function Layout({ children, activeAccountName, accountCount = 1, isAdmin = false }) {
  const router = useRouter();
  const { t, lang, toggle } = useLanguage();

  const NAV = [
    { href: '/dashboard', label: t('dashboard') || 'לוח בקרה' },
    { href: '/journal', label: t('journal') || 'יומן מסחר' },
    { href: '/analytics', label: t('analytics') || 'אנליטיקס' },
    { href: '/scanner', label: t('scanner') || 'סורק' },
    { href: '/assistant', label: t('assistantTitle') || 'עוזר AI' },
    { href: '/settings', label: t('settings') || 'הגדרות' },
    ...(isAdmin ? [{ href: '/admin', label: t('adminTitle') || 'ניהול משתמשים' }] : [])
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
          <Link href="/settings" passHref legacyBehavior>
            <a className="btn-topbar settings-btn">
              <span className="icon">⚙️</span> הגדרות
            </a>
          </Link>
        </div>
      </header>

      {/* תוכן העמוד עצמו (כמו עמוד ההגדרות) */}
      <div className="main-content">
        {children}
      </div>

      {/* תפריט ניווט תחתון למובייל */}
      <nav className="bottom-nav">
        <div className="nav-items-container">
          {NAV.map((item) => {
            // בדיקה אם העמוד הנוכחי פעיל כדי לצבוע אותו
            const isActive = router.pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} passHref legacyBehavior>
                <a className={`nav-item ${isActive ? 'active' : ''}`}>
                  <span>{item.label}</span>
                </a>
              </Link>
            );
          })}
        </div>
      </nav>

      <AssistantWidget />

      {/* עיצוב גלובלי למניעת שבירות */}
      <style jsx global>{`
        body {
          background-color: #0f172a;
          color: #f8fafc;
          margin: 0;
          font-family: system-ui, -apple-system, sans-serif;
          direction: rtl;
        }
      `}</style>
      
      {/* עיצוב ספציפי למעטפת ולתפריטים */}
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
          gap: 6px;
          font-weight: 500;
        }

        .btn-topbar:hover {
          background-color: #334155;
          color: #fff;
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          /* השארת מרווח למטה כדי שהתפריט התחתון לא יסתיר את התוכן */
          padding-bottom: 90px; 
        }

        /* תפריט ניווט תחתון צף */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid #1e293b;
          padding: 10px 10px 24px 10px; /* ריווח תחתון מוגדל למכשירי אייפון/אנדרואיד חדשים */
          z-index: 50;
        }

        .nav-items-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 600px;
          margin: 0 auto;
          overflow-x: auto; /* מאפשר גלילה אם יש יותר מדי פריטים */
          gap: 4px;
        }

        /* הסתרת פס הגלילה בתפריט התחתון */
        .nav-items-container::-webkit-scrollbar {
          display: none;
        }

        .nav-item {
          flex: 1;
          text-align: center;
          padding: 12px 10px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          border-radius: 12px;
          white-space: nowrap;
          transition: all 0.2s ease;
          min-width: 70px;
        }

        .nav-item.active {
          color: #fff;
          background-color: #1e3a8a; /* צבע כחול בולט לפריט הפעיל */
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.5);
        }
      `}</style>
    </div>
  );
}
