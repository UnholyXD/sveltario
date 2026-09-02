<script lang="ts">
  let { title, description = '', children } = $props();
</script>

<section class="card panel">
  <h3>{title}</h3>
  {#if description}
    <p>{description}</p>
  {/if}
  {@render children()}
</section>

<style>
  h3 {
    margin: 0 0 0.5rem;
  }

  p {
    margin: 0 0 1rem;
    color: #53657c;
  }
</style>
