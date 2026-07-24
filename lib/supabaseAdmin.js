import { createClient } from '@supabase/supabase-js';

// Service-role key must NEVER be exposed to the browser — only import this
// file from files under pages/api/.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
