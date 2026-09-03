<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
</script>

<svelte:head>
  <title>SVeltário | Início</title>
  <meta name="description" content="Acesso rápido ao inventário do SVeltário." />
</svelte:head>

<Navbar active="/" />

<main class="home-page">
  <section class="home-content" aria-labelledby="home-title">
    <h1 id="home-title">SVeltário</h1>
    <p class="home-subtitle">Gerenciamento de equipamentos</p>

    <div class="home-tiles">
      <a class="home-tile home-tile--equipment" href="/equipamentos">
        <svg viewBox="0 0 96 96" aria-hidden="true">
          <rect x="18" y="20" width="60" height="54" rx="12" />
          <path d="M18 35h60M34 20v-7h28v7M33 49h30M33 61h18" />
        </svg>
        <span>Equipamentos</span>
      </a>

      <a class="home-tile home-tile--people" href="/pessoas">
        <svg viewBox="0 0 96 96" aria-hidden="true">
          <circle cx="48" cy="32" r="16" />
          <path d="M18 82c3-17 14-26 30-26s27 9 30 26" />
        </svg>
        <span>Pessoas</span>
      </a>
    </div>
  </section>
</main>
