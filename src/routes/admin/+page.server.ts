import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { supabaseAdmin } from '$lib/server/supabaseAdmin'
import type { Financier } from '$lib/types'

type AdminFinancier = Pick<Financier, 'id' | 'naam' | 'website' | 'actief' | 'created_at'> & {
  producten: { id: string; actief: boolean }[]
}

export async function load() {
  const { data, error } = await supabaseAdmin
    .from('financiers')
    .select('id, naam, website, actief, created_at, producten(id, actief)')
    .order('actief', { ascending: false })
    .order('naam')

  if (error) throw new Error(error.message)
  return { financiers: (data ?? []) as AdminFinancier[] }
}

export const actions: Actions = {
  toevoegen: async ({ request }) => {
    const formData = await request.formData()

    const naam = formData.get('naam')?.toString().trim()
    if (!naam) return fail(400, { fout: 'Naam is verplicht', veld: 'naam' })

    const { data: nieuw, error } = await supabaseAdmin
      .from('financiers')
      .insert({
        naam,
        website: formData.get('website')?.toString().trim() || null,
        logo_url: formData.get('logo_url')?.toString().trim() || null,
        contactpersoon: formData.get('contactpersoon')?.toString().trim() || null,
        email: formData.get('email')?.toString().trim() || null,
        telefoon: formData.get('telefoon')?.toString().trim() || null,
        notities: formData.get('notities')?.toString().trim() || null,
      })
      .select('id')
      .single()

    if (error) return fail(500, { fout: error.message })

    redirect(303, `/admin/${(nieuw as { id: string }).id}`)
  },
}
