<script lang="ts">
  import { page } from '$app/state'

  let { children } = $props()

  let isAdmin = $derived(page.url.pathname.startsWith('/admin'))
</script>

{#if !isAdmin}
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="site-logo">Vastgoedfinanciering</a>
      <nav class="site-nav">
        <a href="/" class="nav-link" class:actief={page.url.pathname === '/'}>Zoeken</a>
        <a href="/admin" class="nav-link nav-admin">Beheer</a>
      </nav>
    </div>
  </header>
{/if}

{@render children()}

<style>
  :global(*, *::before, *::after) { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 0.9375rem;
    color: #1c1c2e;
    background: #f4f5f7;
    line-height: 1.5;
  }

  .site-header {
    background: #1c1c2e;
    color: white;
    padding: 0 1.5rem;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-inner {
    max-width: 960px;
    margin: 0 auto;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .site-logo {
    color: white;
    text-decoration: none;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.02em;
  }

  .site-nav {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .nav-link {
    color: #a0a0c0;
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.375rem 0.75rem;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
  }

  .nav-link:hover { color: white; background: rgba(255,255,255,0.08); }
  .nav-link.actief { color: white; }

  .nav-admin {
    color: #7090e0;
    font-size: 0.8125rem;
  }
  .nav-admin:hover { color: white; background: rgba(112, 144, 224, 0.15); }
</style>
