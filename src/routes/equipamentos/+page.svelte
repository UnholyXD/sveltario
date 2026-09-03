<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import EquipmentTable, { type EquipmentRow } from '$lib/components/EquipmentTable.svelte';
  import EquipmentTypeCard from '$lib/components/EquipmentTypeCard.svelte';

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

  const visiveis = $derived(filtro ? equipamentos.filter((item) => item.tipo === filtro) : equipamentos);

  function isEquipmentRow(value: unknown): value is EquipmentRow {
    if (typeof value !== 'object' || value === null) return false;
    const item = value as Record<string, unknown>;
    return typeof item.tipo === 'string' && typeof item.id === 'string';
  }

  function countByType(tipo: string): number {
    return equipamentos.filter((item) => item.tipo === tipo).length;
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
