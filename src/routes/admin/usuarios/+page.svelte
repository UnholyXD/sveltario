<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';

  type Usuario = { usuario: string; ativo: boolean };
  let usuarios = $state<Usuario[]>([]);
  let carregando = $state(true);
  let erro = $state('');
  let modal = $state<'novo' | 'senha' | null>(null);
  let alvo = $state<Usuario | null>(null);
  let nome = $state('');
  let senha = $state('');
  let confirmarSenha = $state('');
  let novoAtivo = $state(true);
  let salvando = $state(false);

  async function carregar() {
    const response = await fetch('/api/admin/usuarios');
    if (!response.ok) throw new Error('Não foi possível carregar os usuários.');
    usuarios = await response.json();
  }

  onMount(async () => {
    try { await carregar(); } catch (error) { erro = error instanceof Error ? error.message : 'Erro ao carregar usuários.'; }
    finally { carregando = false; }
  });

  function fecharModal() { modal = null; alvo = null; nome = ''; senha = ''; confirmarSenha = ''; novoAtivo = true; }

  async function salvar() {
    salvando = true; erro = '';
    try {
      const isNew = modal === 'novo';
      const response = await fetch(isNew ? '/api/admin/usuarios' : `/api/admin/usuarios/${encodeURIComponent(alvo!.usuario)}`, {
        method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? { usuario: nome.trim(), senha, confirmarSenha, ativo: novoAtivo } : { senha, confirmarSenha })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Não foi possível salvar.');
      await carregar(); fecharModal();
    } catch (error) { erro = error instanceof Error ? error.message : 'Não foi possível salvar.'; }
    finally { salvando = false; }
  }

  async function alternar(user: Usuario) {
    erro = '';
    const response = await fetch(`/api/admin/usuarios/${encodeURIComponent(user.usuario)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ativo: !user.ativo })
    });
    if (!response.ok) { const body = await response.json(); erro = body.error ?? 'Não foi possível alterar o estado.'; return; }
    await carregar();
  }

  async function remover(user: Usuario) {
    if (!confirm(`Remover o usuário ${user.usuario}?`)) return;
    const response = await fetch(`/api/admin/usuarios/${encodeURIComponent(user.usuario)}`, { method: 'DELETE' });
    if (!response.ok) { const body = await response.json(); erro = body.error ?? 'Não foi possível remover.'; return; }
    await carregar();
  }
</script>

<svelte:head><title>Usuários | SVeltário</title></svelte:head>
<Navbar active="/admin/usuarios" />
<main class="admin-users-page">
  <header class="admin-users-header">
    <div><p class="eyebrow">Administração</p><h1>Usuários</h1></div>
    <button class="button--primary" type="button" onclick={() => { modal = 'novo'; erro = ''; }}>Novo usuário</button>
  </header>
  {#if erro}<p class="admin-error" role="alert">{erro}</p>{/if}
  {#if carregando}<p>Carregando usuários...</p>
  {:else if usuarios.length === 0}<p>Nenhum usuário cadastrado.</p>
  {:else}
    <table class="admin-users-table">
      <thead><tr><th>Usuário</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>{#each usuarios as user}
        <tr class:admin-user-inactive={!user.ativo}>
          <td>{user.usuario}</td><td>{user.ativo ? 'Ativo' : 'Inativo'}</td>
          <td><div class="admin-users-actions">
            <button class="button--secondary" type="button" onclick={() => { alvo = user; modal = 'senha'; erro = ''; }}>Alterar senha</button>
            <button class="button--secondary" type="button" onclick={() => alternar(user)}>{user.ativo ? 'Desativar' : 'Ativar'}</button>
            <button class="button--secondary" type="button" onclick={() => remover(user)}>Remover</button>
          </div></td>
        </tr>
      {/each}</tbody>
    </table>
  {/if}
</main>

{#if modal}
  <div class="admin-modal-backdrop" role="presentation" onclick={(event) => { if (event.target === event.currentTarget) fecharModal(); }}>
    <section class="admin-modal" role="dialog" aria-modal="true">
      <h2>{modal === 'novo' ? 'Novo usuário' : `Alterar senha: ${alvo?.usuario}`}</h2>
      {#if modal === 'novo'}
        <label class="form-group">Usuário<input bind:value={nome} autocomplete="username" /></label>
      {/if}
      <label class="form-group">Senha<input type="password" bind:value={senha} autocomplete="new-password" /></label>
      <label class="form-group">Confirmar senha<input type="password" bind:value={confirmarSenha} autocomplete="new-password" /></label>
      {#if modal === 'novo'}<label class="toggle"><input type="checkbox" bind:checked={novoAtivo} />Ativo</label>{/if}
      {#if erro}<p class="admin-error" role="alert">{erro}</p>{/if}
      <div class="admin-modal-actions"><button class="button--secondary" type="button" onclick={fecharModal}>Cancelar</button><button class="button--primary" type="button" onclick={salvar} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button></div>
    </section>
  </div>
{/if}
