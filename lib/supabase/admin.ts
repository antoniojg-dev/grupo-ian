import { createClient } from '@supabase/supabase-js'

// Admin client con service role key — SOLO usar server-side
// Nunca exponer al cliente. Permite operaciones admin: invite users, bypass RLS.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
