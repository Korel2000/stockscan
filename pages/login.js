import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../lib/i18n';

export default function Login() {
  const { t, lang, toggle } = useLanguage();
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  // התחברות עם OAuth (Apple / Google)
  async function signInWithOAuth(provider) {
    if (!agreed) {
      setErr('יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך.');
      return;
    }
    setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { 
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined 
      }
    });
    if (error) setErr(error.message);
  }

  // התחברות עם מספר טלפון (SMS)
  async function handlePhoneSignIn() {
    if (!agreed) {
      setErr('יש לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך.');
      return;
    }
    router.push('/login-phone');
  }

  // המשך ללא חשבון (אורח)
  function handleGuestContinue() {
    router.push('/dashboard');
  }

  return (
    <div 
      dir="rtl"
      style={{ 
        minHeight: '100dvh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 20,
        backgroundColor: '#eef4ff',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* כפתור החלפת שפה (פינה עליונה) */}
      <div style={{ position: 'absolute', top: 20, left: 20 }}>
        <button 
          onClick={toggle} 
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer', 
            fontSize: 14, 
            color: '#666' 
          }}
        >
          {lang === 'he' ? 'English' : 'עברית'}
        </button>
      </div>

      {/* כרטיס ההתחברות המרכזי */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: 400, 
          backgroundColor: '#ffffff', 
          borderRadius: 24, 
          padding: '36px 28px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
          textAlign: 'center'
        }}
      >
        {/* לוגו אייקון + כותרת מותג */}
        <div 
          style={{ 
            width: 52, 
            height: 52, 
            borderRadius: 16, 
            backgroundColor: '#2563eb', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 24, 
            fontWeight: 'bold',
            margin: '0 auto 12px' 
          }}
        >
          S
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2563eb', margin: '0 0 4px 0' }}>
          StockScan
        </h1>
        
        {/* תת כותרת מתאימה למוצר שלך */}
        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          יומן מסחר חכם · התחבר כדי להמשיך לסחור ולסנכרן את הנתונים שלך בכל המכשירים.
        </p>

        {/* אישור תנאי שימוש */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#2563eb' }}
          />
          <label htmlFor="terms" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>
            אני מסכים/ה ל<a href="/terms" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>תנאי השימוש</a> ול<a href="/privacy" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>מדיניות הפרטיות</a>
          </label>
        </div>

        {/* הודעת שגיאה */}
        {err && <p style={{ color: '#dc2626', fontSize: 13, marginBottom: 12 }}>{err}</p>}

        {/* כפתורי התחברות מהירה */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* כפתור Apple */}
          <button
            type="button"
            onClick={() => signInWithOAuth('apple')}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              backgroundColor: '#000000',
              color: '#ffffff',
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span>🍎</span> התחברות באמצעות Apple
          </button>

          {/* כפתור Google */}
          <button
            type="button"
            onClick={() => signInWithOAuth('google')}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              backgroundColor: '#ffffff',
              color: '#374151',
              border: '1px solid #e5e7eb',
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            <span>Google</span> התחבר עם Google
          </button>
        </div>

        {/* מפריד "או" */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: '#f3f4f6' }}></div>
          <span style={{ padding: '0 12px', fontSize: 12, color: '#9ca3af' }}>או</span>
          <div style={{ flex: 1, height: 1, backgroundColor: '#f3f4f6' }}></div>
        </div>

        {/* כפתור טלפון (SMS) */}
        <button
          type="button"
          onClick={handlePhoneSignIn}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            backgroundColor: '#ffffff',
            color: '#4b5563',
            border: '1px solid #e5e7eb',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 20
          }}
        >
          <span>📱</span> כניסה עם מספר טלפון (SMS)
        </button>

        {/* קישור המשך ללא חשבון */}
        <button
          type="button"
          onClick={handleGuestContinue}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 20,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          ← המשך ללא חשבון
        </button>

        {/* תרצה להוסיף כאן טקסט תחתון מותאם אישית? */}
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          משתמשים חדשים מקבלים <strong style={{ color: '#2563eb' }}>ניתוחי שוק בחינם</strong>.
        </p>
      </div>
    </div>
  );
}
