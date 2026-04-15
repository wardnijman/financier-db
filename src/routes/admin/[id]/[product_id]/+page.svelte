<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let product = $derived(data.product)
  let financier = $derived(data.financier)

  const ASSET_OPTIES = [
    { val: 'kantoor', label: 'Kantoor' },
    { val: 'retail', label: 'Retail' },
    { val: 'wonen', label: 'Wonen' },
    { val: 'logistiek', label: 'Logistiek' },
    { val: 'hotel', label: 'Hotel' },
    { val: 'zorg', label: 'Zorg' },
    { val: 'gemengd', label: 'Gemengd' },
  ]

  const REGIO_OPTIES = [
    { val: 'nederland', label: 'Nederland' },
    { val: 'belgie', label: 'België' },
    { val: 'duitsland', label: 'Duitsland' },
    { val: 'europa', label: 'Europa' },
  ]

  function isActie(actie: string) {
    return form && 'actie' in form && form.actie === actie
  }

  function hasFout(actie: string): string | null {
    if (isActie(actie) && form && 'fout' in form) return form.fout as string
    return null
  }

  function isSucees(actie: string): boolean {
    return !!(isActie(actie) && form && 'succes' in form && form.succes)
  }

  // Kenmerken als pretty JSON voor textarea
  const kenmerkenJson = $derived(
    Object.keys(product.kenmerken ?? {}).length
      ? JSON.stringify(product.kenmerken, null, 2)
      : '',
  )

  // Actief status — reageert op toggleActief action
  let actief = $derived(
    isActie('toggleActief') && form && 'actief' in form
      ? (form.actief as boolean)
      : product.actief,
  )
</script>

<svelte:head><title>Admin — {product.naam}</title></svelte:head>

<!-- Breadcrumb -->
<nav class="breadcrumb">
  <a href="/admin">Financiers</a>
  <span>›</span>
  <a href="/admin/{financier.id}">{financier.naam}</a>
  <span>›</span>
  <span>{product.naam}</span>
</nav>

<!-- ================================================================
     PRODUCT BEWERKEN
================================================================ -->
<section class="kaart mb-lg">
  <div class="kaart-hoofd">
    <h2 class="kaart-titel">Product gegevens</h2>
    <div style="display:flex; gap:0.625rem; align-items:center;">
      <span class="badge {actief ? 'badge-actief' : 'badge-inactief'}">
        {actief ? 'Actief' : 'Inactief'}
      </span>
      <form method="POST" action="?/toggleActief" use:enhance style="display:contents">
        <input type="hidden" name="actief" value={actief ? 'false' : 'true'} />
        <button type="submit" class="btn btn-gevaar-licht btn-xs">
          {actief ? 'Deactiveren' : 'Activeren'}
        </button>
      </form>
    </div>
  </div>

  {#if isSucees('bijwerken')}
    <div class="alert alert-succes">Wijzigingen opgeslagen.</div>
  {/if}
  {#if hasFout('bijwerken')}
    <div class="alert alert-fout">{hasFout('bijwerken')}</div>
  {/if}

  <form method="POST" action="?/bijwerken" use:enhance>
    <div class="form-grid-2">
      <div class="form-groep vereist">
        <label for="naam">Naam</label>
        <input id="naam" name="naam" type="text" required value={product.naam} />
      </div>
      <div class="form-groep vereist">
        <label for="type">Type</label>
        <select id="type" name="type" required>
          <option value="senior"    selected={product.type === 'senior'}>Senior</option>
          <option value="mezzanine" selected={product.type === 'mezzanine'}>Mezzanine</option>
          <option value="bridge"    selected={product.type === 'bridge'}>Bridge</option>
          <option value="overig"    selected={product.type === 'overig'}>Overig</option>
        </select>
      </div>
      <div class="form-groep">
        <label for="min_bedrag">Min. bedrag (€)</label>
        <input id="min_bedrag" name="min_bedrag" type="number" min="0" step="100000"
          value={product.min_bedrag ?? ''} />
      </div>
      <div class="form-groep">
        <label for="max_bedrag">Max. bedrag (€)</label>
        <input id="max_bedrag" name="max_bedrag" type="number" min="0" step="100000"
          value={product.max_bedrag ?? ''} />
      </div>
      <div class="form-groep">
        <label for="min_looptijd_maanden">Min. looptijd (mnd)</label>
        <input id="min_looptijd_maanden" name="min_looptijd_maanden" type="number" min="1"
          value={product.min_looptijd_maanden ?? ''} />
      </div>
      <div class="form-groep">
        <label for="max_looptijd_maanden">Max. looptijd (mnd)</label>
        <input id="max_looptijd_maanden" name="max_looptijd_maanden" type="number" min="1"
          value={product.max_looptijd_maanden ?? ''} />
      </div>
    </div>

    <div class="form-grid-2">
      <fieldset class="checkbox-groep">
        <legend>Asset classes</legend>
        {#each ASSET_OPTIES as opt}
          <label class="checkbox-label">
            <input type="checkbox" name="asset_classes" value={opt.val}
              checked={product.asset_classes.includes(opt.val as never)} />
            {opt.label}
          </label>
        {/each}
      </fieldset>
      <fieldset class="checkbox-groep">
        <legend>Regio's</legend>
        {#each REGIO_OPTIES as opt}
          <label class="checkbox-label">
            <input type="checkbox" name="regios" value={opt.val}
              checked={product.regios.includes(opt.val as never)} />
            {opt.label}
          </label>
        {/each}
      </fieldset>
    </div>

    <div class="form-groep">
      <label for="kenmerken">Kenmerken (JSON)</label>
      <textarea id="kenmerken" name="kenmerken" rows="6">{kenmerkenJson}</textarea>
      <span class="form-hint">Vrij JSON object — leeg laten om te wissen</span>
    </div>

    <div class="form-acties">
      <button type="submit" class="btn btn-primair">Opslaan</button>
    </div>
  </form>
</section>

<!-- ================================================================
     LTV STAFFELS
================================================================ -->
<section class="kaart mb-lg">
  <h2 class="kaart-titel">LTV Staffels</h2>

  {#if isSucees('ltvToevoegen')}
    <div class="alert alert-succes">Staffel toegevoegd.</div>
  {/if}
  {#if hasFout('ltvToevoegen')}
    <div class="alert alert-fout">{hasFout('ltvToevoegen')}</div>
  {/if}
  {#if hasFout('ltvVerwijderen')}
    <div class="alert alert-fout">{hasFout('ltvVerwijderen')}</div>
  {/if}

  <!-- Bestaande staffels -->
  {#if product.ltv_staffels.length === 0}
    <p class="leeg">Nog geen LTV staffels.</p>
  {:else}
    <table class="staffel-tabel">
      <thead>
        <tr>
          <th>LTV min (%)</th>
          <th>LTV max (%)</th>
          <th>Rente-opslag (%)</th>
          <th>Beschrijving</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each product.ltv_staffels as s (s.id)}
          <tr>
            <td>{s.ltv_min}</td>
            <td>{s.ltv_max}</td>
            <td class="td-rente">+{s.rente_opslag.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}%</td>
            <td class="td-beschrijving">{s.beschrijving ?? '—'}</td>
            <td class="td-acties">
              <form method="POST" action="?/ltvVerwijderen" use:enhance
                onsubmit={(e) => { if (!confirm('Staffel verwijderen?')) e.preventDefault() }}>
                <input type="hidden" name="staffel_id" value={s.id} />
                <button type="submit" class="btn btn-gevaar-licht btn-xs">Verwijder</button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <!-- Nieuwe staffel -->
  <details class="toevoeg-details">
    <summary>+ LTV staffel toevoegen</summary>
    <form method="POST" action="?/ltvToevoegen" use:enhance class="staffel-form">
      <div class="staffel-invoer">
        <div class="form-groep vereist">
          <label for="ltv-min">LTV min (%)</label>
          <input id="ltv-min" name="ltv_min" type="number" min="0" max="100" step="0.01"
            placeholder="0" required />
        </div>
        <div class="form-groep vereist">
          <label for="ltv-max">LTV max (%)</label>
          <input id="ltv-max" name="ltv_max" type="number" min="0" max="100" step="0.01"
            placeholder="65" required />
        </div>
        <div class="form-groep vereist">
          <label for="ltv-rente">Rente-opslag (%)</label>
          <input id="ltv-rente" name="rente_opslag" type="number" min="0" step="0.001"
            placeholder="1.750" required />
        </div>
        <div class="form-groep">
          <label for="ltv-beschrijving">Beschrijving</label>
          <input id="ltv-beschrijving" name="beschrijving" type="text"
            placeholder="bijv. Standaard senior tranche" />
        </div>
      </div>
      <button type="submit" class="btn btn-secundair">Staffel toevoegen</button>
    </form>
  </details>
</section>

<!-- ================================================================
     LTC STAFFELS
================================================================ -->
<section class="kaart">
  <h2 class="kaart-titel">LTC Staffels</h2>

  {#if isSucees('ltcToevoegen')}
    <div class="alert alert-succes">Staffel toegevoegd.</div>
  {/if}
  {#if hasFout('ltcToevoegen')}
    <div class="alert alert-fout">{hasFout('ltcToevoegen')}</div>
  {/if}
  {#if hasFout('ltcVerwijderen')}
    <div class="alert alert-fout">{hasFout('ltcVerwijderen')}</div>
  {/if}

  {#if product.ltc_staffels.length === 0}
    <p class="leeg">Nog geen LTC staffels.</p>
  {:else}
    <table class="staffel-tabel">
      <thead>
        <tr>
          <th>LTC min (%)</th>
          <th>LTC max (%)</th>
          <th>Rente-opslag (%)</th>
          <th>Beschrijving</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each product.ltc_staffels as s (s.id)}
          <tr>
            <td>{s.ltc_min}</td>
            <td>{s.ltc_max}</td>
            <td class="td-rente">+{s.rente_opslag.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}%</td>
            <td class="td-beschrijving">{s.beschrijving ?? '—'}</td>
            <td class="td-acties">
              <form method="POST" action="?/ltcVerwijderen" use:enhance
                onsubmit={(e) => { if (!confirm('Staffel verwijderen?')) e.preventDefault() }}>
                <input type="hidden" name="staffel_id" value={s.id} />
                <button type="submit" class="btn btn-gevaar-licht btn-xs">Verwijder</button>
              </form>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <details class="toevoeg-details">
    <summary>+ LTC staffel toevoegen</summary>
    <form method="POST" action="?/ltcToevoegen" use:enhance class="staffel-form">
      <div class="staffel-invoer">
        <div class="form-groep vereist">
          <label for="ltc-min">LTC min (%)</label>
          <input id="ltc-min" name="ltc_min" type="number" min="0" max="100" step="0.01"
            placeholder="0" required />
        </div>
        <div class="form-groep vereist">
          <label for="ltc-max">LTC max (%)</label>
          <input id="ltc-max" name="ltc_max" type="number" min="0" max="100" step="0.01"
            placeholder="70" required />
        </div>
        <div class="form-groep vereist">
          <label for="ltc-rente">Rente-opslag (%)</label>
          <input id="ltc-rente" name="rente_opslag" type="number" min="0" step="0.001"
            placeholder="2.000" required />
        </div>
        <div class="form-groep">
          <label for="ltc-beschrijving">Beschrijving</label>
          <input id="ltc-beschrijving" name="beschrijving" type="text" />
        </div>
      </div>
      <button type="submit" class="btn btn-secundair">Staffel toevoegen</button>
    </form>
  </details>
</section>

<style>
  /* Breadcrumb */
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.875rem;
    color: #888;
  }
  .breadcrumb a { color: #3b5bdb; text-decoration: none; }
  .breadcrumb a:hover { text-decoration: underline; }

  /* Kaart */
  .kaart {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.04);
  }
  .mb-lg { margin-bottom: 1.25rem; }
  .kaart-hoofd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }
  .kaart-titel {
    margin: 0 0 1.25rem;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #666;
  }
  .kaart-hoofd .kaart-titel { margin-bottom: 0; }

  /* Formulier */
  .form-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem 1.5rem;
    margin-bottom: 1rem;
  }
  .form-groep {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  .form-groep label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #555;
  }
  .form-groep.vereist label::after { content: ' *'; color: #e74c3c; }
  .form-groep input,
  .form-groep textarea,
  .form-groep select {
    padding: 0.5rem 0.75rem;
    border: 1.5px solid #dde1e7;
    border-radius: 7px;
    font-size: 0.9375rem;
    font-family: inherit;
    color: #1c1c2e;
    background: white;
    transition: border-color 0.15s;
  }
  .form-groep input:focus,
  .form-groep textarea:focus,
  .form-groep select:focus {
    outline: none;
    border-color: #3b5bdb;
    box-shadow: 0 0 0 3px rgba(59, 91, 219, 0.1);
  }
  .form-groep textarea { resize: vertical; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.8125rem; }
  .form-hint { font-size: 0.6875rem; color: #999; }

  .form-acties {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.25rem;
  }

  /* Checkboxes */
  .checkbox-groep {
    border: 1.5px solid #dde1e7;
    border-radius: 7px;
    padding: 0.75rem 1rem;
    margin: 0;
  }
  .checkbox-groep legend {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #555;
    padding: 0 0.25rem;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
    padding: 0.1875rem 0;
    cursor: pointer;
    color: #333;
  }

  /* Staffel tabel */
  .staffel-tabel {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  .staffel-tabel th {
    text-align: left;
    padding: 0.5rem 0.75rem;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #777;
    border-bottom: 2px solid #f0f0f0;
  }
  .staffel-tabel td {
    padding: 0.625rem 0.75rem;
    border-bottom: 1px solid #f5f5f5;
    vertical-align: middle;
  }
  .staffel-tabel tbody tr:last-child td { border-bottom: none; }
  .staffel-tabel tbody tr:hover td { background: #fafafa; }
  .td-rente { font-weight: 700; color: #3b5bdb; }
  .td-beschrijving { color: #666; font-size: 0.8125rem; }
  .td-acties { text-align: right; }

  /* Toevoeg details */
  .toevoeg-details {
    margin-top: 0.75rem;
    border-top: 1px solid #f0f0f0;
    padding-top: 0.75rem;
  }
  .toevoeg-details summary {
    font-size: 0.875rem;
    font-weight: 600;
    color: #3b5bdb;
    cursor: pointer;
    list-style: none;
    padding: 0.25rem 0;
  }
  .toevoeg-details summary::-webkit-details-marker { display: none; }
  .toevoeg-details[open] summary { margin-bottom: 0.875rem; }

  .staffel-invoer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 2fr;
    gap: 0.875rem;
    margin-bottom: 0.875rem;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 7px;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    border: none;
    text-decoration: none;
    transition: background 0.15s;
  }
  .btn-primair { background: #3b5bdb; color: white; }
  .btn-primair:hover { background: #2f4bc2; }
  .btn-secundair { background: #e8f0ff; color: #3b5bdb; }
  .btn-secundair:hover { background: #d8e4ff; }
  .btn-gevaar-licht { background: #fff0f0; color: #c0392b; }
  .btn-gevaar-licht:hover { background: #ffe0e0; }
  .btn-xs { padding: 0.25rem 0.625rem; font-size: 0.75rem; }

  /* Badges */
  .badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 5px; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge-actief   { background: #e8f8ee; color: #1a8a45; }
  .badge-inactief { background: #f5f5f5; color: #888; }

  /* Alerts */
  .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }
  .alert-succes { background: #e8f8ee; border: 1px solid #a0d8b0; color: #1a6a35; }
  .alert-fout   { background: #fff0f0; border: 1px solid #ffc0c0; color: #c0392b; }

  .leeg { color: #888; font-style: italic; margin: 0.5rem 0; }

  @media (max-width: 640px) {
    .form-grid-2 { grid-template-columns: 1fr; }
    .staffel-invoer { grid-template-columns: 1fr 1fr; }
  }
</style>
