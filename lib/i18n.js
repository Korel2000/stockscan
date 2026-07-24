import { createContext, useContext, useEffect, useState } from 'react';

const DICT = {
  he: {
    dashboard: 'Dashboard', journal: 'Journal', analytics: 'Analytics', scanner: 'Scanner', settings: 'Settings',
    signOut: 'Sign Out', noActiveAccount: 'אין חשבון פעיל', accountSettings: 'חשבון · לכי להגדרות ⚙',
    dashTitle: 'Dashboard', dashSub: 'התמונה שלך על היום', quickActions: 'Quick Actions', addTrade: 'הוסף טרייד',
    weekPnl: 'P&L שבועי', last7days: '7 ימים אחרונים', lossStreak: 'רצף הפסדים', limit: 'מגבלה',
    tradesToday: 'טריידים היום', outOfMax: 'מתוך', maxWord: 'מקסימום', todayPnl: 'P&L היום', allAccounts: 'כל החשבונות',
    winRate: 'Win Rate', winRateSub: 'אחוז זכיות', totalTrades: 'סך טריידים', allTime: 'כל הזמנים',
    journalTitle: 'יומן מסחר', journalSub: 'עקוב וסקור את כל הטריידים שלך', noTrades: '!אין עדיין טריידים. הוסף את הטרייד הראשון שלך',
    analyticsTitle: 'אנליטיקס', analyticsSub: 'ניתוח ביצועים ותובנות מתקדמות', performanceOverview: 'סקירת ביצועים',
    avgWinLoss: 'ממוצע רווח/הפסד', profitFactor: 'מקדם רווח', tradingDays: 'ימי מסחר', totalPnl: 'סך P&L', trades: 'טריידים',
    noAnalyticsData: 'אין עדיין מספיק נתונים לניתוח. הוסף טריידים כדי לראות תובנות.',
    scannerTitle: 'סורק מניות', disclaimerTitle: '⚠ אין המלצה לביצוע פעולה',
    disclaimerBody: 'הנתונים המוצגים לצורך מחקר אישי ואינם מהווים ייעוץ השקעות או המלצה לרכישה/מכירה של נייר ערך. מסחר בשוק ההון כרוך בסיכון. מומלץ להתייעץ עם יועץ מורשה.',
    scan: 'סרוק', enablePush: '🔔 הפעל התראות פוש', pushActive: '✓ התראות פעילות', pushDenied: 'ההרשאה נדחתה',
    searchTicker: 'חפש טיקר (למשל AAPL)', noMatch: 'אין מניות התואמות את הקריטריונים כרגע — מתעדכן כל 15 שניות',
    scannerCriteria: 'קריטריוני סריקה',
    settingsTitle: 'הגדרות', settingsSub: 'נהל את החשבון והעדפות המסחר שלך',
    pushNotifications: 'התראות פוש', sendTest: 'שלח בדיקה',
    traderGuard: 'הגדרות שמירת סוחר', tradingAccounts: '💼 חשבונות מסחר', addAccount: '+ הוספת חשבון חדש',
    dataSource: 'מקור נתוני הסורק', saveChanges: 'שמור שינויים', reset: 'איפוס',
    createAccount: 'יצירת חשבון', cancel: 'ביטול', account: 'חשבון',
    signInTitle: 'ברוך שובך', signInSub: 'התחבר כדי להמשיך לסחור', signUpTitle: 'יצירת חשבון', signUpSub: 'הירשם כדי להתחיל את יומן המסחר שלך',
    email: 'Email', password: 'סיסמה', signIn: 'התחברות', signUp: 'הרשמה',
    noAccount: 'אין לך חשבון?', haveAccount: 'כבר יש לך חשבון?', orContinueWith: 'או המשך עם'
  },
  en: {
    dashboard: 'Dashboard', journal: 'Journal', analytics: 'Analytics', scanner: 'Scanner', settings: 'Settings',
    signOut: 'Sign Out', noActiveAccount: 'No active account', accountSettings: 'Account · go to settings ⚙',
    dashTitle: 'Dashboard', dashSub: 'Your trading overview for today', quickActions: 'Quick Actions', addTrade: 'Add Trade',
    weekPnl: 'Weekly P&L', last7days: 'Last 7 days', lossStreak: 'Loss Streak', limit: 'Limit',
    tradesToday: 'Trades Today', outOfMax: 'out of', maxWord: 'max', todayPnl: "Today's P&L", allAccounts: 'All accounts',
    winRate: 'Win Rate', winRateSub: 'Win percentage', totalTrades: 'Total Trades', allTime: 'All time',
    journalTitle: 'Trading Journal', journalSub: 'Track and review all your trades', noTrades: '!No trades yet. Add your first trade to get started',
    analyticsTitle: 'Analytics', analyticsSub: 'Advanced performance analysis and insights', performanceOverview: 'Performance Overview',
    avgWinLoss: 'Avg Win / Loss', profitFactor: 'Profit Factor', tradingDays: 'trading days', totalPnl: 'Total P&L', trades: 'trades',
    noAnalyticsData: "Not enough data yet for analysis. Add trades to see insights.",
    scannerTitle: 'Stock Scanner', disclaimerTitle: '⚠ Not investment advice',
    disclaimerBody: 'Data shown is for personal research only and does not constitute investment advice or a recommendation to buy/sell any security. Trading involves risk. Consult a licensed advisor.',
    scan: 'Scan', enablePush: '🔔 Enable Push Alerts', pushActive: '✓ Alerts active', pushDenied: 'Permission denied',
    searchTicker: 'Search ticker (e.g. AAPL)', noMatch: 'No stocks match the criteria right now — Auto-refreshing every 15 seconds',
    scannerCriteria: 'Scanner Criteria',
    settingsTitle: 'Settings', settingsSub: 'Manage your account and trading preferences',
    pushNotifications: 'Push Notifications', sendTest: 'Send Test',
    traderGuard: 'Trader Guard Settings', tradingAccounts: '💼 Trading Accounts', addAccount: '+ Add new account',
    dataSource: 'Scanner Data Source', saveChanges: 'Save Changes', reset: 'Reset',
    createAccount: 'Create Account', cancel: 'Cancel', account: 'Account',
    signInTitle: 'Welcome Back', signInSub: 'Sign in to continue trading', signUpTitle: 'Create Account', signUpSub: 'Sign up to start your trading journal',
    email: 'Email', password: 'Password', signIn: 'Sign In', signUp: 'Sign Up',
    noAccount: "Don't have an account?", haveAccount: 'Already have an account?', orContinueWith: 'Or continue with'
  }
};

const LangContext = createContext({ lang: 'he', t: (k) => DICT.he[k] || k, toggle: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('he');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('stockscan_lang') : null;
    if (stored === 'he' || stored === 'en') setLang(stored);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    }
  }, [lang]);

  function toggle() {
    const next = lang === 'he' ? 'en' : 'he';
    setLang(next);
    if (typeof window !== 'undefined') localStorage.setItem('stockscan_lang', next);
  }

  function t(key) {
    return DICT[lang][key] || DICT.he[key] || key;
  }

  return <LangContext.Provider value={{ lang, t, toggle }}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  return useContext(LangContext);
}
