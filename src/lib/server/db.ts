import { supabase } from '$lib/supabaseClient'
import type {
  Financier,
  FinancierMetProducten,
  SearchFilters,
  SearchResultFinancier,
  SearchResultProduct,
  ProductMetStaffels,
} from '$lib/types'

// ============================================================
// getFinanciers — alle actieve financiers, gesorteerd op naam
// ============================================================

export async function getFinanciers(): Promise<Financier[]> {
  const { data, error } = await supabase
    .from('financiers')
    .select('*')
    .eq('actief', true)
    .order('naam')

  if (error) throw error
  return data
}

// ============================================================
// getFinancierById — inclusief actieve producten en staffels
// ============================================================

export async function getFinancierById(id: string): Promise<FinancierMetProducten | null> {
  const { data, error } = await supabase
    .from('financiers')
    .select(`
      *,
      producten(
        *,
        ltv_staffels(*),
        ltc_staffels(*)
      )
    `)
    .eq('id', id)
    .eq('actief', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw error
  }

  // Filter inactieve producten client-side (nested .eq werkt niet betrouwbaar via PostgREST)
  const result = data as unknown as FinancierMetProducten
  result.producten = (result.producten ?? []).filter((p) => p.actief)

  return result
}

// ============================================================
// searchFinanciers — filter op bedrag, LTV/LTC, asset class,
// regio, type en looptijd; groepeer resultaten per financier
// ============================================================

export async function searchFinanciers(
  filters: SearchFilters,
): Promise<SearchResultFinancier[]> {
  let query = supabase
    .from('producten')
    .select(`
      *,
      financier:financiers(*),
      ltv_staffels(*),
      ltc_staffels(*)
    `)
    .eq('actief', true)

  // --- Producttype ---
  if (filters.type) {
    query = query.eq('type', filters.type)
  }

  // --- Asset class — product moet de gevraagde class bevatten ---
  if (filters.asset_class) {
    query = query.contains('asset_classes', [filters.asset_class])
  }

  // --- Regio — product moet de gevraagde regio bevatten ---
  if (filters.regio) {
    query = query.contains('regios', [filters.regio])
  }

  // --- Bedrag — gevraagd bedrag valt binnen het bereik van het product ---
  // NULL in min/max_bedrag = geen beperking (altijd geschikt)
  if (filters.bedrag !== undefined) {
    query = query
      .or(`min_bedrag.is.null,min_bedrag.lte.${filters.bedrag}`)
      .or(`max_bedrag.is.null,max_bedrag.gte.${filters.bedrag}`)
  }

  // --- Looptijd — gevraagde looptijd valt binnen het bereik van het product ---
  if (filters.looptijd_maanden !== undefined) {
    query = query
      .or(`min_looptijd_maanden.is.null,min_looptijd_maanden.lte.${filters.looptijd_maanden}`)
      .or(`max_looptijd_maanden.is.null,max_looptijd_maanden.gte.${filters.looptijd_maanden}`)
  }

  const { data, error } = await query.order('naam')
  if (error) throw error

  type RawProduct = ProductMetStaffels & { financier: Financier }
  let producten = (data ?? []) as unknown as RawProduct[]

  // --- Filter inactieve financiers ---
  producten = producten.filter((p) => p.financier?.actief)

  // --- LTV filter: product moet een staffel hebben die de gevraagde LTV dekt ---
  if (filters.ltv !== undefined) {
    const ltv = filters.ltv
    producten = producten.filter((p) =>
      p.ltv_staffels.some((s) => s.ltv_min <= ltv && ltv <= s.ltv_max),
    )
  }

  // --- LTC filter: product moet een staffel hebben die de gevraagde LTC dekt ---
  if (filters.ltc !== undefined) {
    const ltc = filters.ltc
    producten = producten.filter((p) =>
      p.ltc_staffels.some((s) => s.ltc_min <= ltc && ltc <= s.ltc_max),
    )
  }

  // --- Groepeer per financier en voeg relevante staffel toe ---
  const byFinancier = new Map<string, SearchResultFinancier>()

  for (const { financier, ...product } of producten) {
    if (!byFinancier.has(financier.id)) {
      byFinancier.set(financier.id, { ...financier, producten: [] })
    }

    const searchProduct: SearchResultProduct = {
      ...product,
      relevante_ltv_staffel:
        filters.ltv !== undefined
          ? (product.ltv_staffels.find(
              (s) => s.ltv_min <= filters.ltv! && filters.ltv! <= s.ltv_max,
            ) ?? null)
          : null,
      relevante_ltc_staffel:
        filters.ltc !== undefined
          ? (product.ltc_staffels.find(
              (s) => s.ltc_min <= filters.ltc! && filters.ltc! <= s.ltc_max,
            ) ?? null)
          : null,
    }

    byFinancier.get(financier.id)!.producten.push(searchProduct)
  }

  // Sorteer financiers op naam
  return Array.from(byFinancier.values()).sort((a, b) => a.naam.localeCompare(b.naam))
}
