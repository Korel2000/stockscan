import { requireApprovedUser } from '../../lib/apiAuth';

// AI trading assistant — answers general trading questions, explains scanner
// results, and gives a lightweight read on the user's own journal stats.
// Requires ANTHROPIC_API_KEY to be set as a server-side env var (never exposed
// to the client). See .env.example.
export default async function handler(req, res) {
  const auth = await requireApprovedUser(req, res);
  if (!auth) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { messages, context } = req.body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'חסרות הודעות' });
  }
  if (messages.length > 40) {
    return res.status(400).json({ error: 'יותר מדי הודעות בשיחה, התחל שיחה חדשה' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'עוזר ה-AI לא הוגדר עדיין (חסר ANTHROPIC_API_KEY)' });
  }

  const systemPrompt = [
    'אתה עוזר מסחר ידידותי בתוך אפליקציית StockScan, המיועדת לסוחרי מומנטום ב-penny stocks (מניות בשווי נמוך, פלואט קטן ותנודתיות גבוהה).',
    'אתה יכול: לענות על שאלות כלליות על מסחר ואסטרטגיות מומנטום, להסביר מדוע מניה עשויה להופיע בסורק (שינוי אחוזי גבוה, פלואט נמוך, נפח מסחר גבוה, טווח מחיר $2-$20), ולתת קריאה קצרה וכללית על נתוני היומן של המשתמש כשסופקו.',
    'אם ההקשר כולל נתוני יסוד (Fundamentals) של מניה ספציפית — תיאור חברה ונתוני דוחות כספיים — ורק אז, ספק "סיכום מנהלים" קצר בדיוק בשלושה בולטים: (1) יתרון תחרותי מרכזי, (2) סיכון מרכזי, (3) מגמה בתוצאות האחרונות. אל תמציא מספרים שלא סופקו לך.',
    'אתה לא נותן ייעוץ השקעות אישי או המלצות קנייה/מכירה קונקרטיות, לא מבטיח רווחים, ותמיד מזכיר בקצרה שמסחר כרוך בסיכון ושזה לא ייעוץ השקעות.',
    'ענה תמיד בעברית אלא אם המשתמש כותב באנגלית. שמור על תשובות תמציתיות וברורות, בלי הקדמות מיותרות.',
    context ? `\n\nהקשר נוכחי מהאפליקציה על המשתמש:\n${context}` : ''
  ].join(' ');

  // A hung upstream request used to leave the trader staring at a spinner
  // forever with no error at all. Fail fast with a clear message instead —
  // paired with the maxDuration bump in vercel.json so the platform itself
  // doesn't kill the function first with a bare 504.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages
          .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .map((m) => ({ role: m.role, content: m.content }))
      })
    });
    clearTimeout(timeout);

    let data;
    try {
      data = await r.json();
    } catch {
      return res.status(502).json({ error: 'תגובה לא תקינה מהעוזר. נסה שוב.' });
    }

    if (!r.ok) {
      const msg = data?.error?.message || '';
      if (r.status === 401) return res.status(502).json({ error: 'מפתח ה-API של העוזר לא תקין. פנה למנהל המערכת.' });
      if (r.status === 429) return res.status(502).json({ error: 'העוזר עמוס כרגע, נסה שוב בעוד רגע.' });
      return res.status(502).json({ error: msg || 'שגיאה בפנייה לעוזר ה-AI' });
    }

    const reply = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return res.status(200).json({ reply: reply || 'לא הצלחתי לענות כרגע, נסה שוב.' });
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === 'AbortError') {
      return res.status(504).json({ error: 'העוזר לא הגיב בזמן. נסה שוב בעוד רגע.' });
    }
    return res.status(500).json({ error: e.message || 'שגיאת רשת בפנייה לעוזר' });
  }
}
