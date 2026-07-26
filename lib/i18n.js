import { createContext, useContext, useEffect, useState } from 'react';

const DICT = {
  he: {
    dashboard: 'לוח בקרה', journal: 'יומן מסחר', analytics: 'אנליטיקס', scanner: 'סורק', settings: 'הגדרות',
    signOut: 'התנתקות', noActiveAccount: 'אין חשבון פעיל', accountSettings: 'הגדרות ⚙',
    dashTitle: 'לוח בקרה', dashSub: 'התמונה שלך על היום', quickActions: 'פעולות מהירות', addTrade: 'הוסף טרייד',
    weekPnl: 'P&L שבועי', last7days: '7 ימים אחרונים', lossStreak: 'רצף הפסדים', limit: 'מגבלה',
    tradesToday: 'טריידים היום', outOfMax: 'מתוך', maxWord: 'מקסימום', todayPnl: 'P&L היום', allAccounts: 'כל החשבונות',
    winRate: 'אחוז ניצחונות', winRateSub: 'אחוז זכיות', totalTrades: 'סך טריידים', allTime: 'כל הזמנים',
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
    email: 'אימייל', password: 'סיסמה', signIn: 'התחברות', signUp: 'הרשמה',
    noAccount: 'אין לך חשבון?', haveAccount: 'כבר יש לך חשבון?', orContinueWith: 'או המשך עם',
    tagline: 'יומן מסחר חכם',
    weekly: 'שבועי', calendar: 'לוח שנה', listView: 'רשימה',
    long: 'לונג', short: 'שורט',
    liveLabel: 'חי', realtimeScanner: 'סורק מומנטום בזמן אמת',
    floatLabel: 'פלואט', volLabel: 'ווליום',
    criteriaChange: 'שינוי% +20 ●', criteriaPrice: 'מחיר $2-$20 ●', criteriaFloat: 'פלואט מתחת ל-20M ●', criteriaData: 'מקור נתונים',
    demoLabel: 'דמו',
    pendingApprovalTitle: 'החשבון שלך ממתין לאישור',
    pendingApprovalBody: 'תודה שנרשמת ל-StockScan! הגישה לאפליקציה מוגבלת כרגע למשתמשים מאושרים. ניצור איתך קשר ברגע שהחשבון שלך יאושר.',
    backToLogin: 'חזרה למסך התחברות',
    addTradeTitle: 'הוספת טרייד', symbolLabel: 'סימבול', sideLabel: 'כיוון',
    entryPrice: 'מחיר כניסה', exitPrice: 'מחיר $2-$20 ●', criteriaFloat: 'פלואט מתחת ל-20M ●', criteriaData: 'מקור נתונים',
    demoLabel: 'דמו',
    pendingApprovalTitle: 'החשבון שלך ממתין לאישור',
    pendingApprovalBody: 'תודה שנרשמת ל-StockScan! הגישה לאפליקציה מוגבלת כרגע למשתמשים מאושרים. ניצור איתך קשר ברגע שהחשבון שלך יאושר.',
    backToLogin: 'חזרה למסך התחברות',
    addTradeTitle: 'הוספת טרייד', symbolLabel: 'סימבול', sideLabel: 'כיוון',
    entryPrice: 'מחיר כניסה', exitPrice: 'מחיר יציאה', qtyLabel: 'כמות', dateLabel: 'תאריך',
    saveTrade: 'שמור טרייד', createAccountFirst: 'צור קודם חשבון מסחר בהגדרות', fillAllFields: 'נא למלא את כל השדות',
    lossStreakLimit: 'מגבלת רצף הפסדים', lossStreakDesc: 'התראה לאחר רצף כזה של טריידים מפסידים',
    maxTradesPerDay: 'מקסימום טריידים ביום', maxTradesDesc: 'מספר הטריידים המרבי המותר ביום',
    dailyLossLimit: '($) מגבלת הפסד יומי', dailyLossDesc: 'התראה כשההפסד היומי חורג מסכום זה',
    dailyProfitTarget: '($) יעד רווח יומי', dailyProfitDesc: 'יעד הרווח היומי שלך (למעקב בלבד)',
    saveDataSource: 'שמור מקור נתונים', accountLabel: 'חשבון',
    adminTitle: 'ניהול משתמשים', adminSub: 'אשר או בטל אישור למשתמשים',
    approveBtn: 'אשר', revokeBtn: 'בטל אישור', pendingBadge: 'ממתין', approvedBadge: 'מאושר',
    noUsers: 'אין עדיין משתמשים רשומים', signedUpOn: 'נרשם ב-'
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
    noAccount: "Don't have an account?", haveAccount: 'Already have an account?', orContinueWith: 'Or continue with',
    tagline: 'Smart Trading Journal',
    weekly: 'Weekly', calendar: 'Calendar', listView: 'List',
    long: 'Long', short: 'Short',
    liveLabel: 'Live', realtimeScanner: 'Real-time momentum scanner',
    floatLabel: 'Float', volLabel: 'Vol',
    criteriaChange: '+Change 20% ●', criteriaPrice: 'Price $2-$20 ●', criteriaFloat: 'Float under 20M ●', criteriaData: 'Data',
    demoLabel: 'Demo',
    pendingApprovalTitle: 'Your account is pending approval',
    pendingApprovalBody: "Thanks for signing up to StockScan! Access is currently limited to approved users. We'll be in touch once your account is approved.",
    backToLogin: 'Back to sign in',
    addTradeTitle: 'Add Trade', symbolLabel: 'Symbol', sideLabel: 'Side',
    entryPrice: 'Entry Price', exitPrice: 'Exit Price', qtyLabel: 'Quantity', dateLabel: 'Date',
    saveTrade: 'Save Trade', createAccountFirst: 'Create a trading account in Settings first', fillAllFields: 'Please fill in all fields',
    lossStreakLimit: 'Loss Streak Limit', lossStreakDesc: 'Alert after this many consecutive losing trades',
    maxTradesPerDay: 'Max Trades Per Day', maxTradesDesc: 'Maximum number of trades allowed per day',
    dailyLossLimit: '($) Daily Loss Limit', dailyLossDesc: 'Alert when daily losses exceed this amount',
    dailyProfitTarget: '($) Daily Profit Target', dailyProfitDesc: 'Your daily profit goal (for tracking purposes)',
    saveDataSource: 'Save Data Source', accountLabel: 'Account',
    adminTitle: 'User Management', adminSub: 'Approve or revoke access for users',
    approveBtn: 'Approve', revokeBtn: 'Revoke', pendingBadge: 'Pending', approvedBadge: 'Approved',
    noUsers: 'No users signed up yet', signedUpOn: 'Signed up '
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
