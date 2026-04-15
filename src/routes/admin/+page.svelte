<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'

  let { data, form }: { data: PageData; form: ActionData } = $props()

  let formulierOpen = $state(false)

  type Financier = PageData['financiers'][number]

  function aantalActieveProducten(f: Financier): number {
    return (f.producten ?? []).filter((p) => p.actief).length
  }

  function totaalProducten(f: Financier): number {
    return (f.producten ?? []).length
  }
</script>

<svelte:head><title>Admin — Financiers</title></svelte:head>

<div class="pagina-header">
  <h1>Financiers</h1>
  <button class="btn btn-primair" onclick={() => (formulierOpen = !formulierOpen)}>
    {formulierOpen ? '✕ Annuleren' : '+ Nieuw toevoegen'}
  </button>
</div>

<!-- ================================================================
     TOEVOEG-FORMULIER
================================================================ -->
{#if formulierOpen}
  <section class="kaart mb-lg">
    <h2 class="kaart-titel">Nieuwe financier</h2>

    {#if form && 'fout' in form && form.fout}
      <div class="alert alert-fout">{form.fout}</div>
    {/if}

    <form method="POST" action="?/toevoegen" use:enhance>
      <div class="form-grid-2">
        <div class="form-groep vereist">
          <label for="naam">Naam</label>
          <input id="naam" name="naam" type="text" required placeholder="ING Real Estate Finance" />
        </div>
        <div class="form-groep">
          <label for="website">Website</label>
          <input id="website" name="website" type="url" placeholder="https://..." />
        </div>
        <div class="form-groep">
          <label for="contactpersoon">Contactpersoon</label>
          <input id="contactpersoon" name="contactpersoon" type="text" />
        </div>
        <div class="form-groep">
          <label for="email">E-mail</label>
          <input id="email" name="email" type="email" />
        </div>
        <div class="form-groep">
          <label for="telefoon">Telefoon</label>
          <input id="telefoon" name="telefoon" type="tel" />
        </div>
        <div class="form-groep">
          <label for="logo_url">Logo URL</label>
          <input id="logo_url" name="logo_url" type="url" placeholder="https://..." />
        </div>
      </div>
      <div class="form-groep">
        <label for="notities">Notities</label>
        <textarea id="notities" name="notities" rows="3"></textarea>
      </div>
      <div class="form-acties">
        <button type="submit" class="btn btn-primair">Financier aanmaken →</button>
      </div>
    </form>
  </section>
{/if}

<!-- ================================================================
     OVERZICHT TABEL
================================================================ -->
<section class="kaart">
  <h2 class="kaart-titel">Alle financiers ({data.financiers.length})</h2>

  {#if data.financiers.length === 0}
    <p class="leeg">Nog geen financiers. Voeg er één toe met de knop hierboven.</p>
  {:else}
    <table class="tabel">
      <thead>
        <tr>
          <th>Naam</th>
          <th>Producten</th>
          <th>Status</th>
          <th>Aangemaakt</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {#each data.financiers as f (f.id)}
          <tr class={f.actief ? '' : 'inactief-rij'}>
            <td>
              <strong>{f.naam}</strong>
              {#if f.website}
                <a href={f.website} target="_blank" rel="noopener" class="ext-link">↗</a>
              {/if}
            </td>
            <td class="td-center">
              <span title="{totaalProducten(f)} totaal, {aantalActieveProducten(f)} actief">
                {aantalActieveProducten(f)}/{totaalProducten(f)}
              </span>
            </td>
            <td>
              <span class="badge {f.actief ? 'badge-actief' : 'badge-inactief'}">
                {f.actief ? 'Actief' : 'Inactief'}
              </span>
            </td>
            <td class="td-datum">
              {new Date(f.created_at).toLocaleDateString('nl-NL')}
            </td>
            <td class="td-acties">
              <a href="/admin/{f.id}" class="btn btn-klein">Bewerken</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>

<style>
  .pagina-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .pagina-header h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  /* Kaart */
  .kaart {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07), 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  .kaart-titel {
    margin: 0 0 1.25rem;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #666;
  }

  .mb-lg { margin-bottom: 1.25rem; }

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

  .form-groep.vereist label::after {
    content: ' *';
    color: #e74c3c;
  }

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

  .form-groep textarea { resize: vertical; }

  .form-acties {
    display: flex;
    justify-content: flex-end;
    margin-top: 1.25rem;
  }

  /* Tabel */
  .tabel {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .tabel th {
    text-align: left;
    padding: 0.625rem 0.75rem;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #777;
    border-bottom: 2px solid #f0f0f0;
  }

  .tabel td {
    padding: 0.75rem;
    border-bottom: 1px solid #f5f5f5;
    vertical-align: middle;
  }

  .tabel tbody tr:last-child td { border-bottom: none; }
  .tabel tbody tr:hover td { background: #fafafa; }

  .inactief-rij td { opacity: 0.55; }

  .td-center { text-align: center; }
  .td-datum { color: #888; font-size: 0.8125rem; white-space: nowrap; }
  .td-acties { text-align: right; white-space: nowrap; }

  .ext-link {
    color: #3b5bdb;
    text-decoration: none;
    margin-left: 0.25rem;
    font-size: 0.75rem;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
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

  .btn-klein {
    padding: 0.3125rem 0.75rem;
    font-size: 0.8125rem;
    background: #f0f2f5;
    color: #3b5bdb;
  }
  .btn-klein:hover { background: #e2e6ef; }

  /* Badges */
  .badge {
    display: inline-block;
    padding: 0.2rem 0.5rem;
    border-radius: 5px;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .badge-actief   { background: #e8f8ee; color: #1a8a45; }
  .badge-inactief { background: #f5f5f5; color: #888; }

  /* Alerts */
  .alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; }
  .alert-fout { background: #fff0f0; border: 1px solid #ffc0c0; color: #c0392b; }

  .leeg { color: #888; font-style: italic; margin: 0.5rem 0; }

  @media (max-width: 640px) {
    .form-grid-2 { grid-template-columns: 1fr; }
    .pagina-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  }
</style>
