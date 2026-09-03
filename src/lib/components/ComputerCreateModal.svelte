<script lang="ts">
  const VALID_STATES = ['novo', 'bom', 'marcas_de_uso', 'danificado', 'manutencao', 'baixado'];
  let { onClose, onSaved }: { onClose: () => void; onSaved: (item: Record<string, unknown>) => void } = $props();
  let form = $state({ patrimonio: '', marca: '', modelo: '', serviceTag: '', hostname: '', processador: '', memoriaRamGb: '', estado: 'bom', observacoes: '' });
  let armazenamento = $state([{ tipo: '', modelo: '', capacidadeGb: '' }]);
  let erro = $state(''); let salvando = $state(false);
  function validar() { if (!form.patrimonio.trim() || !form.marca.trim() || !form.modelo.trim() || !form.estado) return 'Preencha os campos obrigatórios.'; return ''; }
  async function salvar() {
    erro = validar(); if (erro) return; salvando = true;
    try {
      const response = await fetch('/api/equipamentos/computador', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, memoriaRamGb: Number(form.memoriaRamGb) || 0, armazenamento: armazenamento.filter((item) => item.tipo || item.modelo || item.capacidadeGb).map((item) => ({ tipo: item.tipo, modelo: item.modelo, capacidadeGb: Number(item.capacidadeGb) || 0 })) }) });
      if (response.status === 401) { window.location.assign('/login'); return; }
      if (!response.ok) { erro = response.status === 409 ? 'Patrimônio já cadastrado.' : 'Não foi possível cadastrar o computador.'; return; }
      onSaved(await response.json());
    } catch { erro = 'Não foi possível cadastrar o computador. Tente novamente.'; } finally { salvando = false; }
  }
</script>
<div class="modal edit-person-modal" role="presentation" onclick={(event) => event.target === event.currentTarget && !salvando && onClose()}>
  <div class="modal__content edit-person-dialog card panel" role="dialog" aria-modal="true" aria-labelledby="computer-title">
    <div class="edit-person-heading"><h2 id="computer-title">Adicionar computador</h2><button class="button--secondary edit-person-close" type="button" onclick={onClose} disabled={salvando}>×</button></div>
    <form onsubmit={(event) => { event.preventDefault(); salvar(); }}><div class="form-grid">
      {#each [['patrimonio','Patrimônio'],['marca','Marca'],['modelo','Modelo'],['serviceTag','Service Tag'],['hostname','Hostname'],['processador','Processador'],['memoriaRamGb','Memória RAM (GB)']] as field}
        <div class="form-group"><label for={`computer-${field[0]}`}>{field[1]}</label><input id={`computer-${field[0]}`} type={field[0] === 'memoriaRamGb' ? 'number' : 'text'} bind:value={form[field[0] as keyof typeof form]} disabled={salvando} /></div>
      {/each}
      <div class="form-group"><label for="computer-estado">Estado</label><select id="computer-estado" bind:value={form.estado} disabled={salvando}>{#each VALID_STATES as state}<option value={state}>{state}</option>{/each}</select></div>
      <div class="form-group"><label for="computer-observacoes">Observações</label><textarea id="computer-observacoes" bind:value={form.observacoes} disabled={salvando}></textarea></div>
    </div><fieldset class="storage-editor"><legend>Armazenamento</legend>{#each armazenamento as item, index}<div class="form-grid storage-row"><input aria-label="Tipo" placeholder="Tipo" bind:value={item.tipo} disabled={salvando} /><input aria-label="Modelo" placeholder="Modelo" bind:value={item.modelo} disabled={salvando} /><input aria-label="Capacidade (GB)" type="number" placeholder="GB" bind:value={item.capacidadeGb} disabled={salvando} /><button class="button--secondary" type="button" onclick={() => armazenamento.splice(index, 1)} disabled={salvando || armazenamento.length === 1}>Remover</button></div>{/each}<button class="button--secondary" type="button" onclick={() => armazenamento.push({ tipo: '', modelo: '', capacidadeGb: '' })} disabled={salvando}>Adicionar unidade</button></fieldset>
    {#if erro}<p class="form-error" role="alert">{erro}</p>{/if}<footer class="form-actions edit-person-actions"><button class="button--secondary" type="button" onclick={onClose}>Cancelar</button><button class="button--primary" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button></footer></form>
  </div>
</div>
