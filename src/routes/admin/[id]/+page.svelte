<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let financier = $derived(data.financier)

  const TYPE_LABELS: Record<string, string> = {
    senior: 'Senior', mezzanine: 'Mezzanine', bridge: 'Bridge', overig: 'Overig',
  }
  const ASSET_LABELS: Record<string, string> = {
    kantoor: 'Kantoor', retail: 'Retail', wonen: 'Wonen', logistiek: 'Logistiek',
    hotel: 'Hotel', zorg: 'Zorg', gemengd: 'Gemengd',
  }
  const REGIO_LABELS: Record<string, string> = {
    nederland: 'Nederland', belgie: 'België', duitsland: 'Duitsland', europa: 'Europa',
  }

  function formatBedrag(n: number | null) {
    if (n === null) return '—'
    return `€\u00a0${(n / 1_000_000).toLocaleString('nl-NL', { maximumFractionDigits: 1 })}\u00a0mln`
  }

  function isActie(actie: string) {
    return form && 'actie' in form && form.actie === actie
  }

  let nieuwProductOpen = $state(false)
</script>

<svelte:head><title>Admin — {financier.naam}</title></svelte:head>

<!-- Breadcrumb -->
<nav class="breadcrumb">
  <a href="/admin">Financiers</a>
  <span>›</span>
  <span>{financier.naam}</span>
</nav>

<!-- ================================================================
     FINANCIER BEWERKEN
================================================================ -->
<section class="kaart mb-lg">
  <div class="kaart-hoofd">
    <h2 class="kaart-titel">Financier gegevens</h2>
    <span class="badge {financier.actief ? 'badge-actief' : 'badge-inactief'}">
      {financier.actief ? 'Actief' : 'Inactief'}
    </span>
  </div>

  {#if isActie('bijwerken') && form && 'succes' in form && form.succes}
    <div class="alert alert-succes">Wijzigingen opgeslagen.</div>
  {/if}
  {#if isActie('bijwerken') && form && 'fout' in form && form.fout}
    <div class="alert alert-fout">{form.fout}</div>
  {/if}

  <form method="POST" action="?/bijwerken" use:enhance>
    <div class="form-grid-2">
      <div class="form-groep vereist">
        <label for="naam">Naam</label>
        <input id="naam" name="naam" type="text" required value={financier.naam} />
      </div>
      <div class="form-groep">
        <label for="website">Website</label>
        <input id="website" name="website" type="url" value={financier.website ?? ''} />
      </div>
      <div class="form-groep">
        <label for="contactpersoon">Contactpersoon</label>
        <input id="contactpersoon" name="contactpersoon" type="text" value={financier.contactpersoon ?? ''} />
      </div>
      <div class="form-groep">
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" value={financier.email ?? ''} />
      </div>
      <div class="form-groep">
        <label for="telefoon">Telefoon</label>
        <input id="telefoon" name="telefoon" type="tel" value={financier.telefoon ?? ''} />
      </div>
      <div class="form-groep">
        <label for="logo_url">Logo URL</label>
        <input id="logo_url" name="logo_url" type="url" value={financier.logo_url ?? ''} />
      </div>
    </div>
    <div class="form-groep">
      <label for="notities">Notities</label>
      <textarea id="notities" name="notities" rows="3">{financier.notities ?? ''}</textarea>
    </div>
    <div class="form-acties">
      <button type="submit" class="btn btn-primair">Opslaan</button>
    </div>
  </form>

  <!-- Toggle buiten de edit-form (nested forms zijn niet geldig HTML) -->
  <form method="POST" action="?/toggleActief" use:enhance class="toggle-form">
    <input type="hidden" name="actief" value={financier.actief ? 'false' : 'true'} />
    <button type="submit" class="btn btn-gevaar-licht btn-xs">
      {financier.actief ? 'Deactiveren' : 'Activeren'}
    </button>
  </form>
</section>

<!-- ================================================================
     PRODUCTEN
================================================================ -->
<section class="kaart">
  <div class="kaart-hoofd">
    <h2 class="kaart-titel">Producten ({financier.producten.length})</h2>
    <button class="btn btn-klein" onclick={() => (nieuwProductOpen = !nieuwProductOpen)}>
      {nieuwProductOpen ? '✕ Annuleren' : '+ Product toevoegen'}
    </button>
  </div>

  {#if isActie('productToevoegen') && form && 'fout' in form && form.fout}
    <div class="alert alert-fout">{form.fout}</div>
  {/if}

  <!-- Nieuw product formulier -->
  {#if nieuwProductOpen}
    <div class="sub-formulier">
      <h3 class="sub-titel">Nieuw product</h3>
      <form method="POST" action="?/productToevoegen" use:enhance>
        <div class="form-grid-2">
          <div class="form-groep vereist">
            <label for="p-naam">Naam</label>
            <input id="p-naam" name="naam" type="text" required placeholder="Senior Hypothecaire Lening" />
          </div>
          <div class="form-groep vereist">
            <label for="p-type">Type</label>
            <select id="p-type" name="type" required>
              <option value="">— Kies type —</option>
              <option value="senior">Senior</option>
              <option value="mezzanine">Mezzanine</option>
              <option value="bridge">Bridge</option>
              <option value="overig">Overig</option>
            </select>
          </div>
          <div class="form-groep">
            <label for="p-min-bedrag">Min. bedrag (€)</label>
            <input id="p-min-bedrag" name="min_bedrag" type="number" min="0" step="100000" placeholder="5000000" />
          </div>
          <div class="form-groep">
            <label for="p-max-bedrag">Max. bedrag (€)</label>
            <input id="p-max-bedrag" name="max_bedrag" type="number" min="0" step="100000" placeholder="100000000" />
          </div>
          <div class="form-groep">
            <label for="p-min-loop">Min. looptijd (mnd)</label>
            <input id="p-min-loop" name="min_looptijd_maanden" type="number" min="1" placeholder="12" />
          </div>
          <div class="form-groep">
            <label for="p-max-loop">Max. looptijd (mnd)</label>
            <input id="p-max-loop" name="max_looptijd_maanden" type="number" min="1" placeholder="120" />
          </div>
        </div>

        <div class="form-grid-2">
          <fieldset class="checkbox-groep">
            <legend>Asset classes</legend>
            {#each Object.entries(ASSET_LABELS) as [val, label]}
              <label class="checkbox-label">
                <input type="checkbox" name="asset_classes" value={val} /> {label}
              </label>
            {/each}
          </fieldset>
          <fieldset class="checkbox-groep">
            <legend>Regio's</legend>
            {#each Object.entries(REGIO_LABELS) as [val, label]}
              <label class="checkbox-label">
                <input type="checkbox" name="regios" value={val} /> {label}
              </label>
            {/each}
          </fieldset>
        </div>

        <div class="form-groep">
          <label for="p-kenmerken">Kenmerken (JSON)</label>
          <textarea id="p-kenmerken" name="kenmerken" rows="4" placeholder='{"{"}  "max_ltv": 65, "min_dscr": 1.25 {"}"}'></textarea>
          <span class="form-hint">Optioneel — vrij JSON object voor extra voorwaarden</span>
        </div>

        <div class="form-acties">
          <button type="submit" class="btn btn-primair">Product aanmaken →</button>
        </div>
      </form>
    </div>
  {/if}

  <!-- Productenlijst -->
  {#if financier.producten.length === 0}
    <p class="leeg">Nog geen producten voor deze financier.</p>
  {:else}
    <div class="producten-lijst">
      {#each financier.producten as p (p.id)}
        <div class="product-rij {p.actief ? '' : 'product-inactief'}">
          <div class="product-info">
            <span class="type-badge type-{p.type}">{TYPE_LABELS[p.type]}</span>
            <span class="product-naam">{p.naam}</span>
            {#if !p.actief}
              <span class="badge badge-inactief">Inactief</span>
            {/if}
          </div>
          <div class="product-meta-klein">
            {#if p.min_bedrag || p.max_bedrag}
              <span>{formatBedrag(p.min_bedrag)} – {formatBedrag(p.max_bedrag)}</span>
            {/if}
            {#if (p.asset_classes ?? []).length > 0}
              <span>{(p.asset_classes ?? []).map((a: string) => ASSET_LABELS[a] ?? a).join(', ')}</span>
            {/if}
          </div>
          <a href="/admin/{financier.id}/{p.id}" class="btn btn-klein">Bewerken</a>
        </div>
      {/each}
    </div>
  {/if}
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
    margin: 0;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #666;
  }

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
    transition: border-color 0.15s;
  }
  .form-groep input:focus,
  .form-groep textarea:focus,
  .form-groep select:focus {
    outline: none;
    border-color: #3b5bdb;
    box-shadow: 0 0 0 3px rgba(59, 91, 219, 0.1);
  }
  .form-groep textarea { resize: vertical; }
  .form-hint { font-size: 0.6875rem; color: #999; }

  .form-acties {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }
  .toggle-form {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.625rem;
    padding-top: 0.625rem;
    border-top: 1px solid #f0f0f0;
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

  /* Sub-formulier */
  .sub-formulier {
    background: #f8f9fb;
    border-radius: 9px;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    border: 1.5px solid #e8eaf0;
  }
  .sub-titel {
    margin: 0 0 1rem;
    font-size: 0.875rem;
    font-weight: 700;
    color: #444;
  }

  /* Productenlijst */
  .producten-lijst {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .product-rij {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border: 1.5px solid #eef0f4;
    border-radius: 8px;
  }
  .product-rij:hover { border-color: #d0d4e0; }
  .product-inactief { opacity: 0.55; }
  .product-info {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex: 1;
    min-width: 0;
  }
  .product-naam {
    font-weight: 600;
    font-size: 0.9rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .product-meta-klein {
    display: flex;
    gap: 1rem;
    font-size: 0.8125rem;
    color: #777;
    flex-shrink: 0;
  }

  /* Type badges */
  .type-badge {
    flex-shrink: 0;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    padding: 0.2rem 0.45rem;
    border-radius: 4px;
    white-space: nowrap;
  }
  .type-senior    { background: #edf0ff; color: #3451c7; }
  .type-mezzanine { background: #fff3e8; color: #b85c00; }
  .type-bridge    { background: #e8f8ee; color: #1a8a45; }
  .type-overig    { background: #f0f0f2; color: #666; }

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
  .btn-klein { padding: 0.3125rem 0.75rem; font-size: 0.8125rem; background: #f0f2f5; color: #3b5bdb; flex-shrink: 0; }
  .btn-klein:hover { background: #e2e6ef; }
  .btn-gevaar-licht { background: #fff0f0; color: #c0392b; }
  .btn-gevaar-licht:hover { background: #ffe0e0; }

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
    .product-meta-klein { display: none; }
  }
</style>
