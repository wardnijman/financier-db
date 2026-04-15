// ============================================================
// Domain types — afgeleid van schema.sql
// ============================================================

export type AssetClass = 'kantoor' | 'retail' | 'wonen' | 'logistiek' | 'hotel' | 'zorg' | 'gemengd'
export type Regio = 'nederland' | 'belgie' | 'duitsland' | 'europa'
export type ProductType = 'senior' | 'mezzanine' | 'bridge' | 'overig'

export interface Financier {
  id: string
  naam: string
  website: string | null
  logo_url: string | null
  contactpersoon: string | null
  email: string | null
  telefoon: string | null
  notities: string | null
  actief: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  financier_id: string
  naam: string
  type: ProductType
  min_bedrag: number | null
  max_bedrag: number | null
  min_looptijd_maanden: number | null
  max_looptijd_maanden: number | null
  asset_classes: AssetClass[]
  regios: Regio[]
  kenmerken: Record<string, unknown>
  actief: boolean
  created_at: string
  updated_at: string
}

export interface LtvStaffel {
  id: string
  product_id: string
  ltv_min: number
  ltv_max: number
  rente_opslag: number
  beschrijving: string | null
  created_at: string
}

export interface LtcStaffel {
  id: string
  product_id: string
  ltc_min: number
  ltc_max: number
  rente_opslag: number
  beschrijving: string | null
  created_at: string
}

// ============================================================
// Joined / uitgebreide types
// ============================================================

export interface ProductMetStaffels extends Product {
  ltv_staffels: LtvStaffel[]
  ltc_staffels: LtcStaffel[]
}

export interface FinancierMetProducten extends Financier {
  producten: ProductMetStaffels[]
}

// ============================================================
// Zoekfunctie types
// ============================================================

export interface SearchFilters {
  /** Gewenst leenbedrag in EUR */
  bedrag?: number
  /** Gewenste LTV als percentage (bijv. 60 voor 60%) */
  ltv?: number
  /** Gewenste LTC als percentage (bijv. 70 voor 70%) */
  ltc?: number
  asset_class?: AssetClass
  regio?: Regio
  type?: ProductType
  /** Gewenste looptijd in maanden */
  looptijd_maanden?: number
}

export interface SearchResultProduct extends ProductMetStaffels {
  /** De staffel die de gevraagde LTV dekt, indien gefilterd op LTV */
  relevante_ltv_staffel: LtvStaffel | null
  /** De staffel die de gevraagde LTC dekt, indien gefilterd op LTC */
  relevante_ltc_staffel: LtcStaffel | null
}

export interface SearchResultFinancier extends Financier {
  producten: SearchResultProduct[]
}

// ============================================================
// Supabase Database type — voor getypeerde createClient<Database>
// ============================================================

type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

// postgrest-js v2 vereist Relationships op elke tabel om Schema-inferentie te laten werken
type Rel = {
  foreignKeyName: string
  columns: string[]
  isOneToOne: boolean
  referencedRelation: string
  referencedColumns: string[]
}

export type Database = {
  public: {
    Tables: {
      financiers: {
        Row: Financier
        Insert: {
          id?: string
          naam: string
          website?: string | null
          logo_url?: string | null
          contactpersoon?: string | null
          email?: string | null
          telefoon?: string | null
          notities?: string | null
          actief?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Financier>
        Relationships: Rel[]
      }
      producten: {
        Row: Product
        Insert: {
          id?: string
          financier_id: string
          naam: string
          type: ProductType
          min_bedrag?: number | null
          max_bedrag?: number | null
          min_looptijd_maanden?: number | null
          max_looptijd_maanden?: number | null
          asset_classes?: AssetClass[]
          regios?: Regio[]
          kenmerken?: Json
          actief?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Product, 'id'>>
        Relationships: Rel[]
      }
      ltv_staffels: {
        Row: LtvStaffel
        Insert: {
          id?: string
          product_id: string
          ltv_min: number
          ltv_max: number
          rente_opslag: number
          beschrijving?: string | null
          created_at?: string
        }
        Update: Partial<Omit<LtvStaffel, 'id'>>
        Relationships: Rel[]
      }
      ltc_staffels: {
        Row: LtcStaffel
        Insert: {
          id?: string
          product_id: string
          ltc_min: number
          ltc_max: number
          rente_opslag: number
          beschrijving?: string | null
          created_at?: string
        }
        Update: Partial<Omit<LtcStaffel, 'id'>>
        Relationships: Rel[]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
