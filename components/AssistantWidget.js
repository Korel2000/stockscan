import { useState, useRef, useEffect } from 'react';
import { useAssistant } from '../lib/useAssistant';
import { useLanguage } from '../lib/i18n';

export default function AssistantWidget() {
  const { t } = useLanguage();
  const { messages, send, busy, err, open, setOpen, clear } = useAssistant();
  const [input, setInput] = useState('');
  const bodyRef = useRef(null);

  useEffect(() => {
    if (open && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, open, busy]);

  function submit(e) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    send(input);
    setInput('');
  }

  const suggestions = [t('assistantSuggest1'), t('assistantSuggest2'), t('assistantSuggest3')];

  return (
    <>
      <button
        type="button"
        className="ai-fab"
        aria-label={open ? t('assistantClose') : t('assistantOpen')}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? '✕' : '🤖'}
      </button>

      <div className={`chat-panel ${open ? 'show' : ''}`} role="dialog" aria-hidden={!open} aria-label={t('assistantTitle')}>
        <div className="chat-head">
          <div className="avatar">🤖</div>
          <strong>{t('assistantTitle')}</strong>
          <span className="chat-close" role="button" tabIndex={0} aria-label={t('assistantClear')} onClick={clear}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && clear()}>
            ⟲
          </span>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {messages.length === 0 && <p className="hint muted">{t('assistantEmpty')}</p>}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>{m.content}</div>
          ))}
          {busy && <div className="msg bot" aria-live="polite">…</div>}
          {err && <p className="assistant-err">{err}</p>}
        </div>

        {messages.length === 0 && (
          <div className="chat-suggest">
            {suggestions.map((s, i) => (
              <button key={i} type="button" className="chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <form className="chat-input-row" onSubmit={submit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('assistantPlaceholder')}
            aria-label={t('assistantPlaceholder')}
          />
          <button className="chat-send" type="submit" disabled={busy || !input.trim()} aria-label={t('assistantSend')}>➤</button>
        </form>
      </div>
    </>
  );
}
