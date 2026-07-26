import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './useAuth';

const ACTIVE_ACCOUNT_KEY = 'stockscan_active_account';

export function useAppData() {
  const { user, loading: authLoading, apiFetch } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [trades, setTrades] = useState([]);
  const [guard, setGuard] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.replace('/login'); return; }
    (async () => {
      try {
        const prof = await apiFetch('/api/profile');
        setProfile(prof);
        if (!prof.approved) { router.replace('/pending'); return; }
        const [accs, trds, gs] = await Promise.all([
          apiFetch('/api/accounts'),
          apiFetch('/api/trades'),
          apiFetch('/api/settings')
        ]);
        setAccounts(accs);
        setTrades(trds);
        setGuard(gs);
        const stored = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_ACCOUNT_KEY) : null;
        const validStored = accs.find(a => a.id === stored);
        setActiveAccountId(validStored ? stored : (accs[0]?.id || null));
      } finally {
        setReady(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const selectAccount = useCallback((id) => {
    setActiveAccountId(id);
    if (typeof window !== 'undefined') localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
  }, []);

  const refreshTrades = useCallback(async () => {
    const trds = await apiFetch('/api/trades');
    setTrades(trds);
  }, [apiFetch]);

  const refreshAccounts = useCallback(async () => {
    const accs = await apiFetch('/api/accounts');
    setAccounts(accs);
    if (!accs.find(a => a.id === activeAccountId)) selectAccount(accs[0]?.id || null);
  }, [apiFetch, activeAccountId, selectAccount]);

  const activeAccount = accounts.find(a => a.id === activeAccountId) || null;
  const accountTrades = trades.filter(t => t.account_id === activeAccountId);

  return {
    user, ready, apiFetch, profile,
    accounts, activeAccount, activeAccountId, selectAccount, refreshAccounts,
    trades: accountTrades, allTrades: trades, refreshTrades,
    guard, setGuard
  };
}
