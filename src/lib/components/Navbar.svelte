<script lang="ts">
  let { active = '/' } = $props<{ active?: string }>();

  const links = [
    { label: 'Home', href: '/', icon: 'home' },
    { label: 'Equipamentos', href: '/equipamentos', icon: 'equipment' },
    { label: 'Pessoas', href: '/pessoas', icon: 'people' }
  ];
</script>

<nav class="navbar-shell" aria-label="Navegação principal">
  <a class:active={active === '/'} class="navbar-link navbar-home" href="/" aria-current={active === '/' ? 'page' : undefined}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
    <span>Home</span>
  </a>

  <div class="navbar-actions">
    <button class="navbar-link navbar-allocate" type="button">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M8 5V3h8v2M7 10h10M7 14h6" />
      </svg>
      <span>Alocar</span>
    </button>

    {#each links.slice(1) as link}
      <a class:active={active === link.href} class="navbar-link" href={link.href} aria-current={active === link.href ? 'page' : undefined}>
        {#if link.icon === 'equipment'}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5h4M5 12h4M5 19h4M13 5h6M13 12h6M13 19h6" />
            <circle cx="3" cy="5" r="1" />
            <circle cx="3" cy="12" r="1" />
            <circle cx="3" cy="19" r="1" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        {/if}
        <span>{link.label}</span>
      </a>
    {/each}
  </div>
</nav>

<style>
  .navbar-shell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    width: min(var(--container-width), calc(100% - var(--space-8)));
    min-height: 4.5rem;
    margin: 0 auto;
    border-bottom: var(--border-width) solid var(--color-border);
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .navbar-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    min-height: 2.5rem;
    padding: var(--space-2) var(--space-3);
    border: var(--border-width) solid transparent;
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    font: inherit;
    font-weight: var(--font-weight-medium);
    transition: color var(--transition-fast), background-color var(--transition-fast), border-color var(--transition-fast);
  }

  button.navbar-link {
    background: transparent;
    cursor: pointer;
  }

  .navbar-link svg {
    width: 1.25rem;
    height: 1.25rem;
    fill: none;
    stroke: currentColor;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
  }

  .navbar-link:hover,
  .navbar-link.active {
    background: var(--color-surface-muted);
    border-color: var(--color-border);
    color: var(--color-primary-strong);
  }

  .navbar-home {
    color: var(--color-text);
    font-size: var(--font-size-lg);
  }

  .navbar-home.active {
    color: var(--color-primary);
  }

  .navbar-allocate {
    color: var(--color-primary);
  }

  .navbar-allocate:hover {
    color: var(--color-primary-strong);
  }

  @media (max-width: 600px) {
    .navbar-shell {
      width: min(100% - var(--space-6), var(--container-width));
      align-items: flex-start;
      flex-direction: column;
      padding: var(--space-4) 0;
    }

    .navbar-actions {
      width: 100%;
      justify-content: space-between;
      gap: var(--space-1);
    }

    .navbar-link {
      padding-inline: var(--space-2);
    }
  }
</style>
