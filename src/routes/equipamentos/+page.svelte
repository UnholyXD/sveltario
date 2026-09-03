<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import EquipmentTable, { type EquipmentRow } from '$lib/components/EquipmentTable.svelte';
  import EquipmentTypeCard from '$lib/components/EquipmentTypeCard.svelte';
  import ComputerCreateModal from '$lib/components/ComputerCreateModal.svelte';
  import MonitorCreateModal from '$lib/components/MonitorCreateModal.svelte';
  import HeadsetCreateModal from '$lib/components/HeadsetCreateModal.svelte';
  import MouseCreateModal from '$lib/components/MouseCreateModal.svelte';
  import KeyboardCreateModal from '$lib/components/KeyboardCreateModal.svelte';
  import OtherCreateModal from '$lib/components/OtherCreateModal.svelte';

  const types = [
    { value: 'computador', label: 'Computador' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'fone', label: 'Fone' },
    { value: 'mouse', label: 'Mouse' },
    { value: 'teclado', label: 'Teclado' },
    { value: 'outros', label: 'Outros' }
  ];

  let equipamentos = $state<EquipmentRow[]>([]);
  let carregando = $state(true);
  let erro = $state(false);
  let filtro = $state<string | null>(null);
  let modalTipo = $state<string | null>(null);

  const visiveis = $derived(filtro ? equipamentos.filter((item) => item.tipo === filtro) : equipamentos);

  function isEquipmentRow(value: unknown): value is EquipmentRow {
    if (typeof value !== 'object' || value === null) return false;
    const item = value as Record<string, unknown>;
    return typeof item.tipo === 'string' && typeof item.id === 'string';
  }

  function countByType(tipo: string): number {
    return equipamentos.filter((item) => item.tipo === tipo).length;
  }

  function adicionarEquipamento(item: Record<string, unknown>) {
    if (!modalTipo) return;
    const identifierKey = modalTipo === 'computador' || modalTipo === 'monitor' ? 'patrimonio' : 'id';
    const id = typeof item[identifierKey] === 'string' ? item[identifierKey] : String(item[identifierKey] ?? '');
    equipamentos = [...equipamentos, { ...item, tipo: modalTipo, id } as EquipmentRow];
    modalTipo = null;
  }

  async function abrirCadastro(tipo: string) {
    const response = await fetch('/api/auth/session');
    const session = response.ok ? await response.json() : null;
    if (!session?.authenticated) {
      window.location.assign('/login');
      return;
    }
    modalTipo = tipo;
  }

  onMount(async () => {
    try {
      const response = await fetch('/api/equipamentos');
      if (!response.ok) throw new Error('Falha ao carregar equipamentos.');
      const data: unknown = await response.json();
      if (!Array.isArray(data)) throw new Error('Resposta inválida.');
      equipamentos = data.filter(isEquipmentRow);
    } catch {
      erro = true;
    } finally {
      carregando = false;
    }
  });
</script>

<svelte:head>
  <title>Equipamentos | SVeltário</title>
  <meta name="description" content="Equipamentos cadastrados no SVeltário." />
</svelte:head>

<Navbar active="/equipamentos" />

<main class="equipment-page">
  <header class="page-header">
    <div>
      <p class="eyebrow">Inventário</p>
      <h1>Equipamentos</h1>
    </div>
    {#if filtro}
      <button class="button--secondary" type="button" onclick={() => filtro = null}>Limpar filtro</button>
    {/if}
  </header>

  <section class="equipment-type-grid" aria-label="Filtrar por tipo de equipamento">
    {#each types as type}
      <EquipmentTypeCard
        label={type.label}
        count={countByType(type.value)}
        active={filtro === type.value}
        onSelect={() => filtro = filtro === type.value ? null : type.value}
        onAdd={() => abrirCadastro(type.value)}
      />
    {/each}
  </section>

  {#if carregando}
    <section class="state-message card panel" aria-live="polite">
      <p>Carregando equipamentos...</p>
    </section>
  {:else if erro}
    <section class="state-message card panel" role="alert">
      <p>Não foi possível carregar os equipamentos. Tente novamente.</p>
    </section>
  {:else if equipamentos.length === 0}
    <section class="state-message card panel">
      <p>Nenhum equipamento cadastrado.</p>
    </section>
  {:else if visiveis.length === 0}
    <section class="state-message card panel">
      <p>Nenhum equipamento encontrado para este tipo.</p>
    </section>
  {:else}
    <EquipmentTable equipamentos={visiveis} />
  {/if}
</main>

{#if modalTipo === 'computador'}
  <ComputerCreateModal onClose={() => modalTipo = null} onSaved={adicionarEquipamento} />
{:else if modalTipo === 'monitor'}
  <MonitorCreateModal onClose={() => modalTipo = null} onSaved={adicionarEquipamento} />
{:else if modalTipo === 'fone'}
  <HeadsetCreateModal onClose={() => modalTipo = null} onSaved={adicionarEquipamento} />
{:else if modalTipo === 'mouse'}
  <MouseCreateModal onClose={() => modalTipo = null} onSaved={adicionarEquipamento} />
{:else if modalTipo === 'teclado'}
  <KeyboardCreateModal onClose={() => modalTipo = null} onSaved={adicionarEquipamento} />
{:else if modalTipo === 'outros'}
  <OtherCreateModal onClose={() => modalTipo = null} onSaved={adicionarEquipamento} />
{/if}
