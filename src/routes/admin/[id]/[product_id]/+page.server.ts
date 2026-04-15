import { error, fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { supabaseAdmin } from '$lib/server/supabaseAdmin'
import type { Product, LtvStaffel, LtcStaffel, AssetClass, Regio, ProductType } from '$lib/types'

type ProductDetail = Product & {
  financier: { id: string; naam: string }
  ltv_staffels: LtvStaffel[]
  ltc_staffels: LtcStaffel[]
}

export async function load({ params }: { params: { id: string; product_id: string } }) {
  const { data, error: err } = await supabaseAdmin
    .from('producten')
    .select(`
      *,
      financier:financiers(id, naam),
      ltv_staffels(*),
      ltc_staffels(*)
    `)
    .eq('id', params.product_id)
    .eq('financier_id', params.id)
    .single()

  if (err || !data) throw error(404, 'Product niet gevonden')

  const product = data as ProductDetail
  product.ltv_staffels = [...(product.ltv_staffels ?? [])].sort((a, b) => a.ltv_min - b.ltv_min)
  product.ltc_staffels = [...(product.ltc_staffels ?? [])].sort((a, b) => a.ltc_min - b.ltc_min)

  return {
    product,
    financier: product.financier as { id: string; naam: string },
  }
}

export const actions: Actions = {
  bijwerken: async ({ request, params }) => {
    const formData = await request.formData()

    const naam = formData.get('naam')?.toString().trim()
    if (!naam) return fail(400, { actie: 'bijwerken', fout: 'Naam is verplicht' })

    const type = formData.get('type')?.toString() as ProductType
    if (!['senior', 'mezzanine', 'bridge', 'overig'].includes(type)) {
      return fail(400, { actie: 'bijwerken', fout: 'Kies een geldig type' })
    }

    const kenmerken = parseKenmerken(formData.get('kenmerken'))
    if (kenmerken === null) {
      return fail(400, { actie: 'bijwerken', fout: 'Kenmerken is geen geldige JSON' })
    }

    const { error: err } = await supabaseAdmin
      .from('producten')
      .update({
        naam,
        type,
        min_bedrag: numOrNull(formData.get('min_bedrag')),
        max_bedrag: numOrNull(formData.get('max_bedrag')),
        min_looptijd_maanden: numOrNull(formData.get('min_looptijd_maanden')),
        max_looptijd_maanden: numOrNull(formData.get('max_looptijd_maanden')),
        asset_classes: (formData.getAll('asset_classes') as AssetClass[]),
        regios: (formData.getAll('regios') as Regio[]),
        kenmerken,
      })
      .eq('id', params.product_id)

    if (err) return fail(500, { actie: 'bijwerken', fout: err.message })
    return { actie: 'bijwerken', succes: true }
  },

  toggleActief: async ({ request, params }) => {
    const formData = await request.formData()
    const actief = formData.get('actief') === 'true'

    const { error: err } = await supabaseAdmin
      .from('producten')
      .update({ actief })
      .eq('id', params.product_id)

    if (err) return fail(500, { actie: 'toggleActief', fout: err.message })
    return { actie: 'toggleActief', succes: true, actief }
  },

  ltvToevoegen: async ({ request, params }) => {
    const formData = await request.formData()

    const ltv_min = numOrNull(formData.get('ltv_min'))
    const ltv_max = numOrNull(formData.get('ltv_max'))
    const rente_opslag = numOrNull(formData.get('rente_opslag'))

    if (ltv_min === null || ltv_max === null || rente_opslag === null) {
      return fail(400, { actie: 'ltvToevoegen', fout: 'LTV min, max en rente-opslag zijn verplicht' })
    }
    if (ltv_min >= ltv_max) {
      return fail(400, { actie: 'ltvToevoegen', fout: 'LTV min moet kleiner zijn dan LTV max' })
    }

    const { error: err } = await supabaseAdmin.from('ltv_staffels').insert({
      product_id: params.product_id,
      ltv_min,
      ltv_max,
      rente_opslag,
      beschrijving: formData.get('beschrijving')?.toString().trim() || null,
    })

    if (err) return fail(500, { actie: 'ltvToevoegen', fout: err.message })
    return { actie: 'ltvToevoegen', succes: true }
  },

  ltvVerwijderen: async ({ request }) => {
    const formData = await request.formData()
    const id = formData.get('staffel_id')?.toString()
    if (!id) return fail(400, { actie: 'ltvVerwijderen', fout: 'Staffel ID ontbreekt' })

    const { error: err } = await supabaseAdmin.from('ltv_staffels').delete().eq('id', id)
    if (err) return fail(500, { actie: 'ltvVerwijderen', fout: err.message })
    return { actie: 'ltvVerwijderen', succes: true }
  },

  ltcToevoegen: async ({ request, params }) => {
    const formData = await request.formData()

    const ltc_min = numOrNull(formData.get('ltc_min'))
    const ltc_max = numOrNull(formData.get('ltc_max'))
    const rente_opslag = numOrNull(formData.get('rente_opslag'))

    if (ltc_min === null || ltc_max === null || rente_opslag === null) {
      return fail(400, { actie: 'ltcToevoegen', fout: 'LTC min, max en rente-opslag zijn verplicht' })
    }
    if (ltc_min >= ltc_max) {
      return fail(400, { actie: 'ltcToevoegen', fout: 'LTC min moet kleiner zijn dan LTC max' })
    }

    const { error: err } = await supabaseAdmin.from('ltc_staffels').insert({
      product_id: params.product_id,
      ltc_min,
      ltc_max,
      rente_opslag,
      beschrijving: formData.get('beschrijving')?.toString().trim() || null,
    })

    if (err) return fail(500, { actie: 'ltcToevoegen', fout: err.message })
    return { actie: 'ltcToevoegen', succes: true }
  },

  ltcVerwijderen: async ({ request }) => {
    const formData = await request.formData()
    const id = formData.get('staffel_id')?.toString()
    if (!id) return fail(400, { actie: 'ltcVerwijderen', fout: 'Staffel ID ontbreekt' })

    const { error: err } = await supabaseAdmin.from('ltc_staffels').delete().eq('id', id)
    if (err) return fail(500, { actie: 'ltcVerwijderen', fout: err.message })
    return { actie: 'ltcVerwijderen', succes: true }
  },
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  const s = v?.toString().trim()
  if (!s) return null
  const n = Number(s)
  return isNaN(n) ? null : n
}

function parseKenmerken(v: FormDataEntryValue | null): Record<string, unknown> | null {
  const s = v?.toString().trim()
  if (!s) return {}
  try {
    const parsed = JSON.parse(s)
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return null
    return parsed
  } catch {
    return null
  }
}
