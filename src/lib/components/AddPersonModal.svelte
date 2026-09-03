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

  let { onClose, onSaved }: {
    onClose: () => void;
    onSaved: (pessoa: Person) => void;
  } = $props();

  let form = $state({
    nome: '',
    usuario: '',
    idEmpresa: '',
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

  function validar(): string {
    if (!form.nome.trim()) return 'Nome é obrigatório.';
    if (!form.usuario.trim()) return 'Usuário é obrigatório.';
    if (!form.idEmpresa.trim()) return 'ID da empresa é obrigatório.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Informe um e-mail válido.';
    }
    return '';
  }

  async function salvar() {
    erro = validar();
    if (erro) return;

    salvando = true;
    try {
      const response = await fetch('/api/pessoas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome.trim(),
          usuario: form.usuario.trim(),
          idEmpresa: form.idEmpresa.trim(),
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

      if (response.status === 409) {
        erro = 'Esse usuário já está cadastrado.';
        return;
      }

      if (!response.ok) {
        erro = 'Não foi possível cadastrar o colaborador.';
        return;
      }

      onSaved(await response.json());
    } catch {
      erro = 'Não foi possível cadastrar o colaborador. Tente novamente.';
    } finally {
      salvando = false;
    }
  }
</script>

<div class="modal edit-person-modal" role="presentation" onclick={(event) => event.target === event.currentTarget && !salvando && onClose()}>
  <div class="modal__content edit-person-dialog card panel" role="dialog" aria-modal="true" aria-labelledby="add-person-title">
    <div class="edit-person-heading">
      <h2 id="add-person-title">Adicionar colaborador</h2>
      <button class="button--secondary edit-person-close" type="button" aria-label="Fechar cadastro" onclick={onClose} disabled={salvando}>×</button>
    </div>

    <form onsubmit={(event) => { event.preventDefault(); salvar(); }}>
      <div class="form-grid">
        <div class="form-group">
          <label for="add-nome">Nome</label>
          <input id="add-nome" type="text" autocomplete="name" bind:value={form.nome} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="add-usuario">ID DinaBox / usuário</label>
          <input id="add-usuario" type="text" autocomplete="username" bind:value={form.usuario} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="add-empresa">ID Empresa</label>
          <input id="add-empresa" type="text" bind:value={form.idEmpresa} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="add-email">E-mail</label>
          <input id="add-email" type="email" autocomplete="email" bind:value={form.email} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="add-telefone">Telefone</label>
          <input id="add-telefone" type="tel" autocomplete="tel" bind:value={form.telefone} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="add-cracha">Crachá</label>
          <input id="add-cracha" type="text" bind:value={form.cracha} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="add-setor">Setor</label>
          <input id="add-setor" type="text" bind:value={form.setor} disabled={salvando} />
        </div>
        <div class="form-group">
          <label for="add-observacoes">Observação</label>
          <textarea id="add-observacoes" bind:value={form.observacoes} disabled={salvando}></textarea>
        </div>
      </div>

      <div class="edit-person-toggles">
        <label class="toggle" for="add-acesso">
          <input id="add-acesso" type="checkbox" bind:checked={form.acessoPortaExterna} disabled={salvando} />
          <span class="toggle__track" aria-hidden="true"></span>
          Acesso à porta externa
        </label>
        <label class="toggle" for="add-ativo">
          <input id="add-ativo" type="checkbox" bind:checked={form.ativo} disabled={salvando} />
          <span class="toggle__track" aria-hidden="true"></span>
          Usuário ativo
        </label>
      </div>

      {#if erro}
        <p class="form-error" role="alert">{erro}</p>
      {/if}

      <footer class="form-actions edit-person-actions">
        <button class="button--secondary" type="button" onclick={onClose} disabled={salvando}>Cancelar</button>
        <button class="button--primary" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Adicionar'}</button>
      </footer>
    </form>
  </div>
</div>
