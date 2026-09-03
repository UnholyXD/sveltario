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

<style>
  .home-page {
    min-height: calc(100vh - 4.5rem);
    display: grid;
    place-items: center;
    padding-block: var(--space-8) var(--space-12);
  }

  .home-content {
    width: 100%;
    text-align: center;
  }

  h1 {
    margin: 0;
    color: var(--color-text);
    font-size: clamp(2rem, 4vw, 3rem);
  }

  .home-subtitle {
    margin: var(--space-2) 0 var(--space-8);
    color: var(--color-text-muted);
  }

  .home-tiles {
    display: grid;
    grid-template-columns: repeat(2, minmax(16rem, 22rem));
    justify-content: center;
    gap: clamp(var(--space-5), 6vw, var(--space-12));
  }

  .home-tile {
    display: grid;
    place-items: center;
    gap: var(--space-4);
    min-height: 19rem;
    padding: var(--space-8);
    border: var(--border-width) solid var(--color-border);
    border-radius: calc(var(--radius-lg) + var(--space-1));
    box-shadow: var(--shadow-card);
    color: var(--color-text);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
  }

  .home-tile:hover {
    transform: translateY(-0.35rem);
    box-shadow: 0 14px 26px var(--color-shadow);
  }

  .home-tile:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring), 0 14px 26px var(--color-shadow);
  }

  .home-tile svg {
    width: 8rem;
    height: 8rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 2.5;
  }

  .home-tile--equipment {
    background: #fff7eb;
    border-color: #f1c98c;
    color: #d98512;
  }

  .home-tile--people {
    background: #edf6ff;
    border-color: #a9d0f3;
    color: var(--color-primary);
  }

  @media (max-width: 700px) {
    .home-page {
      min-height: auto;
    }

    .home-tiles {
      grid-template-columns: minmax(0, 1fr);
    }

    .home-tile {
      min-height: 14rem;
    }
  }
</style>
