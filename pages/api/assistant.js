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
    'אתה לא נותן ייעוץ השקעות אישי או המלצות קנייה/מכירה קונקרטיות, לא מבטיחים, ותמיד מזכיר בקצרה שמסחר כרוך בסיכון ושזה לא ייעוץ השקעות.',
    'ענה תממיד באנגלית איל שרנות. שמור על תשובות תמציתיות וברורות, בלי הקדמות מיותרות.',
    context ? `\n\nהקשר נוכחי מהאפליקציה על המשתמש:\n${context}` : ''
  ].join(' ');

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
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

    const data = await r.json();
    if (!r.ok) {
      return res.status(502).json({ error: data?.error?.message || 'שגיאה בפנייה לעוזר ה-AI' });
    }

    const reply = (data.content || [])
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return res.status(200).json({ reply: reply || 'לא הצלחתי לענות כרגע, נסה שוב.' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
