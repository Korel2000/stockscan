import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

const HISTORY_KEY = 'stockscan_assistant_history';
const MAX_HISTORY = 40;

export function useAssistant() {
  const { apiFetch } = useAuth();
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const contextRef = useRef('');
  const contextLoaded = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (Array.isArray(stored)) setMessages(stored);
    } catch {
      // ignore corrupt local storage
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  }, [messages]);

  const loadContext = useCallback(async () => {
    if (contextLoaded.current) return contextRef.current;
    try {
      const [trades, guard] = await Promise.all([
        apiFetch('/api/trades'),
        apiFetch('/api/settings')
      ]);
      const total = trades.length;
      const wins = trades.filter((tr) => Number(tr.pnl) > 0).length;
      const winRate = total ? Math.round((wins / total) * 100) : 0;
      const provider = guard?.scanner_provider || 'demo';
      contextRef.current = `למשתמש ${total} טריידים ביומן, אחוז ניצחונות ${winRate}%. מקור נתוני הסורק שלו: ${provider}.`;
      contextLoaded.current = true;
    } catch {
      contextRef.current = '';
    }
    return contextRef.current;
  }, [apiFetch]);

  const send = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || busy) return;
    setErr('');
    const userMsg = { role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setBusy(true);
    try {
      const context = await loadContext();
      const res = await apiFetch('/api/assistant', {
        method: 'POST',
        body: JSON.stringify({ messages: next, context })
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (e) {
      setErr(e.message || 'שגיאה, נסה שוב');
    } finally {
      setBusy(false);
    }
  }, [messages, busy, apiFetch, loadContext]);

  const clear = useCallback(() => {
    setMessages([]);
    setErr('');
    if (typeof window !== 'undefined') localStorage.removeItem(HISTORY_KEY);
  }, []);

  return { messages, send, busy, err, open, setOpen, clear };
}
