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
  import { normalizeSearchText } from '$lib/utils/text';

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
  let busca = $state('');
  let atividadeFiltro = $state<'todos' | 'inativos' | 'ativos'>('ativos');
  let statusFiltro = $state<'todos' | 'alocados' | 'livres'>('todos');
  let marcaFiltro = $state('');
  let modeloFiltro = $state('');
  let ordenacao = $state<'id' | 'marca' | 'modelo'>('id');
  let modalTipo = $state<string | null>(null);
  let equipamentoEditando = $state<EquipmentRow | null>(null);

  const marcas = $derived(
    [...new Set(equipamentos
      .filter((item) => !filtro || item.tipo === filtro)
      .map((item) => item.marca?.trim())
      .filter((marca): marca is string => Boolean(marca)))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
  );
  const modelos = $derived(
    [...new Set(equipamentos
      .filter((item) => (!filtro || item.tipo === filtro) && (!marcaFiltro || item.marca?.trim() === marcaFiltro))
      .map((item) => item.modelo?.trim())
      .filter((modelo): modelo is string => Boolean(modelo)))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }))
  );
  const visiveis = $derived.by(() => {
    const termo = normalizeSearchText(busca.trim());
    const filtered = equipamentos.filter((item) => {
      const matchesSearch = !termo || [item.id, item.marca, item.modelo]
      .some((value) => normalizeSearchText(value).includes(termo));
      const matchesType = !filtro || item.tipo === filtro;
      const matchesActivity = atividadeFiltro === 'inativos' ? item.ativo === false : atividadeFiltro === 'todos' || item.ativo !== false;
      const matchesAllocation = statusFiltro === 'alocados' || statusFiltro === 'livres'
        ? (statusFiltro === 'alocados' ? Boolean(item.alocadoPara) : !item.alocadoPara)
        : true;
      const matchesMarca = !marcaFiltro || item.marca?.trim() === marcaFiltro;
      const matchesModelo = !modeloFiltro || item.modelo?.trim() === modeloFiltro;
      return matchesSearch && matchesType && matchesActivity && matchesAllocation && matchesMarca && matchesModelo;
    });

    return filtered.sort((a, b) => {
      const first = ordenacao === 'id' ? a.id : ordenacao === 'marca' ? (a.marca ?? '') : (a.modelo ?? '');
      const second = ordenacao === 'id' ? b.id : ordenacao === 'marca' ? (b.marca ?? '') : (b.modelo ?? '');
      return first.localeCompare(second, 'pt-BR', { numeric: ordenacao === 'id', sensitivity: 'base' });
    });
  });

  $effect(() => {
    if (marcaFiltro && !marcas.includes(marcaFiltro)) marcaFiltro = '';
    if (modeloFiltro && !modelos.includes(modeloFiltro)) modeloFiltro = '';
  });

  function isEquipmentRow(value: unknown): value is EquipmentRow {
    if (typeof value !== 'object' || value === null) return false;
    const item = value as Record<string, unknown>;
    return typeof item.tipo === 'string' && typeof item.id === 'string';
  }

  function countByType(tipo: string): number {
    return equipamentos.filter((item) => item.tipo === tipo && item.ativo !== false).length;
  }

  function adicionarEquipamento(item: Record<string, unknown>) {
    if (!modalTipo) return;
    const identifierKey = modalTipo === 'computador' || modalTipo === 'monitor' ? 'patrimonio' : 'id';
    const id = typeof item[identifierKey] === 'string' ? item[identifierKey] : String(item[identifierKey] ?? '');
    equipamentos = [...equipamentos, { ...item, tipo: modalTipo, id } as EquipmentRow];
    modalTipo = null;
  }

  function atualizarEquipamento(item: Record<string, unknown>) {
    const editando = equipamentoEditando;
    const tipo = editando?.tipo;
    if (!tipo || !editando) return;
    const key = tipo === 'computador' || tipo === 'monitor' ? 'patrimonio' : 'id';
    const id = String(item[key] ?? '');
    const editedId = editando.id;
    equipamentos = equipamentos.map((current) => current.tipo === tipo && current.id === editedId ? { ...item, tipo, id } as EquipmentRow : current);
    equipamentoEditando = null;
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
    {#if filtro || busca || atividadeFiltro !== 'ativos' || statusFiltro !== 'todos' || marcaFiltro || modeloFiltro || ordenacao !== 'id'}
      <button class="button--secondary" type="button" onclick={() => {
        filtro = null;
        busca = '';
        atividadeFiltro = 'ativos';
        statusFiltro = 'todos';
        marcaFiltro = '';
        modeloFiltro = '';
        ordenacao = 'id';
      }}>Limpar filtros</button>
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

  <section class="equipment-controls" aria-label="Filtros de equipamentos">
    <label class="equipment-search">
      <span>Buscar equipamento</span>
      <input type="search" placeholder="Identificação, marca ou modelo" bind:value={busca} />
    </label>
    <label>
      <span>Disponibilidade</span>
      <select bind:value={statusFiltro}>
        <option value="todos">Todos</option>
        <option value="alocados">Alocados</option>
        <option value="livres">Livres</option>
      </select>
    </label>
    <label>
      <span>Atividade</span>
      <select bind:value={atividadeFiltro}>
        <option value="ativos">Ativos</option>
        <option value="inativos">Inativos</option>
        <option value="todos">Todos</option>
      </select>
    </label>
    <label>
      <span>Marca</span>
      <select bind:value={marcaFiltro}>
        <option value="">Todas</option>
        {#each marcas as marca}<option value={marca}>{marca}</option>{/each}
      </select>
    </label>
    <label>
      <span>Modelo</span>
      <select bind:value={modeloFiltro}>
        <option value="">Todos</option>
        {#each modelos as modelo}<option value={modelo}>{modelo}</option>{/each}
      </select>
    </label>
    <label>
      <span>Ordenar</span>
      <select bind:value={ordenacao}>
        <option value="id">Identificação</option>
        <option value="marca">Marca</option>
        <option value="modelo">Modelo</option>
      </select>
    </label>
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
      <p>Nenhum equipamento encontrado com os filtros selecionados.</p>
    </section>
  {:else}
    <EquipmentTable equipamentos={visiveis} onSelect={(item) => { equipamentoEditando = item; modalTipo = null; }} />
  {/if}

  {#if equipamentoEditando}
    {#if equipamentoEditando.tipo === 'computador'}
      <ComputerCreateModal mode="edit" equipment={equipamentoEditando} onClose={() => equipamentoEditando = null} onSaved={atualizarEquipamento} />
    {:else if equipamentoEditando.tipo === 'monitor'}
      <MonitorCreateModal mode="edit" equipment={equipamentoEditando} onClose={() => equipamentoEditando = null} onSaved={atualizarEquipamento} />
    {:else if equipamentoEditando.tipo === 'fone'}
      <HeadsetCreateModal mode="edit" equipment={equipamentoEditando} onClose={() => equipamentoEditando = null} onSaved={atualizarEquipamento} />
    {:else if equipamentoEditando.tipo === 'mouse'}
      <MouseCreateModal mode="edit" equipment={equipamentoEditando} onClose={() => equipamentoEditando = null} onSaved={atualizarEquipamento} />
    {:else if equipamentoEditando.tipo === 'teclado'}
      <KeyboardCreateModal mode="edit" equipment={equipamentoEditando} onClose={() => equipamentoEditando = null} onSaved={atualizarEquipamento} />
    {:else if equipamentoEditando.tipo === 'outros'}
      <OtherCreateModal mode="edit" equipment={equipamentoEditando} onClose={() => equipamentoEditando = null} onSaved={atualizarEquipamento} />
    {/if}
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
