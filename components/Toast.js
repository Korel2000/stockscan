import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  const toast = useCallback((text) => {
    setMsg(text);
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 2400);
  }, []);

  const ToastEl = () => <div className={`toast ${show ? 'show' : ''}`}>{msg}</div>;
  return { toast, ToastEl };
}
