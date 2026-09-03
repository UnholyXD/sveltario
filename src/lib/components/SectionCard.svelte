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
