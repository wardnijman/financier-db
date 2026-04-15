<script lang="ts">
  import { page } from '$app/state'
</script>

<svelte:head>
  <title>Fout {page.status} — Vastgoedfinanciering</title>
</svelte:head>

<div class="fout-pagina">
  <div class="fout-kaart">
    <div class="fout-status">{page.status}</div>
    <h1 class="fout-titel">
      {#if page.status === 404}
        Pagina niet gevonden
      {:else if page.status === 500}
        Serverfout
      {:else}
        Er is een fout opgetreden
      {/if}
    </h1>
    <p class="fout-bericht">
      {#if page.error?.message && page.error.message !== 'Not Found'}
        {page.error.message}
      {:else if page.status === 404}
        De pagina die u zoekt bestaat niet of is verplaatst.
      {:else if page.status === 500}
        Er is een onverwachte fout opgetreden. Controleer de verbinding met de database en probeer het opnieuw.
      {:else}
        Probeer de pagina te vernieuwen of ga terug naar de startpagina.
      {/if}
    </p>
    <div class="fout-acties">
      <a href="/" class="btn btn-primair">Terug naar startpagina</a>
      <button class="btn btn-secundair" onclick={() => history.back()}>Vorige pagina</button>
    </div>
  </div>
</div>

<style>
  .fout-pagina {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
  }

  .fout-kaart {
    background: white;
    border-radius: 16px;
    padding: 3rem 2.5rem;
    text-align: center;
    max-width: 480px;
    width: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.06);
  }

  .fout-status {
    font-size: 4rem;
    font-weight: 800;
    color: #e8eaff;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: 0.75rem;
  }

  .fout-titel {
    margin: 0 0 0.75rem;
    font-size: 1.375rem;
    font-weight: 700;
    color: #1c1c2e;
  }

  .fout-bericht {
    margin: 0 0 2rem;
    color: #666;
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .fout-acties {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5625rem 1.25rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    border: none;
    text-decoration: none;
    transition: background 0.15s;
  }
  .btn-primair { background: #4263eb; color: white; }
  .btn-primair:hover { background: #3451c7; }
  .btn-secundair { background: #f0f2f5; color: #444; }
  .btn-secundair:hover { background: #e2e6ef; }
</style>
