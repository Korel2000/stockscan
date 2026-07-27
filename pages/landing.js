import Link from 'next/link';
import { useLanguage } from '../lib/i18n';

export default function Landing() {
  const { t, lang, toggle } = useLanguage();

  const features = [
    { icon: '⚡', title: t('landingFeatScannerTitle'), body: t('landingFeatScannerBody') },
    { icon: '📓', title: t('landingFeatJournalTitle'), body: t('landingFeatJournalBody') },
    { icon: '📊', title: t('landingFeatAnalyticsTitle'), body: t('landingFeatAnalyticsBody') },
    { icon: '🤖', title: t('landingFeatAssistantTitle'), body: t('landingFeatAssistantBody') }
  ];

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="brand" style={{ padding: 0 }}>
          <div className="logo" style={{ width: 30, height: 30, borderRadius: 8, fontSize: 13 }}>S</div>
          <div className="name" style={{ fontSize: 15 }}>StockScan</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggle} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
            {lang === 'he' ? 'EN' : 'עב'}
          </button>
          <Link href="/login" className="btn btn-ghost">{t('signIn')}</Link>
          <Link href="/login" className="btn btn-primary">{t('signUp')}</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <span className="landing-badge">✦ StockScan</span>
        <h1>
          {t('landingHeroLine1')}<br />
          <span className="landing-hero-accent">{t('landingHeroLine2')}</span>
        </h1>
        <p>{t('landingHeroSub')}</p>
        <div className="landing-cta-row">
          <Link href="/login" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 26px' }}>{t('landingCta')}</Link>
          <a href="#features" className="btn btn-ghost" style={{ fontSize: 14 }}>{t('landingHowItWorks')}</a>
        </div>
        <p className="landing-free-note">{t('landingFreeNote')}</p>
      </section>

      <section className="landing-scanner">
        <h2>{t('landingScannerTitle')}</h2>
        <p className="hint muted">{t('landingScannerSub')}</p>
        <div className="criteria-grid" style={{ maxWidth: 700, margin: '18px auto 26px' }}>
          <span className="criteria-pill">{t('criteriaChange')}</span>
          <span className="criteria-pill">{t('criteriaPrice')}</span>
          <span className="criteria-pill">{t('criteriaFloat')}</span>
        </div>
        <div className="landing-scanner-points">
          {[t('landingScannerPoint1'), t('landingScannerPoint2'), t('landingScannerPoint3'), t('landingScannerPoint4')].map((p, i) => (
            <div key={i} className="landing-scanner-point">✓ {p}</div>
          ))}
        </div>
      </section>

      <section id="features" className="landing-features">
        {features.map((f, i) => (
          <div key={i} className="landing-feat-card">
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </div>
        ))}
      </section>

      <section className="landing-install">
        <h2>{t('landingInstallTitle')}</h2>
        <p className="hint muted">{t('landingInstallSub')}</p>
        <div className="landing-install-grid">
          <div className="landing-install-card">
            <h4>📱 iPhone / iPad</h4>
            <p>{t('landingInstallIosSteps')}</p>
          </div>
          <div className="landing-install-card">
            <h4>🤖 Android</h4>
            <p>{t('landingInstallAndroidSteps')}</p>
          </div>
        </div>
      </section>

      <div style={{ textAlign: 'center', paddingBottom: 30 }}>
        <Link href="/login" className="btn btn-primary" style={{ fontSize: 15, padding: '13px 30px' }}>{t('landingCta')}</Link>
      </div>

      <footer className="landing-footer">
        <p>© 2026 StockScan · {t('landingFooterRights')}</p>
        <p>{t('landingDisclaimer')}</p>
      </footer>
    </div>
  );
}
