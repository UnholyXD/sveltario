<script lang="ts">
  import AllocationModal from '$lib/components/AllocationModal.svelte';
  import { onMount } from 'svelte';
  let { active = '/' } = $props<{ active?: string }>();
  let alocando = $state(false);
  let verificandoSessao = $state(false);
  let usuarioAtual = $state<string | null>(null);
  let saindo = $state(false);

  onMount(async () => {
    const response = await fetch('/api/auth/session');
    if (response.ok) usuarioAtual = (await response.json()).usuario ?? null;
  });

  async function sair() {
    saindo = true;
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.assign('/login');
  }

  async function abrirAlocacao() {
    verificandoSessao = true;
    try {
      const response = await fetch('/api/auth/session');
      const session = response.ok ? await response.json() : null;
      if (!session?.authenticated) {
        window.location.assign('/login');
        return;
      }
      alocando = true;
    } finally {
      verificandoSessao = false;
    }
  }

  const links = [
    { label: 'Home', href: '/', icon: 'home' },
    { label: 'Equipamentos', href: '/equipamentos', icon: 'equipment' },
    { label: 'Pessoas', href: '/pessoas', icon: 'people' },
    { label: 'Movimentações', href: '/movimentacoes', icon: 'history' }
  ];
</script>

<nav class="navbar-shell" aria-label="Navegação principal">
  <a class:active={active === '/'} class="navbar-link navbar-home" href="/" aria-label="Home" title="Home" aria-current={active === '/' ? 'page' : undefined}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    </svg>
    <span class="navbar-label">Home</span>
  </a>

  <div class="navbar-actions">
    <button class="navbar-link navbar-allocate" type="button" aria-label="Alocar" title="Alocar" onclick={abrirAlocacao} disabled={verificandoSessao}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M8 5V3h8v2M7 10h10M7 14h6" />
      </svg>
      <span class="navbar-label">Alocar</span>
    </button>

    {#each links.slice(1) as link}
      <a class:active={active === link.href} class="navbar-link" href={link.href} aria-label={link.label} title={link.label} aria-current={active === link.href ? 'page' : undefined}>
        {#if link.icon === 'equipment'}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 5h4M5 12h4M5 19h4M13 5h6M13 12h6M13 19h6" />
            <circle cx="3" cy="5" r="1" />
            <circle cx="3" cy="12" r="1" />
            <circle cx="3" cy="19" r="1" />
          </svg>
        {:else if link.icon === 'people'}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6v5h5M20 18v-5h-5" />
            <path d="M6.5 11A6.5 6.5 0 0 1 18 7M17.5 13A6.5 6.5 0 0 1 6 17" />
          </svg>
        {/if}
        <span class="navbar-label">{link.label}</span>
      </a>
    {/each}
    <a class:active={active === '/admin/usuarios'} class="navbar-link" href="/admin/usuarios" aria-label="Admin" title="Admin">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 14 5.2l3-.1.8 2.9 2.5 1.6-1.2 2.7 1.2 2.7-2.5 1.6-.8 2.9-3-.1L12 21l-2-2.2-3 .1-.8-2.9-2.5-1.6 1.2-2.7-1.2-2.7 2.5-1.6.8-2.9 3 .1z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span class="navbar-label">Admin</span>
    </a>
    {#if usuarioAtual}
      <span class="navbar-user" title="Usuário atual">{usuarioAtual}</span>
      <button class="navbar-link navbar-logout" type="button" aria-label="Sair" title="Sair" onclick={sair} disabled={saindo}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 5H5v14h5M14 8l4 4-4 4M9 12h9" />
        </svg>
        <span class="navbar-label">Sair</span>
      </button>
    {/if}
  </div>
</nav>

{#if alocando}
  <AllocationModal onClose={() => alocando = false} />
{/if}
