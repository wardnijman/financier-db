<script lang="ts">
  let { children } = $props()
</script>

<div class="admin-shell">
  <nav class="admin-nav">
    <div class="nav-inner">
      <a href="/admin" class="nav-brand">⚙ Beheer</a>
      <a href="/" class="nav-link">← Terug naar zoektool</a>
    </div>
  </nav>
  <div class="admin-body">
    {@render children()}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    font-size: 0.9375rem;
    color: #1c1c2e;
    background: #f0f2f5;
    line-height: 1.5;
  }

  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  .admin-shell {
    min-height: 100vh;
  }

  .admin-nav {
    background: #2c3e50;
    color: white;
    padding: 0 1.5rem;
  }

  .nav-inner {
    max-width: 1100px;
    margin: 0 auto;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-brand {
    color: white;
    text-decoration: none;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: -0.01em;
  }

  .nav-link {
    color: #a0b0c0;
    text-decoration: none;
    font-size: 0.875rem;
  }

  .nav-link:hover {
    color: white;
  }

  .admin-body {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }
</style>
