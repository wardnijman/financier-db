-- ============================================================
-- Vastgoedfinanciering Zoektool — Supabase Schema
-- Uitvoeren in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELLEN
-- ============================================================

create table if not exists financiers (
  id              uuid primary key default uuid_generate_v4(),
  naam            text not null,
  website         text,
  logo_url        text,
  contactpersoon  text,
  email           text,
  telefoon        text,
  notities        text,
  actief          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists producten (
  id                      uuid primary key default uuid_generate_v4(),
  financier_id            uuid not null references financiers(id) on delete cascade,
  naam                    text not null,
  type                    text not null check (type in ('senior', 'mezzanine', 'bridge', 'overig')),
  min_bedrag              numeric(15, 2),
  max_bedrag              numeric(15, 2),
  min_looptijd_maanden    integer,
  max_looptijd_maanden    integer,
  asset_classes           text[] not null default '{}',
  -- toegestane waarden: kantoor, retail, wonen, logistiek, hotel, zorg, gemengd
  regios                  text[] not null default '{}',
  -- toegestane waarden: nederland, belgie, duitsland, europa
  kenmerken               jsonb not null default '{}',
  actief                  boolean not null default true,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create table if not exists ltv_staffels (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references producten(id) on delete cascade,
  ltv_min         numeric(5, 2) not null,  -- percentage, bijv. 0.00
  ltv_max         numeric(5, 2) not null,  -- percentage, bijv. 65.00
  rente_opslag    numeric(5, 3) not null,  -- percentage, bijv. 1.750
  beschrijving    text,
  created_at      timestamptz not null default now()
);

create table if not exists ltc_staffels (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references producten(id) on delete cascade,
  ltc_min         numeric(5, 2) not null,  -- percentage, bijv. 0.00
  ltc_max         numeric(5, 2) not null,  -- percentage, bijv. 70.00
  rente_opslag    numeric(5, 3) not null,  -- percentage, bijv. 2.000
  beschrijving    text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger financiers_updated_at
  before update on financiers
  for each row execute function set_updated_at();

create trigger producten_updated_at
  before update on producten
  for each row execute function set_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================

-- Zoeken op actieve financiers/producten
create index if not exists idx_financiers_actief on financiers(actief);
create index if not exists idx_producten_actief on producten(actief);

-- Join financier → producten
create index if not exists idx_producten_financier_id on producten(financier_id);

-- Filteren op producttype (senior/mezzanine/bridge/overig)
create index if not exists idx_producten_type on producten(type);

-- Filteren op bedragbereik
create index if not exists idx_producten_bedrag on producten(min_bedrag, max_bedrag);

-- GIN indexes voor array-zoekopdrachten (asset_classes, regios)
create index if not exists idx_producten_asset_classes on producten using gin(asset_classes);
create index if not exists idx_producten_regios on producten using gin(regios);

-- GIN index voor jsonb kenmerken
create index if not exists idx_producten_kenmerken on producten using gin(kenmerken);

-- LTV/LTC staffels per product
create index if not exists idx_ltv_staffels_product_id on ltv_staffels(product_id);
create index if not exists idx_ltc_staffels_product_id on ltc_staffels(product_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table financiers   enable row level security;
alter table producten    enable row level security;
alter table ltv_staffels enable row level security;
alter table ltc_staffels enable row level security;

-- Publieke lees-toegang voor anonieme gebruikers (read-only)
create policy "Publiek leesbaar: financiers"
  on financiers for select
  to anon
  using (true);

create policy "Publiek leesbaar: producten"
  on producten for select
  to anon
  using (true);

create policy "Publiek leesbaar: ltv_staffels"
  on ltv_staffels for select
  to anon
  using (true);

create policy "Publiek leesbaar: ltc_staffels"
  on ltc_staffels for select
  to anon
  using (true);

-- ============================================================
-- SEED DATA — 3 Realistische Nederlandse vastgoedfinanciers
-- ============================================================

do $$
declare
  -- Financier IDs
  id_ing    uuid := uuid_generate_v4();
  id_nibc   uuid := uuid_generate_v4();
  id_syn    uuid := uuid_generate_v4();

  -- Product IDs
  id_ing_senior   uuid := uuid_generate_v4();
  id_ing_bridge   uuid := uuid_generate_v4();
  id_nibc_mezz    uuid := uuid_generate_v4();
  id_syn_senior   uuid := uuid_generate_v4();
  id_syn_senior2  uuid := uuid_generate_v4();

begin

  -- ----------------------------------------------------------
  -- 1. ING Real Estate Finance
  -- ----------------------------------------------------------
  insert into financiers (id, naam, website, logo_url, contactpersoon, email, telefoon, notities)
  values (
    id_ing,
    'ING Real Estate Finance',
    'https://www.ing.nl/zakelijk/financieren/vastgoed',
    null,
    'Afdeling Vastgoedfinanciering',
    'vastgoed@ing.nl',
    '+31 20 563 9111',
    'Grootbank met brede vastgoedportefeuille. Financiert met name institutionele partijen en grote ontwikkelaars. Minimale dealomvang EUR 5 mln.'
  );

  -- ING: Senior lening (kantoor/wonen/logistiek)
  insert into producten (id, financier_id, naam, type, min_bedrag, max_bedrag, min_looptijd_maanden, max_looptijd_maanden, asset_classes, regios, kenmerken)
  values (
    id_ing_senior,
    id_ing,
    'ING Senior Hypothecaire Lening',
    'senior',
    5000000,
    150000000,
    36,
    120,
    array['kantoor', 'wonen', 'logistiek', 'gemengd'],
    array['nederland'],
    '{
      "min_dscr": 1.25,
      "max_ltv": 65,
      "rente_type": ["vast", "variabel"],
      "aflossing": "lineair of bullet",
      "eigen_vermogen_vereist": true,
      "prefinanciering_mogelijk": false,
      "opmerking": "Minimale huurcoverage vereist; stabiele cashflow preferred"
    }'::jsonb
  );

  insert into ltv_staffels (product_id, ltv_min, ltv_max, rente_opslag, beschrijving)
  values
    (id_ing_senior, 0, 50, 1.200, 'Laagste risicoband — beste pricing'),
    (id_ing_senior, 50, 60, 1.550, 'Standaard senior tranche'),
    (id_ing_senior, 60, 65, 2.000, 'Maximale senior LTV; hogere opslag');

  -- ING: Bridge financiering
  insert into producten (id, financier_id, naam, type, min_bedrag, max_bedrag, min_looptijd_maanden, max_looptijd_maanden, asset_classes, regios, kenmerken)
  values (
    id_ing_bridge,
    id_ing,
    'ING Bridge Financiering',
    'bridge',
    5000000,
    75000000,
    6,
    24,
    array['kantoor', 'wonen', 'logistiek', 'retail'],
    array['nederland'],
    '{
      "max_ltv": 70,
      "max_ltc": 75,
      "exit_strategie_vereist": true,
      "verlengbaar": true,
      "opmerking": "Overbrugging tot permanente financiering of verkoop. Exit fee van toepassing."
    }'::jsonb
  );

  insert into ltv_staffels (product_id, ltv_min, ltv_max, rente_opslag, beschrijving)
  values
    (id_ing_bridge, 0,  60, 2.250, 'Standaard bridge — lage LTV'),
    (id_ing_bridge, 60, 70, 3.000, 'Hogere LTV bridge — extra risicopremie');

  insert into ltc_staffels (product_id, ltc_min, ltc_max, rente_opslag, beschrijving)
  values
    (id_ing_bridge, 0,  65, 2.500, 'Ontwikkelingskosten tot 65% LTC'),
    (id_ing_bridge, 65, 75, 3.250, 'Hogere LTC band; strikte voorwaarden');


  -- ----------------------------------------------------------
  -- 2. NIBC Bank — Mezzanine & Bridge specialist
  -- ----------------------------------------------------------
  insert into financiers (id, naam, website, logo_url, contactpersoon, email, telefoon, notities)
  values (
    id_nibc,
    'NIBC Bank',
    'https://www.nibc.com/corporate-finance/real-estate',
    null,
    'Real Estate Finance Team',
    'realestate@nibc.com',
    '+31 70 342 5425',
    'Specialistische midmarket bank met focus op mezzanine en achtergestelde financiering. Actief in NL, BE en DE. Dealrange EUR 3–50 mln.'
  );

  -- NIBC: Mezzanine
  insert into producten (id, financier_id, naam, type, min_bedrag, max_bedrag, min_looptijd_maanden, max_looptijd_maanden, asset_classes, regios, kenmerken)
  values (
    id_nibc_mezz,
    id_nibc,
    'NIBC Mezzanine Vastgoedlening',
    'mezzanine',
    3000000,
    50000000,
    12,
    60,
    array['wonen', 'kantoor', 'logistiek', 'hotel', 'gemengd'],
    array['nederland', 'belgie', 'duitsland'],
    '{
      "positie": "achtergesteld aan senior",
      "max_ltv_totaal": 80,
      "min_ltv_senior": 60,
      "rente_type": ["vast", "pik"],
      "pik_rente_mogelijk": true,
      "warrant_mogelijk": true,
      "min_equity": 20,
      "opmerking": "Gecombineerd met senior lening. Warrantstructuur mogelijk bij ontwikkelingsprojecten."
    }'::jsonb
  );

  insert into ltv_staffels (product_id, ltv_min, ltv_max, rente_opslag, beschrijving)
  values
    (id_nibc_mezz, 60, 70, 4.500, 'Eerste mezzanine tranche (60–70% LTV)'),
    (id_nibc_mezz, 70, 80, 6.000, 'Tweede mezzanine tranche (70–80% LTV); hogere risicopremie');

  insert into ltc_staffels (product_id, ltc_min, ltc_max, rente_opslag, beschrijving)
  values
    (id_nibc_mezz, 65, 75, 5.000, 'Mezzanine op ontwikkelingskosten tot 75% LTC'),
    (id_nibc_mezz, 75, 85, 6.500, 'Hoge LTC band; alleen bij sterke sponsors');


  -- ----------------------------------------------------------
  -- 3. Syntrus Achmea Real Estate & Finance
  -- ----------------------------------------------------------
  insert into financiers (id, naam, website, logo_url, contactpersoon, email, telefoon, notities)
  values (
    id_syn,
    'Syntrus Achmea Real Estate & Finance',
    'https://www.syntrus-achmea.nl',
    null,
    'Hypotheekteam Vastgoed',
    'vastgoedhypotheek@syntrus-achmea.nl',
    '+31 20 606 5500',
    'Institutionele vermogensbeheerder (pensioenfondskapitaal). Lange looptijden, conservatieve LTV. Sterk in wonen en zorg. Min. deal EUR 10 mln.'
  );

  -- Syntrus: Senior lange termijn wonen/zorg
  insert into producten (id, financier_id, naam, type, min_bedrag, max_bedrag, min_looptijd_maanden, max_looptijd_maanden, asset_classes, regios, kenmerken)
  values (
    id_syn_senior,
    id_syn,
    'Syntrus Langlopende Woninghypotheek',
    'senior',
    10000000,
    200000000,
    60,
    240,
    array['wonen'],
    array['nederland'],
    '{
      "max_ltv": 60,
      "min_dscr": 1.30,
      "rente_type": ["vast"],
      "vaste_rente_periode_jaren": [5, 7, 10, 15, 20],
      "aflossing": "annuitair of lineair",
      "esg_vereiste": true,
      "min_energielabel": "C",
      "opmerking": "Pensioenfondskapitaal — lange horizon, lage rentes bij kwaliteitsportefeuilles. ESG-criteria verplicht."
    }'::jsonb
  );

  insert into ltv_staffels (product_id, ltv_min, ltv_max, rente_opslag, beschrijving)
  values
    (id_syn_senior, 0,  50, 0.900, 'Prime woonportefeuille tot 50% LTV'),
    (id_syn_senior, 50, 55, 1.100, 'Standaard woonportefeuille'),
    (id_syn_senior, 55, 60, 1.400, 'Maximale LTV Syntrus wonen');

  -- Syntrus: Senior zorg/healthcare
  insert into producten (id, financier_id, naam, type, min_bedrag, max_bedrag, min_looptijd_maanden, max_looptijd_maanden, asset_classes, regios, kenmerken)
  values (
    id_syn_senior2,
    id_syn,
    'Syntrus Zorgvastgoed Financiering',
    'senior',
    10000000,
    100000000,
    60,
    180,
    array['zorg'],
    array['nederland'],
    '{
      "max_ltv": 65,
      "min_dscr": 1.35,
      "rente_type": ["vast"],
      "exploitant_rating_vereist": true,
      "nza_erkenning_vereist": true,
      "esg_vereiste": true,
      "opmerking": "Financiering van zorginstellingen met NZa-erkenning. Exploitant dient minimaal BBB-equivalent kredietprofiel te hebben."
    }'::jsonb
  );

  insert into ltv_staffels (product_id, ltv_min, ltv_max, rente_opslag, beschrijving)
  values
    (id_syn_senior2, 0,  55, 1.150, 'Prime zorgvastgoed, sterke exploitant'),
    (id_syn_senior2, 55, 65, 1.600, 'Standaard zorgvastgoed tot 65% LTV');

end;
$$;
