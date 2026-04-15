import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { env } from '$env/dynamic/private'

// Service role client — bypast RLS volledig. Alleen server-side gebruiken.
// Stel SUPABASE_SERVICE_ROLE_KEY in via .env.local:
//   Supabase Dashboard → Project Settings → API → service_role key
//
// Geen Database generic: mutations (insert/update/delete) zijn untyped (any).
// Type-veiligheid voor server routes wordt geborgd via expliciete return types
// op de load-functies en type assertions op query resultaten.

const key = env.SUPABASE_SERVICE_ROLE_KEY
if (!key) {
  throw new Error(
    '[Admin] SUPABASE_SERVICE_ROLE_KEY ontbreekt.\n' +
      'Voeg toe aan .env.local:\n' +
      '  SUPABASE_SERVICE_ROLE_KEY=<service-role-key>\n' +
      'Vindplaats: Supabase Dashboard → Project Settings → API',
  )
}

export const supabaseAdmin = createClient(PUBLIC_SUPABASE_URL, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
