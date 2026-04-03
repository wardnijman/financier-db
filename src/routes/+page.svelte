<script lang="ts">
  let { data } = $props()
</script>

<h1>Financiers</h1>
{#each data.financiers as f}
  <p>{f.naam} — {f.website}</p>
{/each}
