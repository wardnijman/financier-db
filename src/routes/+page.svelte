<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'
  import type { SearchResultFinancier, SearchResultProduct } from '$lib/types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  // LTV slider ↔ number input sync
  let ltvWaarde = $state('')

  // ----------------------------------------------------------------
  // Afgeleide weergave-helpers
  // ----------------------------------------------------------------

  const TYPE_LABELS: Record<string, string> = {
    senior: 'Senior',
    mezzanine: 'Mezzanine',
    bridge: 'Bridge',
    overig: 'Overig',
  }

  const ASSET_LABELS: Record<string, string> = {
    kantoor: 'Kantoor',
    retail: 'Retail',
    wonen: 'Wonen',
    logistiek: 'Logistiek',
    hotel: 'Hotel',
    zorg: 'Zorg',
    gemengd: 'Gemengd',
  }

  const REGIO_LABELS: Record<string, string> = {
    nederland: 'Nederland',
    belgie: 'België',
    duitsland: 'Duitsland',
    europa: 'Europa',
  }

  function formatBedrag(bedrag: number | null): string {
    if (bedrag === null) return '—'
    if (bedrag >= 1_000_000) {
      const mln = bedrag / 1_000_000
      return `€\u00a0${mln.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}\u00a0mln`
    }
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(bedrag)
  }

  function formatLooptijd(maanden: number | null): string {
    if (maanden === null) return '—'
    if (maanden % 12 === 0) return `${maanden / 12} jaar`
    const jaren = Math.floor(maanden / 12)
    const rest = maanden % 12
    if (jaren > 0) return `${jaren}j ${rest}m`
    return `${maanden} mnd`
  }

  function formatRente(opslag: number): string {
    return `+\u202f${opslag.toLocaleString('nl-NL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 3,
    })}%`
  }

  function sorteerProducten(producten: SearchResultProduct[], hadLtvFilter: boolean) {
    return [...producten].sort((a, b) => {
      const opslagA = hadLtvFilter
        ? (a.relevante_ltv_staffel?.rente_opslag ?? Infinity)
        : Math.min(...(a.ltv_staffels.map((s) => s.rente_opslag).length
            ? a.ltv_staffels.map((s) => s.rente_opslag)
            : [Infinity]))
      const opslagB = hadLtvFilter
        ? (b.relevante_ltv_staffel?.rente_opslag ?? Infinity)
        : Math.min(...(b.ltv_staffels.map((s) => s.rente_opslag).length
            ? b.ltv_staffels.map((s) => s.rente_opslag)
            : [Infinity]))
      return opslagA - opslagB
    })
  }

  // Type narrowing: onderscheid tussen succes- en fout-response
  function isSuccess(
    f: ActionData,
  ): f is { resultaten: SearchResultFinancier[]; filters: Record<string, unknown>; gezocht: true } {
    return f != null && 'gezocht' in f && f.gezocht === true
  }

  function isFout(f: ActionData): f is { fout: string } {
    return f != null && 'fout' in f
  }

  let resultaten = $derived(isSuccess(form) ? form.resultaten : [])
  let hadLtvFilter = $derived(isSuccess(form) ? form.filters?.ltv !== undefined : false)
  let gezocht = $derived(isSuccess(form))
  let totaalProducten = $derived(resultaten.reduce((n, f) => n + f.producten.length, 0))
</script>

<svelte:head>
  <title>Vastgoedfinanciering Zoektool</title>
</svelte:head>

<main class="container">
  <!-- ============================================================
       ZOEKFORMULIER
  ============================================================ -->
  <section class="zoekformulier">
    <h2 class="sectie-titel">Zoekopdracht</h2>

    <form method="POST" action="?/zoek" use:enhance>
      <div class="form-grid">

        <div class="form-group">
          <label for="bedrag">Financieringsbedrag (€)</label>
          <input
            id="bedrag"
            name="bedrag"
            type="number"
            min="0"
            step="100000"
            placeholder="bijv. 10000000"
            value={isSuccess(form) ? (form.filters?.bedrag ?? '') : ''}
          />
          <span class="form-hint">Leeg = geen beperking</span>
        </div>

        <div class="form-group">
          <label for="ltv-number">Gewenste LTV (%)</label>
          <div class="ltv-inputs">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              aria-hidden="true"
              bind:value={ltvWaarde}
            />
            <input
              id="ltv-number"
              name="ltv"
              type="number"
              min="0"
              max="100"
              step="1"
              placeholder="bijv. 60"
              bind:value={ltvWaarde}
            />
            <span class="ltv-pct">%</span>
          </div>
          <span class="form-hint">Leeg = geen LTV-filter</span>
        </div>

        <div class="form-group">
          <label for="asset_class">Asset class</label>
          <select id="asset_class" name="asset_class">
            <option value="">— Alle asset classes —</option>
            <option value="wonen">Wonen</option>
            <option value="kantoor">Kantoor</option>
            <option value="logistiek">Logistiek</option>
            <option value="retail">Retail</option>
            <option value="hotel">Hotel</option>
            <option value="zorg">Zorg</option>
            <option value="gemengd">Gemengd</option>
          </select>
        </div>

        <div class="form-group">
          <label for="regio">Regio</label>
          <select id="regio" name="regio">
            <option value="">— Alle regio's —</option>
            <option value="nederland">Nederland</option>
            <option value="belgie">België</option>
            <option value="duitsland">Duitsland</option>
            <option value="europa">Europa</option>
          </select>
        </div>

        <div class="form-group">
          <label for="type">Type financiering</label>
          <select id="type" name="type">
            <option value="">— Alle typen —</option>
            <option value="senior">Senior</option>
            <option value="mezzanine">Mezzanine</option>
            <option value="bridge">Bridge</option>
            <option value="overig">Overig</option>
          </select>
        </div>

        <div class="form-group">
          <label for="looptijd_maanden">Looptijd (maanden)</label>
          <input
            id="looptijd_maanden"
            name="looptijd_maanden"
            type="number"
            min="1"
            step="1"
            placeholder="bijv. 60"
            value={isSuccess(form) ? (form.filters?.looptijd_maanden ?? '') : ''}
          />
          <span class="form-hint">Leeg = geen beperking</span>
        </div>

      </div>

      <button type="submit" class="btn-zoek">Zoeken</button>
    </form>
  </section>

  <!-- ============================================================
       FOUTMELDING
  ============================================================ -->
  {#if isFout(form)}
    <div class="foutmelding" role="alert">
      <strong>Fout</strong> — {form.fout}
    </div>
  {/if}

  <!-- ============================================================
       RESULTATEN
  ============================================================ -->
  {#if gezocht}
    <section class="resultaten">
      <div class="resultaten-header">
        <h2 class="sectie-titel" style="margin-bottom:0">Resultaten</h2>
        {#if resultaten.length > 0}
          <span class="resultaten-count">
            {resultaten.length} {resultaten.length === 1 ? 'financier' : 'financiers'},
            {totaalProducten} {totaalProducten === 1 ? 'product' : 'producten'} gevonden
          </span>
        {/if}
      </div>

      {#if resultaten.length === 0}
        <div class="geen-resultaten">
          <div class="geen-resultaten-icoon">🔍</div>
          <strong>Geen resultaten gevonden</strong>
          <p>Geen financiers matchen de opgegeven criteria. Probeer minder filters of een ruimer bedrag.</p>
        </div>
      {:else}
        {#each resultaten as financier (financier.id)}
          {@const gesorteerdeProducten = sorteerProducten(financier.producten, hadLtvFilter)}
          <article class="financier-card">
            <div class="financier-header">
              <div>
                <h3 class="financier-naam">{financier.naam}</h3>
                {#if financier.contactpersoon}
                  <span class="financier-contact">{financier.contactpersoon}</span>
                {/if}
              </div>
              <div class="financier-acties">
                {#if financier.website}
                  <a
                    href={financier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="financier-link"
                  >Naar website ↗</a>
                {/if}
              </div>
            </div>

            <div class="producten-lijst">
              {#each gesorteerdeProducten as product (product.id)}
                <div class="product {product.type}">
                  <div class="product-header">
                    <span class="type-badge {product.type}">{TYPE_LABELS[product.type]}</span>
                    <h4 class="product-naam">{product.naam}</h4>
                  </div>

                  <div class="product-meta">
                    <div class="meta-item">
                      <span class="meta-label">Bedragrange</span>
                      <span class="meta-value">
                        {formatBedrag(product.min_bedrag)} – {formatBedrag(product.max_bedrag)}
                      </span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Looptijd</span>
                      <span class="meta-value">
                        {formatLooptijd(product.min_looptijd_maanden)} – {formatLooptijd(product.max_looptijd_maanden)}
                      </span>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Regios</span>
                      <span class="meta-value">
                        {product.regios.map((r) => REGIO_LABELS[r] ?? r).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div class="tags">
                    {#each product.asset_classes as ac}
                      <span class="tag">{ASSET_LABELS[ac] ?? ac}</span>
                    {/each}
                  </div>

                  {#if product.relevante_ltv_staffel}
                    <div class="staffel-highlight">
                      <div>
                        <span class="staffel-label">LTV rente-opslag</span>
                        <span class="staffel-bereik">
                          {product.relevante_ltv_staffel.ltv_min}–{product.relevante_ltv_staffel.ltv_max}% LTV
                        </span>
                        <!-- {#if product.relevante_ltv_staffel.beschrijving}
                          <span class="staffel-beschrijving">{product.relevante_ltv_staffel.beschrijving}</span>
                        {/if} -->
                      </div>
                      <span class="staffel-rente">{formatRente(product.relevante_ltv_staffel.rente_opslag)}</span>
                    </div>
                  {:else if product.ltv_staffels.length > 0}
                    <div class="staffels-tabel">
                      <span class="staffels-titel">LTV staffels</span>
                      {#each product.ltv_staffels as staffel}
                        <div class="staffel-rij">
                          <span class="staffel-bereik-klein">{staffel.ltv_min}–{staffel.ltv_max}% LTV</span>
                          <span class="staffel-rente-klein">{formatRente(staffel.rente_opslag)}</span>
                        </div>
                      {/each}
                    </div>
                  {/if}

                  {#if product.relevante_ltc_staffel}
                    <div class="staffel-highlight staffel-highlight--ltc">
                      <div>
                        <span class="staffel-label">LTC rente-opslag</span>
                        <span class="staffel-bereik">
                          {product.relevante_ltc_staffel.ltc_min}–{product.relevante_ltc_staffel.ltc_max}% LTC
                        </span>
                      </div>
                      <span class="staffel-rente">{formatRente(product.relevante_ltc_staffel.rente_opslag)}</span>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>

            <!-- {#if financier.notities} -->
              <!-- <p class="financier-notities">{financier.notities}</p> -->
            <!-- {/if} -->
          </article>
        {/each}
      {/if}
    </section>
  {/if}
</main>

<style>
  /* ============================================================
     Container
  ============================================================ */
  .container {
    max-width: 960px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  .sectie-titel {
    margin: 0 0 1.25rem;
    font-size: 1rem;
    font-weight: 700;
    color: #1c1c2e;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ============================================================
     Zoekformulier
  ============================================================ */
  .zoekformulier {
    background: white;
    border-radius: 14px;
    padding: 1.75rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07), 0 4px 16px rgba(0, 0, 0, 0.04);
    margin-bottom: 2rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-group label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #555;
  }

  .form-group input,
  .form-group select {
    padding: 0.5625rem 0.75rem;
    border: 1.5px solid #e2e2e8;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-family: inherit;
    color: #1c1c2e;
    background: white;
    transition: border-color 0.15s;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #4263eb;
    box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.1);
  }

  .form-hint {
    font-size: 0.6875rem;
    color: #999;
  }

  /* LTV slider + number */
  .ltv-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .ltv-inputs input[type='range'] {
    flex: 1;
    padding: 0;
    border: none;
    box-shadow: none;
    accent-color: #4263eb;
  }

  .ltv-inputs input[type='range']:focus {
    box-shadow: none;
    border: none;
  }

  .ltv-inputs input[type='number'] {
    width: 5rem;
    text-align: right;
  }

  .ltv-pct {
    font-size: 0.9375rem;
    color: #555;
    white-space: nowrap;
  }

  /* Zoekknop */
  .btn-zoek {
    display: block;
    width: 100%;
    margin-top: 1.5rem;
    padding: 0.8125rem 1.5rem;
    background: #4263eb;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }

  .btn-zoek:hover {
    background: #3451c7;
  }

  .btn-zoek:active {
    transform: translateY(1px);
  }

  /* ============================================================
     Foutmelding
  ============================================================ */
  .foutmelding {
    background: #fff0f0;
    border: 1.5px solid #ffb3b3;
    border-radius: 10px;
    padding: 1rem 1.25rem;
    color: #c0392b;
    margin-bottom: 1.5rem;
  }

  /* ============================================================
     Resultaten header
  ============================================================ */
  .resultaten-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1rem;
  }

  .resultaten-count {
    font-size: 0.875rem;
    color: #777;
  }

  /* ============================================================
     Geen resultaten
  ============================================================ */
  .geen-resultaten {
    background: white;
    border-radius: 14px;
    padding: 3rem 2rem;
    text-align: center;
    color: #666;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  }

  .geen-resultaten-icoon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .geen-resultaten strong {
    display: block;
    font-size: 1.0625rem;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .geen-resultaten p {
    margin: 0;
    font-size: 0.875rem;
  }

  /* ============================================================
     Financier card
  ============================================================ */
  .financier-card {
    background: white;
    border-radius: 14px;
    padding: 1.5rem;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07), 0 4px 16px rgba(0, 0, 0, 0.04);
    margin-bottom: 1.25rem;
  }

  .financier-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    gap: 1rem;
  }

  .financier-naam {
    margin: 0 0 0.2rem;
    font-size: 1.125rem;
    font-weight: 700;
    color: #1c1c2e;
  }

  .financier-contact {
    font-size: 0.8125rem;
    color: #888;
  }

  .financier-acties {
    flex-shrink: 0;
  }

  .financier-link {
    font-size: 0.8125rem;
    color: #4263eb;
    text-decoration: none;
    font-weight: 600;
  }

  .financier-link:hover {
    text-decoration: underline;
  }

  .financier-notities {
    margin: 1rem 0 0;
    font-size: 0.8125rem;
    color: #777;
    border-top: 1px solid #f0f0f0;
    padding-top: 0.875rem;
    font-style: italic;
  }

  /* ============================================================
     Product
  ============================================================ */
  .producten-lijst {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .product {
    border: 1.5px solid #eeeff2;
    border-radius: 10px;
    padding: 1rem 1.125rem;
    border-left: 4px solid #ced4da;
  }

  .product.senior    { border-left-color: #4263eb; }
  .product.mezzanine { border-left-color: #e67e22; }
  .product.bridge    { border-left-color: #27ae60; }
  .product.overig    { border-left-color: #95a5a6; }

  .product-header {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 0.875rem;
  }

  .product-naam {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: #1c1c2e;
  }

  /* Type badges */
  .type-badge {
    flex-shrink: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
  }

  .type-badge.senior    { background: #edf0ff; color: #3451c7; }
  .type-badge.mezzanine { background: #fff3e8; color: #b85c00; }
  .type-badge.bridge    { background: #e8f8ee; color: #1a8a45; }
  .type-badge.overig    { background: #f0f0f2; color: #666; }

  /* Product meta */
  .product-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.625rem;
    margin-bottom: 0.75rem;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .meta-label {
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: #999;
    font-weight: 600;
  }

  .meta-value {
    font-size: 0.875rem;
    font-weight: 500;
    color: #333;
  }

  /* Asset class tags */
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 0.875rem;
  }

  .tag {
    font-size: 0.75rem;
    background: #f3f4f6;
    color: #555;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    font-weight: 500;
  }

  /* Relevante staffel highlight */
  .staffel-highlight {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #edf0ff;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    margin-top: 0.125rem;
  }

  .staffel-highlight--ltc {
    background: #e8f8ee;
    margin-top: 0.5rem;
  }

  .staffel-highlight--ltc .staffel-rente {
    color: #1a8a45;
  }

  .staffel-label {
    display: block;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #7c8ab8;
    margin-bottom: 0.125rem;
  }

  .staffel-highlight--ltc .staffel-label {
    color: #5aaa80;
  }

  .staffel-bereik {
    font-size: 0.8125rem;
    color: #444;
    display: block;
  }

  .staffel-beschrijving {
    display: block;
    font-size: 0.75rem;
    color: #777;
    margin-top: 0.125rem;
  }

  .staffel-rente {
    font-size: 1.375rem;
    font-weight: 800;
    color: #4263eb;
    white-space: nowrap;
    letter-spacing: -0.02em;
  }

  /* Staffels tabel (geen LTV filter) */
  .staffels-tabel {
    margin-top: 0.125rem;
    background: #f9f9fb;
    border-radius: 8px;
    padding: 0.625rem 0.875rem;
  }

  .staffels-titel {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #999;
    display: block;
    margin-bottom: 0.5rem;
  }

  .staffel-rij {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    border-top: 1px solid #eeeff2;
  }

  .staffel-rij:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  .staffel-bereik-klein {
    font-size: 0.8125rem;
    color: #555;
  }

  .staffel-rente-klein {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #4263eb;
  }

  /* ============================================================
     Responsive
  ============================================================ */
  @media (max-width: 760px) {
    .container {
      padding: 1.25rem 1rem 3rem;
    }

    .zoekformulier {
      padding: 1.25rem 1rem;
    }

    .financier-card {
      padding: 1.125rem 1rem;
    }

    .product {
      padding: 0.875rem 0.875rem;
    }
  }

  @media (max-width: 620px) {
    .form-grid {
      grid-template-columns: 1fr;
    }

    .resultaten-header {
      flex-direction: column;
      gap: 0.25rem;
    }

    .financier-header {
      flex-direction: column;
    }

    .product-meta {
      grid-template-columns: 1fr 1fr;
    }

    .staffel-highlight {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.375rem;
    }

    .staffel-rente {
      font-size: 1.25rem;
    }
  }

  @media (max-width: 420px) {
    .ltv-inputs input[type='range'] {
      display: none;
    }

    .ltv-inputs input[type='number'] {
      width: 100%;
    }

    .product-meta {
      grid-template-columns: 1fr;
    }
  }
</style>
