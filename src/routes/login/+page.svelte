<script lang="ts">
  import inventoryBox from '$lib/assets/inventory-box.svg';

  let usuario = $state('');
  let senha = $state('');
  let erro = $state('');
  let carregando = $state(false);

  async function entrar() {
    erro = '';

    if (!usuario.trim() || !senha) {
      erro = 'Informe o usuário e a senha.';
      return;
    }

    carregando = true;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuario.trim(), senha })
      });

      if (!response.ok) {
        erro = 'Usuário ou senha inválidos.';
        return;
      }

      window.location.assign('/');
    } catch {
      erro = 'Não foi possível realizar o login. Tente novamente.';
    } finally {
      carregando = false;
    }
  }
</script>

<svelte:head>
  <title>Entrar | SVeltário</title>
  <meta name="description" content="Acesse o SVeltário para gerenciar equipamentos." />
</svelte:head>

<main class="login-page">
  <section class="login-shell" aria-labelledby="login-title">
    <div class="brand">
      <img src={inventoryBox} alt="Símbolo de inventário" class="brand__logo" />
      <div>
        <h1 id="login-title"><span>SV</span>eltário</h1>
        <p>Gerenciamento de equipamentos</p>
      </div>
    </div>

    <form class="login-form" onsubmit={(event) => { event.preventDefault(); entrar(); }}>
      <div class="form-group">
        <label for="usuario">Usuário</label>
        <input id="usuario" name="usuario" type="text" autocomplete="username" bind:value={usuario} disabled={carregando} />
      </div>

      <div class="form-group">
        <label for="senha">Senha</label>
        <input id="senha" name="senha" type="password" autocomplete="current-password" bind:value={senha} disabled={carregando} />
      </div>

      {#if erro}
        <p class="login-error" role="alert">{erro}</p>
      {/if}

      <button type="submit" class="button--primary" disabled={carregando}>
        {carregando ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  </section>
</main>
