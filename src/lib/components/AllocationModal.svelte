<script lang="ts">
  type Person = { nome: string; usuario: string };
  type Equipment = { tipo: string; id?: string; patrimonio?: string; marca?: string; modelo?: string; estado?: string; alocadoPara?: unknown };
  const types = [
    ['computador', 'Computador'], ['monitor', 'Monitor'], ['fone', 'Fone'],
    ['mouse', 'Mouse'], ['teclado', 'Teclado'], ['outros', 'Outros']
  ];
  const states: Record<string, string> = { novo: 'Novo', bom: 'Bom', marcas_de_uso: 'Marcas de uso', danificado: 'Danificado', manutencao: 'Manutenção', baixado: 'Baixado' };
  let { initialPerson = null, onClose, onSaved }: { initialPerson?: Person | null; onClose: () => void; onSaved?: () => void } = $props();
  let query = $state('');
  let resultados = $state<Person[]>([]);
  let pessoa = $state<Person | null>(null);
  let tipo = $state('');
  let equipamentos = $state<Equipment[]>([]);
  let selecionados = $state<Array<{ tipo: string; id: string; marca?: string; modelo?: string }>>([]);
  let buscando = $state(false);
  let carregando = $state(false);
  let salvando = $state(false);
  let erro = $state('');

  $effect(() => {
    pessoa = initialPerson;
  });

  async function buscar() {
    if (!query.trim()) { resultados = []; erro = 'Digite um nome ou usuário para buscar.'; return; }
    buscando = true; erro = '';
    try {
      const response = await fetch('/api/pessoas');
      if (!response.ok) throw new Error();
      const data: unknown = await response.json();
      resultados = Array.isArray(data) ? data.filter((item): item is Person => typeof item === 'object' && item !== null && typeof (item as Record<string, unknown>).nome === 'string' && typeof (item as Record<string, unknown>).usuario === 'string').filter((item) => `${item.nome} ${item.usuario}`.toLowerCase().includes(query.trim().toLowerCase())) : [];
      if (!resultados.length) erro = 'Nenhum colaborador encontrado.';
    } catch { erro = 'Não foi possível buscar colaboradores.'; } finally { buscando = false; }
  }

  async function carregarEquipamentos() {
    equipamentos = []; erro = '';
    if (!tipo) return;
    carregando = true;
    try {
      const response = await fetch(`/api/equipamentos/${tipo}`);
      if (!response.ok) throw new Error();
      const data: unknown = await response.json();
      equipamentos = Array.isArray(data)
        ? data.filter((item): item is Equipment => {
            if (typeof item !== 'object' || item === null) return false;
            const equipamento = item as Record<string, unknown>;
            const identificacao = tipo === 'computador' || tipo === 'monitor' ? equipamento.patrimonio : equipamento.id;
            return typeof identificacao === 'string' && identificacao.length > 0 && !equipamento.alocadoPara;
          })
        : [];
    } catch { erro = 'Não foi possível carregar os equipamentos disponíveis.'; } finally { carregando = false; }
  }

  function selecionar(p: Person) { pessoa = p; resultados = []; selecionados = []; erro = ''; }
  function identificacao(equipamento: Equipment): string {
    return tipo === 'computador' || tipo === 'monitor' ? equipamento.patrimonio ?? '' : equipamento.id ?? '';
  }

  function alternar(equipamento: Equipment) {
    const id = identificacao(equipamento);
    const index = selecionados.findIndex((item) => item.tipo === tipo && item.id === id);
    selecionados = index >= 0
      ? selecionados.filter((_, itemIndex) => itemIndex !== index)
      : [...selecionados, { tipo, id, marca: equipamento.marca, modelo: equipamento.modelo }];
  }

  function removerSelecionado(index: number) {
    selecionados = selecionados.filter((_, itemIndex) => itemIndex !== index);
  }

  async function alocar() {
    if (!pessoa || !selecionados.length) return;
    salvando = true; erro = '';
    try {
      const response = await fetch('/api/alocacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: pessoa.usuario, equipamentos: selecionados.map(({ tipo, id }) => ({ tipo, id })) }) });
      if (response.status === 401) { window.location.assign('/login'); return; }
      if (!response.ok) throw new Error();
      onSaved?.(); onClose();
    } catch { erro = 'Não foi possível concluir a alocação. Verifique a disponibilidade e tente novamente.'; } finally { salvando = false; }
  }
</script>

<div class="modal allocation-modal" role="presentation" onclick={(event) => event.target === event.currentTarget && !salvando && onClose()}>
  <div class="modal__content allocation-dialog card panel" role="dialog" aria-modal="true" aria-labelledby="allocation-title">
    <div class="allocation-heading"><h2 id="allocation-title">Alocar equipamentos</h2><button class="button--secondary allocation-close" type="button" aria-label="Fechar" onclick={onClose} disabled={salvando}>×</button></div>
    {#if pessoa}
      <p class="allocation-selected">Alocando para: <strong>{pessoa.nome}</strong> — {pessoa.usuario}</p>
    {:else}
      <div class="allocation-search form-group"><label for="allocation-person">Colaborador</label><div class="allocation-search-row"><input id="allocation-person" type="search" placeholder="Digite o nome ou usuário" bind:value={query} disabled={buscando || salvando} onkeydown={(event) => event.key === 'Enter' && buscar()} /><button class="button--secondary" type="button" onclick={buscar} disabled={buscando || salvando}>{buscando ? 'Buscando...' : 'Buscar'}</button></div></div>
      {#if resultados.length}<div class="allocation-results" aria-label="Resultados da busca">{#each resultados as resultado}<button type="button" onclick={() => selecionar(resultado)}>{resultado.nome} — {resultado.usuario}</button>{/each}</div>{/if}
    {/if}
    {#if pessoa}
      <div class="form-group allocation-type"><label for="allocation-type">Equipamento</label><select id="allocation-type" bind:value={tipo} onchange={carregarEquipamentos} disabled={carregando || salvando}><option value="">Selecione o tipo</option>{#each types as item}<option value={item[0]}>{item[1]}</option>{/each}</select></div>
      {#if carregando}<p class="allocation-message">Carregando equipamentos disponíveis...</p>{:else if tipo && !equipamentos.length}<p class="allocation-message">Nenhum equipamento disponível deste tipo.</p>{:else if equipamentos.length}<div class="table-wrapper allocation-table-wrapper"><table><thead><tr><th>Selecionar</th><th>Tipo</th><th>Identificação</th><th>Marca</th><th>Modelo</th><th>Estado</th></tr></thead><tbody>{#each equipamentos as equipamento}<tr><td><input type="checkbox" aria-label={`Selecionar ${identificacao(equipamento)}`} checked={selecionados.some((item) => item.tipo === tipo && item.id === identificacao(equipamento))} onchange={() => alternar(equipamento)} disabled={salvando} /></td><td>{types.find((item) => item[0] === equipamento.tipo)?.[1]}</td><td>{identificacao(equipamento)}</td><td>{equipamento.marca || '—'}</td><td>{equipamento.modelo || '—'}</td><td>{states[equipamento.estado ?? ''] ?? equipamento.estado ?? '—'}</td></tr>{/each}</tbody></table></div>{/if}
      {#if selecionados.length}<section class="allocation-selected-list" aria-labelledby="selected-title"><h3 id="selected-title">Equipamentos selecionados ({selecionados.length})</h3>{#each selecionados as selecionado, index}<div class="allocation-selected-item"><span><strong>{types.find((item) => item[0] === selecionado.tipo)?.[1]}</strong> {selecionado.id} — {selecionado.marca || 'Marca não informada'} {selecionado.modelo || ''}</span><button class="button--secondary" type="button" onclick={() => removerSelecionado(index)} disabled={salvando}>Remover</button></div>{/each}</section>{/if}
    {/if}
    {#if erro}<p class="form-error" role="alert">{erro}</p>{/if}
    <footer class="form-actions allocation-actions"><button class="button--secondary" type="button" onclick={onClose} disabled={salvando}>Cancelar</button><button class="button--primary" type="button" onclick={alocar} disabled={!pessoa || !selecionados.length || salvando}>{salvando ? 'Alocando...' : 'Alocar'}</button></footer>
  </div>
</div>
