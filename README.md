# StockScan — גרסה מלאה (Backend אמיתי + Push אמיתי)

זו הגרסה המלאה: משתמשים אמיתיים, מסד נתונים (Supabase), וחשוב מכל — **התראות Push אמיתיות שמגיעות גם כשהטלפון נעול**, בדיוק כמו ב-4traders.

## מה שונה מהגרסה הקודמת שקיבלת
הגרסה הראשונה (`stockscan-app.zip`) שמרה הכל בדפדפן בלבד (localStorage) — בלי חשבון משתמש אמיתי ובלי Push אמיתי.
הגרסה הזו היא אפליקציית **Next.js** מלאה עם:
- הרשמה/התחברות אמיתית (Supabase Auth)
- מסד נתונים אמיתי — כל משתמש רואה רק את הנתונים שלו (Row Level Security)
- נקודת קצה `/api/scan` שסורק את השוק ושולח Push אמיתי — מיועדת להיקרא ע"י מתזמן חיצוני (cron) כל דקה, גם כשאף אחד לא פתוח באתר

---

## שלב 1 — הקמת Supabase (חינם, ~3 דקות)
אני לא יכול ליצור לך חשבון בעצמי (מסיבות אבטחה), אבל זה ממש מהיר:

1. גלוש ל-https://supabase.com → **Start your project** → התחבר עם GitHub/Google.
2. **New Project** → תן שם (למשל `stockscan`) → בחר סיסמה למסד הנתונים (שמור אותה) → בחר אזור קרוב (Frankfurt/London) → **Create**.
3. חכה כדקה עד שהפרויקט מוכן.
4. **בצד שמאל → SQL Editor → New query.** העתק את כל תוכן הקובץ `supabase/schema.sql` שבתיקייה הזו, הדבק, ולחץ **Run**. זה יוצר את כל הטבלאות וההרשאות.
5. **בצד שמאל → Project Settings → API.** משם תעתיק:
   - `Project URL` → זה ה-`NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → זה ה-`NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (בלחיצה על "Reveal") → זה ה-`SUPABASE_SERVICE_ROLE_KEY` — **סודי, אף פעם לא לחשוף בצד לקוח**

## שלב 2 — יצירת מפתחות Push (VAPID) — לא צריך שירות חיצוני
```bash
npm install
npm run vapid
```
זה ידפיס `VAPID_PUBLIC_KEY` ו-`VAPID_PRIVATE_KEY`. שמור את שניהם.

## שלב 3 — קובץ הסביבה
העתק את `.env.example` בשם `.env.local` ומלא את כל הערכים שאספת:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # אותו ערך כמו VAPID_PUBLIC_KEY
CRON_SECRET=בחר-מחרוזת-אקראית-וארוכה
```

## שלב 4 — הרצה מקומית (לבדיקה)
```bash
npm install
npm run dev
```
פתח http://localhost:3000 → הירשם עם מייל וסיסמה → תתחיל לעבוד.

## שלב 5 — פריסה ל-Vercel
1. העלה את התיקייה לריפו ב-GitHub (או `vercel` ישירות מהטרמינל).
2. ב-https://vercel.com/new ייבא את הריפו.
3. **חשוב:** בהגדרות הפרויקט → Environment Variables — הכנס את **כל** המשתנים מ-`.env.local` (כולל ה-secret keys).
4. Deploy.

## שלב 6 — התראות Push בזמן אמת (החלק החשוב)
כדי שההתראות יגיעו **גם כשהטלפון נעול**, נקודת הקצה `/api/scan` צריכה להיקרא כל דקה-שתיים ע"י מישהו חיצוני. יש שתי דרכים:

### אופציה א' — מתזמן חיצוני חינמי (מומלץ, עובד כל דקה)
Vercel בתוכנית החינמית (Hobby) מגבילה Cron מובנה לפעם ביום בלבד. **הפתרון:** שירות חיצוני שפשוט קורא ל-URL שלך:
1. הרשם בחינם ל-https://cron-job.org (או Runhooks/EasyCron).
2. צור Job חדש שקורא כל דקה ל:
   ```
   https://YOUR-APP.vercel.app/api/scan?secret=CRON_SECRET_SHELCHA
   ```
3. זהו — עכשיו השוק נסרק כל דקה, גם כשאף אחד לא פתוח באפליקציה, ומי שיש לו Heat≥85 מקבל Push אמיתי.

### אופציה ב' — Vercel Cron מובנה (רק בתוכנית Pro, $20/חודש)
`vercel.json` כבר כולל דוגמה לקריאה יומית אחת (עובד גם בחינמי). אם תשדרג ל-Pro, אפשר לשנות ל-`schedule: "*/1 * * * *"` לקריאה כל דקה.

## שלב 7 — הפעלת ההתראות אצל המשתמש
בתוך האפליקציה → עמוד **Scanner** → כפתור "🔔 הפעל התראות פוש" → מאשרים הרשאה בדפדפן/בטלפון. מאותו רגע השרת יודע לשלוח להם Push אמיתי.

**באייפון:** Push עובד רק אחרי שהאפליקציה **הותקנה** למסך הבית (Safari → שיתוף → הוסף למסך הבית) — זו מגבלה של אפל, לא של הקוד.

---

## התחברות עם Google / Facebook / X (Twitter)
הוספתי כפתורי התחברות עם Google, Facebook ו-X בעמוד ה-Login. **חשוב להבין:** אני לא יכול ליצור לך את חשבונות המפתחים האלה (Google Cloud, Meta for Developers, X Developer Portal) - זה תהליך שדורש שאתה עצמך תיצור ותאשר, כי הוא כרוך בקבלת הסכמים וקישור לחשבונך האישי. הנה בדיוק מה לעשות לכל ספק:

### Google
1. https://console.cloud.google.com → צור פרויקט → **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**. Authorized redirect URI:
   `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. תעתיק את ה-Client ID וה-Client Secret.
4. ב-Supabase Dashboard → **Authentication → Providers → Google** → הדבק את שניהם → Enable → Save.

### Facebook
1. https://developers.facebook.com/apps → Create App → Consumer → הוסף מוצר **Facebook Login**.
2. Valid OAuth Redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. תעתיק App ID ו-App Secret ל-Supabase Dashboard → **Authentication → Providers → Facebook**.

### X (Twitter)
1. https://developer.twitter.com/en/portal/dashboard → צור אפליקציה → הפעל **OAuth 2.0**.
2. Callback URL: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
3. תעתיק Client ID ו-Client Secret ל-Supabase Dashboard → **Authentication → Providers → Twitter**.

אחרי שהפעלת ולו ספק אחד ב-Supabase, הכפתור המתאים בעמוד ה-Login כבר יעבוד — אין צורך בשינוי קוד. ספק שלא הפעלת ב-Supabase פשוט יחזיר שגיאה אם ילחצו עליו.

## שפה - עברית/אנגלית
בכל עמוד, בפינה למעלה (וגם בתחתית התפריט הצדי) יש כפתור החלפת שפה (עברית ⇄ English). הבחירה נשמרת במכשיר (localStorage) ונטענת אוטומטית בפעם הבאה. המילון המלא נמצא ב-`lib/i18n.js` — קל להוסיף שם עוד ביטויים אם משהו נשאר לא מתורגם.

## לגבי Interactive Brokers (IBKR)
כמו שהסברתי קודם: ל-IBKR אין REST API פשוט עם מפתח. חיבור אמיתי דורש **IB Gateway** או **Client Portal Gateway** רץ על מחשב שלך עם התחברות פעילה. בהגדרות האפליקציה יש שדה לכתובת ה-Gateway המקומי (`https://localhost:5000`), אבל שרת ה-cron בענן **לא יכול** לגשת אליו — רק דפדפן שרץ על אותה רשת. לכן ה-cron הסורק תמיד יעבוד עם Demo/Alpaca; IBKR מוגבל לשימוש מקומי מהדפדפן בלבד.

Alpaca לעומת זאת עובד מצוין גם מהשרת (ה-cron) וגם מהדפדפן — אם אתה רוצה נתונים אמיתיים בלי כאב ראש, זו הבחירה הכי פשוטה.

## מבנה הקבצים
```
pages/              — כל מסכי ה-Next.js (dashboard, journal, analytics, scanner, settings, login)
pages/api/          — trades, accounts, settings, subscribe (שמירת מנוי Push), scan (ה-cron), scan-preview (תצוגה חיה)
lib/                — supabaseClient (דפדפן), supabaseAdmin (שרת בלבד), useAuth, useAppData, scanner (לוגיקת סריקה)
components/         — Layout, AddTradeModal, Toast
supabase/schema.sql — כל טבלאות המסד + הרשאות
public/             — manifest.json, sw.js (Service Worker + Push), אייקונים
scripts/generate-vapid.js — יצירת מפתחות Push בלי תלות בשירות חיצוני
```
