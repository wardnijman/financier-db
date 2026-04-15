import { fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { searchFinanciers } from '$lib/server/db'
import type { SearchFilters, AssetClass, Regio, ProductType } from '$lib/types'

export const load: PageServerLoad = async () => ({})

export const actions: Actions = {
  zoek: async ({ request }) => {
    const data = await request.formData()

    const filters: SearchFilters = {}

    const bedragStr = data.get('bedrag')?.toString().trim()
    if (bedragStr) filters.bedrag = Number(bedragStr)

    const ltvStr = data.get('ltv')?.toString().trim()
    if (ltvStr) filters.ltv = Number(ltvStr)

    const assetClass = data.get('asset_class')?.toString().trim()
    if (assetClass) filters.asset_class = assetClass as AssetClass

    const regio = data.get('regio')?.toString().trim()
    if (regio) filters.regio = regio as Regio

    const type = data.get('type')?.toString().trim()
    if (type) filters.type = type as ProductType

    const looptijdStr = data.get('looptijd_maanden')?.toString().trim()
    if (looptijdStr) filters.looptijd_maanden = Number(looptijdStr)

    try {
      let resultaten = await searchFinanciers(filters)

      // Sorteer op beste (laagste) rente-opslag bij gevraagde LTV; anders op naam
      if (filters.ltv !== undefined) {
        resultaten = resultaten.sort((a, b) => {
          const besteA = Math.min(
            ...a.producten.map((p) => p.relevante_ltv_staffel?.rente_opslag ?? Infinity),
          )
          const besteB = Math.min(
            ...b.producten.map((p) => p.relevante_ltv_staffel?.rente_opslag ?? Infinity),
          )
          return besteA - besteB
        })
      }

      return { resultaten, filters, gezocht: true as const }
    } catch {
      return fail(500, {
        fout: 'Er is een fout opgetreden bij het zoeken. Controleer de verbinding en probeer het opnieuw.',
      })
    }
  },
}
