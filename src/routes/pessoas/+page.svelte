<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import PersonCard from '$lib/components/PersonCard.svelte';
  import AddPersonModal from '$lib/components/AddPersonModal.svelte';

  type Person = {
    nome: string;
    usuario: string;
    setor?: string | null;
  };

  let pessoas = $state<Person[]>([]);
  let carregando = $state(true);
  let erro = $state(false);
  let mostrarCadastro = $state(false);

  function adicionarPessoa(pessoa: Person) {
    pessoas = [pessoa, ...pessoas];
    mostrarCadastro = false;
  }

  async function abrirCadastro() {
    const response = await fetch('/api/auth/session');
    const session = response.ok ? await response.json() : null;
    if (!session?.authenticated) {
      window.location.assign('/login');
      return;
    }
    mostrarCadastro = true;
  }

  onMount(async () => {
    try {
      const response = await fetch('/api/pessoas');
      if (!response.ok) {
        throw new Error('Falha ao carregar pessoas.');
      }

      const data: unknown = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Resposta inválida.');
      }

      pessoas = data.filter(
        (item): item is Person =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).nome === 'string' &&
          typeof (item as Record<string, unknown>).usuario === 'string'
      );
    } catch {
      erro = true;
    } finally {
      carregando = false;
    }
  });
</script>

<svelte:head>
  <title>Pessoas | SVeltário</title>
  <meta name="description" content="Colaboradores cadastrados no SVeltário." />
</svelte:head>

<Navbar active="/pessoas" />

<main class="people-page">
  <header class="page-header">
    <div>
      <p class="eyebrow">Diretório</p>
      <h1>Pessoas</h1>
    </div>
    <button class="button--primary" type="button" onclick={abrirCadastro}>Adicionar</button>
  </header>

  {#if carregando}
    <section class="state-message card panel" aria-live="polite">
      <p>Carregando colaboradores...</p>
    </section>
  {:else if erro}
    <section class="state-message card panel" role="alert">
      <p>Não foi possível carregar os colaboradores. Tente novamente.</p>
    </section>
  {:else if pessoas.length === 0}
    <section class="state-message card panel">
      <p>Nenhum colaborador cadastrado.</p>
    </section>
  {:else}
    <section class="people-grid" aria-label="Colaboradores cadastrados">
      {#each pessoas as pessoa (pessoa.usuario)}
        <PersonCard nome={pessoa.nome} usuario={pessoa.usuario} setor={pessoa.setor} />
      {/each}
    </section>
  {/if}
</main>

{#if mostrarCadastro}
  <AddPersonModal onClose={() => mostrarCadastro = false} onSaved={adicionarPessoa} />
{/if}
