<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const actionLabels: Record<string, string> = {
    alocacao: 'Alocação',
    desalocacao: 'Desalocação',
    transferencia: 'Transferência',
    troca: 'Troca'
  };
  const equipmentLabels: Record<string, string> = {
    computador: 'Computador',
    monitor: 'Monitor',
    mouse: 'Mouse',
    teclado: 'Teclado',
    fone: 'Fone',
    outros: 'Outros'
  };

  let busca = $state('');
  let acaoFiltro = $state('');
  let tipoFiltro = $state('');
  let dataInicial = $state('');
  let dataFinal = $state('');
  let ordem = $state<'recente' | 'antigo'>('recente');

  function text(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  function equipmentText(equipment: typeof data.movimentacoes[number]['equipamento'] | undefined): string {
    if (!equipment) return '—';
    const label = equipmentLabels[equipment.tipo] ?? equipment.tipo;
    return `${label} ${equipment.id}`;
  }

  function equipmentSearchText(equipment: typeof data.movimentacoes[number]['equipamento'] | undefined): string {
    if (!equipment) return '';
    return [equipment.tipo, equipment.id, equipment.marca, equipment.modelo, equipment.categoria].map(text).join(' ');
  }

  function personText(person: typeof data.movimentacoes[number]['origem']): string {
    return person ? `${person.nome} (${person.usuario})` : '—';
  }

  function originText(movement: typeof data.movimentacoes[number]): string {
    return movement.acao === 'alocacao' || movement.acao === 'troca'
      ? (movement.acao === 'troca' ? personText(movement.origem ?? movement.destino) : '—')
      : personText(movement.origem);
  }

  function equipmentForFilter(movement: typeof data.movimentacoes[number]): string[] {
    return [movement.equipamento, movement.equipamentoAnterior, movement.equipamentoNovo]
      .filter((equipment): equipment is NonNullable<typeof equipment> => Boolean(equipment))
      .map((equipment) => equipment.tipo);
  }

  function formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function datePart(value: string): string {
    return value.slice(0, 10);
  }

  function searchableText(movement: typeof data.movimentacoes[number]): string {
    return [
      movement.origem?.nome,
      movement.origem?.usuario,
      movement.destino?.nome,
      movement.destino?.usuario,
      movement.executadoPor,
      equipmentSearchText(movement.equipamento),
      equipmentSearchText(movement.equipamentoAnterior),
      equipmentSearchText(movement.equipamentoNovo)
    ].map(text).join(' ').toLocaleLowerCase('pt-BR');
  }

  const movimentacoesVisiveis = $derived.by(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return data.movimentacoes
      .filter((movement) => {
        const matchesSearch = !termo || searchableText(movement).includes(termo);
        const matchesAction = !acaoFiltro || movement.acao === acaoFiltro;
        const matchesType = !tipoFiltro || equipmentForFilter(movement).includes(tipoFiltro);
        const movementDate = datePart(movement.data);
        const matchesStart = !dataInicial || movementDate >= dataInicial;
        const matchesEnd = !dataFinal || movementDate <= dataFinal;
        return matchesSearch && matchesAction && matchesType && matchesStart && matchesEnd;
      })
      .sort((a, b) => {
        const difference = new Date(a.data).getTime() - new Date(b.data).getTime();
        return ordem === 'recente' ? -difference : difference;
      });
  });
</script>

<svelte:head>
  <title>Movimentações | SVeltário</title>
  <meta name="description" content="Histórico de movimentações do inventário." />
</svelte:head>

<Navbar active="/movimentacoes" />

<main class="movements-page">
  <header class="page-header">
    <div>
      <p class="eyebrow">Auditoria</p>
      <h1>Movimentações</h1>
    </div>
  </header>

  {#if data.movimentacoes.length === 0}
    <section class="state-message card panel"><p>Nenhuma movimentação registrada.</p></section>
  {:else}
    <section class="movements-controls" role="search" aria-label="Filtros de movimentações">
      <label class="movements-search">
        <span>Buscar</span>
        <input type="search" bind:value={busca} placeholder="Nome, ID, equipamento ou usuário" />
      </label>
      <label>
        <span>Tipo de ação</span>
        <select bind:value={acaoFiltro}>
          <option value="">Todas</option>
          <option value="alocacao">Alocação</option>
          <option value="desalocacao">Desalocação</option>
          <option value="transferencia">Transferência</option>
          <option value="troca">Troca</option>
        </select>
      </label>
      <label>
        <span>Tipo de equipamento</span>
        <select bind:value={tipoFiltro}>
          <option value="">Todos</option>
          {#each Object.entries(equipmentLabels) as [value, label]}<option {value}>{label}</option>{/each}
        </select>
      </label>
      <label><span>Data inicial</span><input type="date" bind:value={dataInicial} /></label>
      <label><span>Data final</span><input type="date" bind:value={dataFinal} /></label>
      <label>
        <span>Ordenação</span>
        <select bind:value={ordem}>
          <option value="recente">Mais recente</option>
          <option value="antigo">Mais antigo</option>
        </select>
      </label>
    </section>

    {#if movimentacoesVisiveis.length === 0}
      <section class="state-message card panel"><p>Nenhuma movimentação encontrada com os filtros selecionados.</p></section>
    {:else}
      <div class="table-wrapper movements-table-wrapper">
        <table class="movements-table">
          <thead>
            <tr>
              <th>Data/Hora</th><th>Ação</th><th>Equipamento</th><th>Identificação</th>
              <th>Colaborador / Origem</th><th>Destino</th><th>Executado por</th>
            </tr>
          </thead>
          <tbody>
            {#each movimentacoesVisiveis as movement}
              {@const oldEquipment = movement.equipamentoAnterior ?? movement.equipamento}
              {@const newEquipment = movement.equipamentoNovo ?? movement.equipamento}
              <tr>
                <td>{formatDate(movement.data)}</td>
                <td>{actionLabels[movement.acao] ?? movement.acao}</td>
                <td>
                  {#if movement.acao === 'troca'}
                    {equipmentText(oldEquipment)} → {equipmentText(newEquipment)}
                  {:else}
                    {equipmentText(movement.equipamento)}
                  {/if}
                </td>
                <td>
                  {#if movement.acao === 'troca'}
                    {oldEquipment?.id ?? '—'} → {newEquipment?.id ?? '—'}
                  {:else}
                    {movement.equipamento?.id ?? '—'}
                  {/if}
                </td>
                <td>{originText(movement)}</td>
                <td>{movement.acao === 'desalocacao' ? '—' : personText(movement.destino)}</td>
                <td>{movement.executadoPor || '—'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</main>
