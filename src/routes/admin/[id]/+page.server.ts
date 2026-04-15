import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { supabaseAdmin } from '$lib/server/supabaseAdmin'
import type { Financier, Product, AssetClass, Regio, ProductType } from '$lib/types'

type AdminProduct = Pick<
  Product,
  'id' | 'naam' | 'type' | 'actief' | 'min_bedrag' | 'max_bedrag' | 'asset_classes' | 'regios'
>

type AdminFinancier = Financier & { producten: AdminProduct[] }

export async function load({ params }: { params: { id: string } }) {
  const { data, error: err } = await supabaseAdmin
    .from('financiers')
    .select(`
      *,
      producten(id, naam, type, actief, min_bedrag, max_bedrag, asset_classes, regios)
    `)
    .eq('id', params.id)
    .single()

  if (err || !data) throw error(404, 'Financier niet gevonden')

  const financier = data as AdminFinancier
  financier.producten = [...(financier.producten ?? [])].sort((a: AdminProduct, b: AdminProduct) => {
    if (a.actief !== b.actief) return a.actief ? -1 : 1
    return a.naam.localeCompare(b.naam)
  })

  return { financier }
}

export const actions: Actions = {
  bijwerken: async ({ request, params }) => {
    const formData = await request.formData()

    const naam = formData.get('naam')?.toString().trim()
    if (!naam) return fail(400, { actie: 'bijwerken', fout: 'Naam is verplicht' })

    const { error: err } = await supabaseAdmin
      .from('financiers')
      .update({
        naam,
        website: formData.get('website')?.toString().trim() || null,
        logo_url: formData.get('logo_url')?.toString().trim() || null,
        contactpersoon: formData.get('contactpersoon')?.toString().trim() || null,
        email: formData.get('email')?.toString().trim() || null,
        telefoon: formData.get('telefoon')?.toString().trim() || null,
        notities: formData.get('notities')?.toString().trim() || null,
      })
      .eq('id', params.id)

    if (err) return fail(500, { actie: 'bijwerken', fout: err.message })
    return { actie: 'bijwerken', succes: true }
  },

  toggleActief: async ({ request, params }) => {
    const formData = await request.formData()
    const actief = formData.get('actief') === 'true'

    const { error: err } = await supabaseAdmin
      .from('financiers')
      .update({ actief })
      .eq('id', params.id)

    if (err) return fail(500, { actie: 'toggleActief', fout: err.message })
    return { actie: 'toggleActief', succes: true, actief }
  },

  productToevoegen: async ({ request, params }) => {
    const formData = await request.formData()

    const naam = formData.get('naam')?.toString().trim()
    if (!naam) return fail(400, { actie: 'productToevoegen', fout: 'Productnaam is verplicht' })

    const type = formData.get('type')?.toString() as ProductType
    if (!['senior', 'mezzanine', 'bridge', 'overig'].includes(type)) {
      return fail(400, { actie: 'productToevoegen', fout: 'Kies een geldig type' })
    }

    const { data: nieuw, error: err } = await supabaseAdmin
      .from('producten')
      .insert({
        financier_id: params.id,
        naam,
        type,
        min_bedrag: numOrNull(formData.get('min_bedrag')),
        max_bedrag: numOrNull(formData.get('max_bedrag')),
        min_looptijd_maanden: numOrNull(formData.get('min_looptijd_maanden')),
        max_looptijd_maanden: numOrNull(formData.get('max_looptijd_maanden')),
        asset_classes: (formData.getAll('asset_classes') as AssetClass[]),
        regios: (formData.getAll('regios') as Regio[]),
        kenmerken: parseKenmerken(formData.get('kenmerken')),
      })
      .select('id')
      .single()

    if (err) return fail(500, { actie: 'productToevoegen', fout: err.message })

    redirect(303, `/admin/${params.id}/${(nieuw as { id: string }).id}`)
  },
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = v?.toString().trim()
  if (!s) return null
  const n = Number(s)
  return isNaN(n) ? null : n
}

function parseKenmerken(v: FormDataEntryValue | null): Record<string, unknown> {
  const s = v?.toString().trim()
  if (!s) return {}
  try { return JSON.parse(s) } catch { return {} }
}
