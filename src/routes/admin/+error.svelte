<script lang="ts">
  import { page } from '$app/state'
</script>

<svelte:head>
  <title>Fout {page.status} — Admin</title>
</svelte:head>

<div class="fout-kaart">
  <div class="fout-status">{page.status}</div>
  <h1 class="fout-titel">
    {#if page.status === 404}
      Niet gevonden
    {:else if page.status === 500}
      Serverfout
    {:else}
      Fout opgetreden
    {/if}
  </h1>
  <p class="fout-bericht">
    {#if page.error?.message}
      {page.error.message}
    {:else}
      Er is een onverwachte fout opgetreden.
    {/if}
    {#if page.status === 500}
      <br /><small>Controleer of SUPABASE_SERVICE_ROLE_KEY correct is ingesteld in .env.local.</small>
    {/if}
  </p>
  <a href="/admin" class="btn">← Terug naar overzicht</a>
</div>

<style>
  .fout-kaart {
    background: white;
    border-radius: 12px;
    padding: 2.5rem 2rem;
    max-width: 520px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04);
  }

  .fout-status {
    font-size: 3.5rem;
    font-weight: 800;
    color: #eef0f8;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .fout-titel {
    margin: 0 0 0.625rem;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .fout-bericht {
    margin: 0 0 1.5rem;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .fout-bericht small { color: #999; }

  .btn {
    display: inline-flex;
    padding: 0.5rem 1rem;
    background: #f0f2f5;
    color: #3b5bdb;
    border-radius: 7px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
  }
  .btn:hover { background: #e2e6ef; }
</style>
