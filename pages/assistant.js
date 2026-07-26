import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAppData } from '../lib/useAppData';
import { useAssistant } from '../lib/useAssistant';
import { useLanguage } from '../lib/i18n';

export default function AssistantPage() {
  const data = useAppData();
  const { t } = useLanguage();
  const { messages, send, busy, err, clear } = useAssistant();
  const [input, setInput] = useState('');
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, busy]);

  if (!data.ready) return <Layout><div className="page" /></Layout>;

  function submit(e) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    send(input);
    setInput('');
  }

  const suggestions = [t('assistantSuggest1'), t('assistantSuggest2'), t('assistantSuggest3')];

  return (
    <Layout activeAccountName={data.activeAccount?.name} accountCount={data.accounts.length} isAdmin={data.profile?.isAdmin}>
      <section className="page">
        <div className="page-head"><div><h1>{t('assistantTitle')}</h1><p>{t('assistantPageSub')}</p></div></div>

        <div className="panel assistant-page-panel">
          <div className="chat-body assistant-page-body" ref={bodyRef}>
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

          <div className="assistant-page-foot">
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12 }} onClick={clear}>{t('assistantClear')}</button>
            <p className="assistant-disclaimer">{t('assistantDisclaimer')}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
