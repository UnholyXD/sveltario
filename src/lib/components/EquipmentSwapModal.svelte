<script lang="ts">
  import { onMount } from 'svelte';

  type Equipment = { tipo: string; id: string; marca: string; modelo: string; estado: string };
  type Person = { nome: string; usuario: string };
  let { equipamento, pessoa, onClose, onConfirmed }: { equipamento: Equipment; pessoa: Person; onClose: () => void; onConfirmed: () => void } = $props();

  let disponiveis = $state<Equipment[]>([]);
  let selecionado = $state('');
  let carregando = $state(true);
  let salvando = $state(false);
  let erro = $state('');
  const states: Record<string, string> = { novo: 'Novo', bom: 'Bom', marcas_de_uso: 'Marcas de uso', danificado: 'Danificado', manutencao: 'Manutenção', baixado: 'Baixado' };

  onMount(async () => {
    try {
      const response = await fetch(`/api/alocacoes/troca?tipo=${encodeURIComponent(equipamento.tipo)}&atualId=${encodeURIComponent(equipamento.id)}`);
      if (!response.ok) throw new Error();
      const data: unknown = await response.json();
      disponiveis = Array.isArray(data) ? data as Equipment[] : [];
    } catch {
      erro = 'Não foi possível carregar os equipamentos disponíveis.';
    } finally {
      carregando = false;
    }
  });

  async function confirmar() {
    if (!selecionado) return;
    salvando = true; erro = '';
    try {
      const response = await fetch('/api/alocacoes/troca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: pessoa.usuario, tipo: equipamento.tipo, atualId: equipamento.id, novoId: selecionado })
      });
      if (response.status === 401) { window.location.assign('/login'); return; }
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        erro = body?.error ?? 'Não foi possível concluir a troca.';
        return;
      }
      onConfirmed();
    } catch {
      erro = 'Não foi possível concluir a troca. Tente novamente.';
    } finally {
      salvando = false;
    }
  }
</script>

<div class="modal allocation-modal" role="presentation" onclick={(event) => event.target === event.currentTarget && !salvando && onClose()}>
  <div class="modal__content allocation-dialog card panel" role="dialog" aria-modal="true" aria-labelledby="swap-title">
    <div class="allocation-heading"><h2 id="swap-title">Trocar equipamento</h2><button class="button--secondary allocation-close" type="button" aria-label="Fechar" onclick={onClose} disabled={salvando}>×</button></div>
    <p class="allocation-selected">Equipamento atual: <strong>{equipamento.id}</strong> — {equipamento.marca || 'Marca não informada'} {equipamento.modelo || ''}</p>
    {#if carregando}<p class="allocation-message">Carregando equipamentos disponíveis...</p>
    {:else if !disponiveis.length}<p class="allocation-message">Nenhum equipamento disponível deste tipo.</p>
    {:else}<div class="table-wrapper allocation-table-wrapper"><table class="allocation-table"><thead><tr><th>Seleção</th><th>Identificação</th><th>Marca</th><th>Modelo</th><th>Estado</th></tr></thead><tbody>{#each disponiveis as item}<tr><td><input type="radio" name="swap-equipment" aria-label={`Selecionar ${item.id}`} value={item.id} bind:group={selecionado} disabled={salvando} /></td><td>{item.id}</td><td>{item.marca || '—'}</td><td>{item.modelo || '—'}</td><td>{states[item.estado] ?? (item.estado || '—')}</td></tr>{/each}</tbody></table></div>{/if}
    {#if erro}<p class="form-error" role="alert">{erro}</p>{/if}
    <footer class="form-actions allocation-actions"><button class="button--secondary" type="button" onclick={onClose} disabled={salvando}>Cancelar</button><button class="button--primary" type="button" onclick={confirmar} disabled={!selecionado || salvando}>{salvando ? 'Trocando...' : 'Confirmar troca'}</button></footer>
  </div>
</div>
