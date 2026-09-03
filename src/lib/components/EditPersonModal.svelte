<script lang="ts">
  type Person = {
    nome: string;
    usuario: string;
    email?: string | null;
    telefone?: string | null;
    idEmpresa?: string | null;
    cracha?: string | null;
    setor?: string | null;
    acessoPortaExterna?: boolean;
    ativo?: boolean;
    observacoes?: string | null;
  };

  let { pessoa, onClose, onSaved }: {
    pessoa: Person;
    onClose: () => void;
    onSaved: (pessoa: Person) => void;
  } = $props();

  let form = $state({
    nome: '',
    email: '',
    telefone: '',
    cracha: '',
    setor: '',
    acessoPortaExterna: false,
    ativo: true,
    observacoes: ''
  });
  let erro = $state('');
  let salvando = $state(false);

  $effect(() => {
    form = {
      nome: pessoa.nome,
      email: pessoa.email ?? '',
      telefone: pessoa.telefone ?? '',
      cracha: pessoa.cracha ?? '',
      setor: pessoa.setor ?? '',
      acessoPortaExterna: pessoa.acessoPortaExterna ?? false,
      ativo: pessoa.ativo ?? true,
      observacoes: pessoa.observacoes ?? ''
    };
  });

  function validar(): string {
    if (!form.nome.trim()) {
      return 'Nome é obrigatório.';
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Informe um e-mail válido.';
    }

    return '';
  }

  async function salvar() {
    erro = validar();
    if (erro) {
      return;
    }

    salvando = true;
    try {
      const response = await fetch(`/api/pessoas/${encodeURIComponent(pessoa.usuario)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim() || null,
          telefone: form.telefone.trim() || null,
          cracha: form.cracha.trim() || null,
          setor: form.setor.trim() || null,
          acessoPortaExterna: form.acessoPortaExterna,
          ativo: form.ativo,
          observacoes: form.observacoes.trim()
        })
      });

      if (response.status === 401) {
        window.location.assign('/login');
        return;
      }

      if (!response.ok) {
        erro = 'Não foi possível salvar as alterações.';
        return;
      }

      const atualizada = await response.json();
      onSaved(atualizada);
    } catch {
      erro = 'Não foi possível salvar as alterações. Tente novamente.';
    } finally {
      salvando = false;
    }
  }
</script>

<div class="modal edit-person-modal" role="presentation" onclick={(event) => event.target === event.currentTarget && !salvando && onClose()}>
  <div class="modal__content edit-person-dialog card panel" role="dialog" aria-modal="true" aria-labelledby="edit-person-title">
    <div class="edit-person-heading">
      <h2 id="edit-person-title">Editar colaborador</h2>
      <button class="button--secondary edit-person-close" type="button" aria-label="Fechar edição" onclick={onClose} disabled={salvando}>×</button>
    </div>

    <form onsubmit={(event) => { event.preventDefault(); salvar(); }}>
      <div class="form-grid">
        <div class="form-group">
          <label for="edit-nome">Nome</label>
          <input id="edit-nome" type="text" bind:value={form.nome} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="edit-usuario">ID DinaBox / usuário</label>
          <input id="edit-usuario" type="text" value={pessoa.usuario} readonly />
        </div>
        <div class="form-group">
          <label for="edit-email">E-mail</label>
          <input id="edit-email" type="email" autocomplete="email" bind:value={form.email} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="edit-telefone">Telefone</label>
          <input id="edit-telefone" type="tel" autocomplete="tel" bind:value={form.telefone} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="edit-empresa">ID Empresa</label>
          <input id="edit-empresa" type="text" value={pessoa.idEmpresa ?? ''} readonly />
        </div>
        <div class="form-group">
          <label for="edit-cracha">Crachá</label>
          <input id="edit-cracha" type="text" bind:value={form.cracha} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="edit-setor">Setor</label>
          <input id="edit-setor" type="text" bind:value={form.setor} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="edit-observacoes">Observação</label>
          <textarea id="edit-observacoes" bind:value={form.observacoes} disabled={salvando}></textarea>
        </div>
      </div>

      <div class="edit-person-toggles">
        <label class="toggle" for="edit-acesso">
          <input id="edit-acesso" type="checkbox" bind:checked={form.acessoPortaExterna} disabled={salvando} />
          <span class="toggle__track" aria-hidden="true"></span>
          Acesso à porta externa
        </label>
        <label class="toggle" for="edit-ativo">
          <input id="edit-ativo" type="checkbox" bind:checked={form.ativo} disabled={salvando} />
          <span class="toggle__track" aria-hidden="true"></span>
          Usuário ativo
        </label>
      </div>

      {#if erro}
        <p class="form-error" role="alert">{erro}</p>
      {/if}

      <footer class="form-actions edit-person-actions">
        <button class="button--secondary" type="button" onclick={onClose} disabled={salvando}>Cancelar</button>
        <button class="button--primary" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
      </footer>
    </form>
  </div>
</div>
