<script lang="ts">
  type Equipment = { tipo: string; id: string; marca: string; modelo: string };
  type Person = { nome: string; usuario: string };

  let { equipamento, pessoa, onClose, onConfirmed }: {
    equipamento: Equipment;
    pessoa: Person;
    onClose: () => void;
    onConfirmed: () => void;
  } = $props();

  let salvando = $state(false);
  let erro = $state('');

  const labels: Record<string, string> = {
    computador: 'Computador',
    monitor: 'Monitor',
    mouse: 'Mouse',
    teclado: 'Teclado',
    fone: 'Fone',
    outros: 'Outros'
  };

  async function confirmar() {
    salvando = true;
    erro = '';
    try {
      const response = await fetch(`/api/alocacoes/${encodeURIComponent(pessoa.usuario)}/${encodeURIComponent(equipamento.tipo)}/${encodeURIComponent(equipamento.id)}`, { method: 'DELETE' });
      if (response.status === 401) {
        window.location.assign('/login');
        return;
      }
      if (response.status === 404) {
        erro = 'Este equipamento não está mais alocado para este colaborador.';
        return;
      }
      if (!response.ok) {
        erro = 'Não foi possível desalocar o equipamento.';
        return;
      }
      onConfirmed();
    } catch {
      erro = 'Não foi possível desalocar o equipamento. Tente novamente.';
    } finally {
      salvando = false;
    }
  }
</script>

<div class="modal deallocate-modal" role="presentation" onclick={(event) => event.target === event.currentTarget && !salvando && onClose()}>
  <div class="modal__content deallocate-dialog card panel" role="dialog" aria-modal="true" aria-labelledby="deallocate-title">
    <div class="allocation-heading">
      <h2 id="deallocate-title">Desalocar equipamento?</h2>
      <button class="button--secondary allocation-close" type="button" aria-label="Fechar" onclick={onClose} disabled={salvando}>×</button>
    </div>
    <p class="deallocate-summary"><strong>{labels[equipamento.tipo] ?? equipamento.tipo} {equipamento.id}</strong> — {equipamento.marca || 'Marca não informada'} {equipamento.modelo || ''}</p>
    <p class="deallocate-summary">Alocado para <strong>{pessoa.nome}</strong> — {pessoa.usuario}</p>
    {#if erro}
      <p class="form-error" role="alert">{erro}</p>
    {/if}
    <footer class="form-actions allocation-actions">
      <button class="button--secondary" type="button" onclick={onClose} disabled={salvando}>Cancelar</button>
      <button class="button--danger" type="button" onclick={confirmar} disabled={salvando}>{salvando ? 'Desalocando...' : 'Desalocar'}</button>
    </footer>
  </div>
</div>
