import { supabase } from '$lib/supabaseClient'

export async function load() {
  const { data: financiers } = await supabase
    .from('financiers')
    .select('*')
  
  return { financiers: financiers ?? [] }
}
