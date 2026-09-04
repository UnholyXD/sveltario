<script lang="ts">
  export type EquipmentModalProps = {
    tipo: string;
    mode?: 'create' | 'edit';
    equipment?: Record<string, unknown>;
    onClose: () => void;
    onSaved: (item: Record<string, unknown>) => void;
  };

  let { tipo, mode = 'create', equipment = {}, onClose, onSaved }: EquipmentModalProps = $props();
  const states = ['novo', 'bom', 'marcas_de_uso', 'danificado', 'manutencao', 'baixado'];
  const fields: Record<string, Array<[string, string]>> = {
    computador: [['patrimonio', 'Patrimônio'], ['marca', 'Marca'], ['modelo', 'Modelo'], ['serviceTag', 'Service Tag'], ['hostname', 'Hostname'], ['processador', 'Processador'], ['memoriaRamGb', 'Memória RAM (GB)']],
    monitor: [['patrimonio', 'Patrimônio'], ['marca', 'Marca'], ['modelo', 'Modelo'], ['numeroSerie', 'Número de série']],
    mouse: [['marca', 'Marca'], ['modelo', 'Modelo'], ['modeloTecnico', 'Modelo técnico'], ['numeroSerie', 'Número de série'], ['partNumber', 'Part number'], ['pid', 'PID'], ['conexao', 'Conexão']],
    teclado: [['marca', 'Marca'], ['modelo', 'Modelo'], ['modeloTecnico', 'Modelo técnico'], ['numeroSerie', 'Número de série'], ['partNumber', 'Part number'], ['pid', 'PID'], ['conexao', 'Conexão'], ['layout', 'Layout']],
    fone: [['marca', 'Marca'], ['modelo', 'Modelo'], ['numeroSerie', 'Número de série'], ['tipo', 'Tipo'], ['conexao', 'Conexão']],
    outros: [['categoria', 'Categoria'], ['marca', 'Marca'], ['modelo', 'Modelo'], ['numeroSerie', 'Número de série'], ['patrimonio', 'Patrimônio']]
  };
  const defaults: Record<string, Record<string, unknown>> = {
    computador: { patrimonio: '', marca: '', modelo: '', serviceTag: '', hostname: '', processador: '', memoriaRamGb: '', estado: 'bom', observacoes: '', armazenamento: [] },
    monitor: { patrimonio: '', marca: '', modelo: '', numeroSerie: '', estado: 'bom', observacoes: '' },
    mouse: { marca: '', modelo: '', modeloTecnico: '', numeroSerie: '', partNumber: '', pid: '', conexao: '', estado: 'bom', observacoes: '' },
    teclado: { marca: '', modelo: '', modeloTecnico: '', numeroSerie: '', partNumber: '', pid: '', conexao: '', layout: '', estado: 'bom', observacoes: '' },
    fone: { marca: '', modelo: '', numeroSerie: '', tipo: 'headset', conexao: '', microfone: false, estado: 'bom', observacoes: '' },
    outros: { categoria: '', marca: '', modelo: '', numeroSerie: '', patrimonio: '', estado: 'bom', observacoes: '' }
  };

  function createInitialForm(equipmentType: string, selectedEquipment: Record<string, unknown>) {
    return { ...(defaults[equipmentType] ?? {}), ...selectedEquipment };
  }

  let form = $state<Record<string, any>>({});
  $effect(() => {
    form = createInitialForm(tipo, equipment);
  });
  let erro = $state('');
  let salvando = $state(false);
  const identifier = $derived(tipo === 'computador' || tipo === 'monitor' ? 'patrimonio' : 'id');
  const originalIdentifier = $derived(String(equipment[identifier] ?? ''));
  const title = $derived(`${mode === 'edit' ? 'Editar' : 'Cadastrar'} ${tipo === 'fone' ? 'fone' : tipo === 'outros' ? 'outro item' : tipo}`);
  function update(key: string, value: string | boolean) { form[key] = value; }
  function addStorage() {
    form.armazenamento = [...(Array.isArray(form.armazenamento) ? form.armazenamento : []), { tipo: '', modelo: '', capacidadeGb: '' }];
  }
  function removeStorage(index: number) {
    form.armazenamento = (Array.isArray(form.armazenamento) ? form.armazenamento : []).filter((_: unknown, itemIndex: number) => itemIndex !== index);
  }
  function updateStorage(index: number, key: string, value: string) {
    form.armazenamento = (form.armazenamento as Array<Record<string, unknown>>).map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item);
  }
  async function salvar() {
    if (!form.estado || (tipo === 'outros' ? !String(form.categoria ?? '').trim() : !String(form.marca ?? '').trim() || !String(form.modelo ?? '').trim())) { erro = 'Preencha os campos obrigatórios.'; return; }
    salvando = true;
    try {
      const payload = { ...form, ...(mode === 'edit' ? { identificadorOriginal: originalIdentifier } : {}) };
      const response = await fetch(`/api/equipamentos/${tipo}`, { method: mode === 'edit' ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.status === 401) { window.location.assign('/login'); return; }
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: unknown } | null;
        erro = typeof result?.error === 'string'
          ? result.error
          : response.status === 409
            ? 'Já existe outro equipamento com este patrimônio.'
            : 'Não foi possível salvar o equipamento.';
        return;
      }
      onSaved(await response.json());
    } catch { erro = 'Não foi possível salvar o equipamento. Tente novamente.'; } finally { salvando = false; }
  }
</script>

<div class="modal edit-person-modal" role="presentation" onclick={(event) => event.target === event.currentTarget && !salvando && onClose()}>
  <div class="modal__content edit-person-dialog card panel" role="dialog" aria-modal="true">
    <div class="edit-person-heading"><h2>{title}</h2><button class="button--secondary edit-person-close" type="button" onclick={onClose} disabled={salvando}>×</button></div>
    <form onsubmit={(event) => { event.preventDefault(); salvar(); }}>
      <div class="form-grid">
        {#if mode === 'edit' && tipo !== 'computador' && tipo !== 'monitor'}<div class="form-group"><label for="equipment-id">Identificador</label><input id="equipment-id" value={String(form.id ?? '')} readonly /></div>{/if}
        {#each fields[tipo] ?? [] as [key, label]}
          <div class="form-group"><label for={`equipment-${key}`}>{label}</label><input id={`equipment-${key}`} type={key === 'memoriaRamGb' ? 'number' : 'text'} value={String(form[key] ?? '')} oninput={(event) => update(key, (event.currentTarget as HTMLInputElement).value)} disabled={salvando || (mode === 'edit' && key === 'id')} /></div>
        {/each}
        {#if tipo === 'fone'}<label class="toggle" for="equipment-microfone"><input id="equipment-microfone" type="checkbox" checked={Boolean(form.microfone)} onchange={(event) => update('microfone', (event.currentTarget as HTMLInputElement).checked)} />Microfone</label>{/if}
        <div class="form-group"><label for="equipment-estado">Estado</label><select id="equipment-estado" value={form.estado ?? 'bom'} onchange={(event) => update('estado', (event.currentTarget as HTMLSelectElement).value)} disabled={salvando}>{#each states as state}<option value={state}>{state}</option>{/each}</select></div>
        <div class="form-group"><label for="equipment-observacoes">Observações</label><textarea id="equipment-observacoes" oninput={(event) => update('observacoes', (event.currentTarget as HTMLTextAreaElement).value)} disabled={salvando}>{String(form.observacoes ?? '')}</textarea></div>
        {#if tipo === 'computador'}
          <fieldset class="storage-editor"><legend>Armazenamento</legend>
            {#each (form.armazenamento ?? []) as item, index}
              <div class="form-grid storage-row">
                <input aria-label="Tipo" placeholder="Tipo" value={String(item.tipo ?? '')} oninput={(event) => updateStorage(index, 'tipo', (event.currentTarget as HTMLInputElement).value)} disabled={salvando} />
                <input aria-label="Modelo" placeholder="Modelo" value={String(item.modelo ?? '')} oninput={(event) => updateStorage(index, 'modelo', (event.currentTarget as HTMLInputElement).value)} disabled={salvando} />
                <input aria-label="Capacidade (GB)" type="number" placeholder="GB" value={String(item.capacidadeGb ?? '')} oninput={(event) => updateStorage(index, 'capacidadeGb', (event.currentTarget as HTMLInputElement).value)} disabled={salvando} />
                <button class="button--secondary" type="button" onclick={() => removeStorage(index)} disabled={salvando}>Remover</button>
              </div>
            {/each}
            <button class="button--secondary" type="button" onclick={addStorage} disabled={salvando}>Adicionar unidade</button>
          </fieldset>
        {/if}
      </div>
      {#if erro}<p class="form-error" role="alert">{erro}</p>{/if}
      <footer class="form-actions edit-person-actions"><button class="button--secondary" type="button" onclick={onClose}>Cancelar</button><button class="button--primary" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : mode === 'edit' ? 'Salvar alterações' : 'Cadastrar'}</button></footer>
    </form>
  </div>
</div>
