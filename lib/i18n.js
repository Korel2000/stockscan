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
    entryPrice: 'מחיר כניסה', exitPrice: 'מחיר יציאה', qtyLabel: 'כמות', dateLabel: 'תאריך',
    saveTrade: 'שמור טרייד', createAccountFirst: 'צור קודם חשבון מסחר בהגדרות', fillAllFields: 'נא למלא את כל השדות',
    lossStreakLimit: 'מגבלת רצף הפסדים', lossStreakDesc: 'התראה לאחר רצף כזה של טריידים מפסידים',
    maxTradesPerDay: 'מקסימום טריידים ביום', maxTradesDesc: 'מספר הטריידים המרבי המותר ביום',
    dailyLossLimit: '($) מגבלת הפסד יומי', dailyLossDesc: 'התראה כשההפסד היומי חורג מסכום זה',
    dailyProfitTarget: '($) יעד רווח יומי', dailyProfitDesc: 'יעד הרווח היומי שלך (למעקב בלבד)',
    saveDataSource: 'שמור מקור נתונים', accountLabel: 'חשבון',
    adminTitle: 'ניהול משתמשים', adminSub: 'אשר או בטל אישור למשתמשים',
    approveBtn: 'אשר', revokeBtn: 'בטל אישור', pendingBadge: 'ממתין', approvedBadge: 'מאושר',
    noUsers: 'אין עדיין משתמשים רשומים', signedUpOn: 'נרשם ב-',
    assistantTitle: 'עוזר AI', assistantPageSub: 'שאל שאלות על מסחר, פני סטוקס, או על ביצועי המסחר שלך',
    assistantOpen: 'פתח את עוזר ה-AI', assistantClose: 'סגור את עוזר ה-AI', assistantClear: 'שיחה חדשה',
    assistantEmpty: 'שאל אותי כל דבר על מומנטום, פני סטוקס, או תבקש ניתוח קצר של היומן שלך.',
    assistantPlaceholder: 'שאל את העוזר...', assistantSend: 'שלח',
    assistantDisclaimer: 'עוזר ה-AI נותן מידע כללי בלבד ואינו מהווה ייעוץ השקעות. מסחר כרוך בסיכון.',
    assistantSuggest1: 'למה מניה מסוימת עשויה להופיע בסורק?',
    assistantSuggest2: 'תן לי ניתוח קצר של הביצועים שלי',
    assistantSuggest3: 'מה זה float קטן ולמה זה חשוב במומנטום?',
    confirmDeleteTrade: 'למחוק את הטרייד הזה? הפעולה בלתי הפיכה.',
    confirmDeleteAccount: 'למחוק את החשבון הזה וכל הטריידים שלו? הפעולה בלתי הפיכה.',
    saving: 'שומר...',
    maxDrawdown: 'שקיעה מקסימלית (Drawdown)', maxDrawdownSub: 'הירידה הגדולה ביותר משיא ה-P&L המצטבר',
    topSymbols: 'המניות המובילות שלך', topSymbolsSub: 'רווח ואחוז ניצחונות לפי סימבול',
    landingHeroTitle: 'סריקת מומנטום, יומן ואנליטיקה. במקום אחד.',
    landingHeroSub: 'סורק פני-סטוקס חכם, יומן מסחר, אנליטיקה שמכירה אותך, ועוזר AI — הכל באפליקציה אחת.',
    landingCta: 'התחלה עכשיו ✦', landingHowItWorks: 'איך זה עובד ↓',
    landingFeatScannerTitle: 'הסורק לא מחפש 10,000 מניות. הוא מחפש את אלה שזזות.',
    landingFeatScannerBody: 'קריטריונים ברורים — מחיר $2-$20, שינוי אחוזי גבוה, Float נמוך. לא רעש.',
    landingFeatJournalTitle: 'יומן מסחר שלא גוזל לך זמן',
    landingFeatJournalBody: 'תיעוד טריידים מהיר, כמה חשבונות Live/Demo באותה כניסה, P&L מחושב אוטומטית.',
    landingFeatAnalyticsTitle: 'עד עכשיו סחרת בעיוור. עכשיו את/ה יודע/ת מה עובד.',
    landingFeatAnalyticsBody: 'המניות המובילות שלך, Win Rate, Drawdown — ניהול סיכונים אמיתי, לא תחושת בטן.',
    landingFeatAssistantTitle: 'עוזר AI תמיד זמין',
    landingFeatAssistantBody: 'שאל שאלות על מומנטום, פני סטוקס, או בקש ניתוח קצר על היומן שלך — בכל רגע.',
    landingInstallTitle: 'התקנה על הטלפון', landingInstallSub: 'בלי חנות אפליקציות · פועל ישירות בדפדפן',
    landingInstallIosSteps: 'פותחים Safari (לא Chrome) ← גולשים לאתר ← לוחצים על שיתוף ← הוסף למסך הבית',
    landingInstallAndroidSteps: 'פותחים Chrome ← גולשים לאתר ← שלוש הנקודות ← התקנת אפליקציה',
    landingDisclaimer: 'איננו יועצי השקעות · כל השקעה כרוכה בסיכון · העבר אינו מעיד על העתיד',
    landingFooterRights: 'כל הזכויות שמורות',
    importCsv: 'ייבוא CSV', importCsvNoAccount: 'צור קודם חשבון מסחר בהגדרות',
    importCsvConfirm: 'לייבא {n} טריידים מהקובץ?',
    importCsvSuccess: 'יובאו {n} טריידים בהצלחה ({s} שורות דולגו)',
    importCsvError: 'שגיאה בייבוא הקובץ. ודא שהעמודות הן symbol,side,entry,exit,qty,trade_date',
    landingHeroLine1: 'הסורק שמוצא', landingHeroLine2: 'את המניות שבאמת זזות.',
    landingFreeNote: 'הרשמה חינמית ✦ ללא כרטיס אשראי',
    landingScannerTitle: 'מה מקבלים בסורק?', landingScannerSub: 'לא עוד גלילה בין 10,000 מניות — רק אלה שעונות על הקריטריונים שלך',
    landingScannerPoint1: 'רענון אוטומטי כל 15 שניות — תמיד רואה את הרגע הנכון',
    landingScannerPoint2: 'ציון Heat מ-0 עד 100 לכל מניה — יודע מיד כמה היא חמה',
    landingScannerPoint3: 'בחירת מקור נתונים: Demo, Alpaca או IBKR',
    landingScannerPoint4: 'התראת Push ברגע שמניה נכנסת לרשימה'
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
    noUsers: 'No users signed up yet', signedUpOn: 'Signed up ',
    assistantTitle: 'AI Assistant', assistantPageSub: 'Ask about trading, penny stocks, or your own trading performance',
    assistantOpen: 'Open the AI assistant', assistantClose: 'Close the AI assistant', assistantClear: 'New chat',
    assistantEmpty: 'Ask me anything about momentum trading, penny stocks, or request a quick read on your journal.',
    assistantPlaceholder: 'Ask the assistant...', assistantSend: 'Send',
    assistantDisclaimer: 'The AI assistant gives general information only and is not investment advice. Trading involves risk.',
    assistantSuggest1: 'Why might a stock show up in the scanner?',
    assistantSuggest2: 'Give me a quick read on my performance',
    assistantSuggest3: "What's a small float and why does it matter for momentum?",
    confirmDeleteTrade: 'Delete this trade? This cannot be undone.',
    confirmDeleteAccount: 'Delete this account and all its trades? This cannot be undone.',
    saving: 'Saving...',
    maxDrawdown: 'Max Drawdown', maxDrawdownSub: 'Largest drop from a cumulative P&L peak',
    topSymbols: 'Your Top Symbols', topSymbolsSub: 'Profit and win rate by symbol',
    landingHeroTitle: 'Momentum scanning, journal, and analytics. One place.',
    landingHeroSub: 'A smart penny-stock scanner, trading journal, analytics that know you, and an AI assistant — all in one app.',
    landingCta: 'Get Started ✦', landingHowItWorks: 'How it works ↓',
    landingFeatScannerTitle: "The scanner doesn't search 10,000 stocks. It finds the ones actually moving.",
    landingFeatScannerBody: 'Clear criteria — $2-$20 price, high % change, low float. No noise.',
    landingFeatJournalTitle: 'A trading journal that saves you time',
    landingFeatJournalBody: 'Fast trade logging, multiple Live/Demo accounts in one login, P&L calculated automatically.',
    landingFeatAnalyticsTitle: "Until now you traded blind. Now you know what works.",
    landingFeatAnalyticsBody: 'Your top symbols, win rate, drawdown — real risk management, not gut feel.',
    landingFeatAssistantTitle: 'An AI assistant, always on',
    landingFeatAssistantBody: 'Ask about momentum, penny stocks, or request a quick read on your journal — anytime.',
    landingInstallTitle: 'Install on your phone', landingInstallSub: 'No app store · runs directly in the browser',
    landingInstallIosSteps: 'Open Safari (not Chrome) → go to the site → tap Share → Add to Home Screen',
    landingInstallAndroidSteps: 'Open Chrome → go to the site → three dots → Install app',
    landingDisclaimer: "We are not investment advisors · all trading involves risk · past performance doesn't guarantee future results",
    landingFooterRights: 'All rights reserved',
    importCsv: 'Import CSV', importCsvNoAccount: 'Create a trading account in Settings first',
    importCsvConfirm: 'Import {n} trades from this file?',
    importCsvSuccess: '{n} trades imported successfully ({s} rows skipped)',
    importCsvError: 'Error importing file. Make sure the columns are symbol,side,entry,exit,qty,trade_date',
    landingHeroLine1: 'The scanner that finds', landingHeroLine2: 'the stocks that are actually moving.',
    landingFreeNote: 'Free signup ✦ No credit card required',
    landingScannerTitle: 'What do you get in the scanner?', landingScannerSub: "No more scrolling through 10,000 stocks — only the ones that match your criteria",
    landingScannerPoint1: 'Auto-refreshes every 15 seconds — always see the right moment',
    landingScannerPoint2: 'Heat score from 0 to 100 for every stock — know instantly how hot it is',
    landingScannerPoint3: 'Choose your data source: Demo, Alpaca, or IBKR',
    landingScannerPoint4: 'Push alert the moment a stock enters the list'
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
