<script lang="ts">
  const links = [
    { label: 'Equipamentos', href: '/equipamentos' },
    { label: 'Pessoas', href: '/pessoas' }
  ];
</script>

<svelte:head>
  <title>SVeltário</title>
</svelte:head>

<main>
  <header class="page-header">
    <div>
      <p class="eyebrow">Fundação técnica</p>
      <h1>SVeltário</h1>
    </div>
  </header>

  <section class="card panel">
    <p>
      Estrutura base pronta para gerenciamento de equipamentos e colaboradores.
      Esta etapa tem foco em organização do projeto e persistência em JSON.
    </p>

    <nav class="nav-list" aria-label="Navegação principal">
      {#each links as link}
        <a class="nav-link" href={link.href}>{link.label}</a>
      {/each}
    </nav>
  </section>
</main>

<style>
  .eyebrow {
    margin: 0 0 0.5rem;
    color: #53657c;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3rem);
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
</style>
