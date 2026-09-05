import { createBrowserClient } from '@supabase/ssr';

export function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'preview-placeholder-key';

  return createBrowserClient(url, key);
}
