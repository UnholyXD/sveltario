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
  let busca = $state('');
  let ordenacao = $state<'alfabetica' | 'usuario'>('alfabetica');

  const pessoasVisiveis = $derived.by(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    const filtradas = termo
      ? pessoas.filter((pessoa) =>
          pessoa.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
          pessoa.usuario.toLocaleLowerCase('pt-BR').includes(termo)
        )
      : [...pessoas];

    return filtradas.sort((a, b) => {
      if (ordenacao === 'alfabetica') {
        return a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' });
      }

      const numeroA = Number(a.usuario.match(/\d+/)?.[0] ?? Number.POSITIVE_INFINITY);
      const numeroB = Number(b.usuario.match(/\d+/)?.[0] ?? Number.POSITIVE_INFINITY);
      return numeroA - numeroB || a.usuario.localeCompare(b.usuario, 'pt-BR', { sensitivity: 'base' });
    });
  });

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
    <div class="people-controls" role="search">
      <label class="people-search">
        <span>Buscar colaborador</span>
        <input type="search" bind:value={busca} placeholder="Nome ou ID DinaBox" />
      </label>
      <label class="people-sort">
        <span>Ordenar por</span>
        <select bind:value={ordenacao}>
          <option value="alfabetica">Alfabética</option>
          <option value="usuario">ID DinaBox</option>
        </select>
      </label>
    </div>

    {#if pessoasVisiveis.length === 0}
      <section class="state-message card panel">
        <p>Nenhum colaborador encontrado.</p>
      </section>
    {:else}
      <section class="people-grid" aria-label="Colaboradores cadastrados">
        {#each pessoasVisiveis as pessoa (pessoa.usuario)}
          <PersonCard nome={pessoa.nome} usuario={pessoa.usuario} setor={pessoa.setor} />
        {/each}
      </section>
    {/if}
  {/if}
</main>

{#if mostrarCadastro}
  <AddPersonModal onClose={() => mostrarCadastro = false} onSaved={adicionarPessoa} />
{/if}
