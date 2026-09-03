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

<style>
  .login-page {
    --login-background: #121a27;
    --login-surface: #1b2635;
    --login-text: #f4f7fb;
    --login-muted: #a8b5c5;
    --login-accent: #18c6df;
    min-height: 100vh;
    width: 100%;
    display: grid;
    place-items: center;
    padding: var(--space-8) var(--space-4);
    background:
      radial-gradient(circle at 20% 20%, rgba(24, 198, 223, 0.1), transparent 32rem),
      var(--login-background);
    color: var(--login-text);
  }

  .login-shell {
    width: min(100%, 36rem);
    display: grid;
    gap: var(--space-8);
  }

  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-5);
  }

  .brand__logo {
    width: clamp(5.5rem, 18vw, 8rem);
    height: auto;
    flex: 0 0 auto;
  }

  h1 {
    margin: 0;
    font-size: clamp(2.5rem, 7vw, 4.75rem);
    line-height: 0.95;
    letter-spacing: -0.05em;
  }

  h1 span {
    color: var(--login-accent);
  }

  .brand p {
    margin: var(--space-2) 0 0;
    color: var(--login-muted);
    font-size: var(--font-size-sm);
  }

  .login-form {
    width: min(100%, 24rem);
    margin-left: auto;
    display: grid;
    gap: var(--space-5);
  }

  .login-form label {
    color: var(--login-text);
  }

  .login-form input {
    min-height: 2.75rem;
    background: var(--login-surface);
    border-color: #425166;
    color: var(--login-text);
  }

  .login-form input::placeholder {
    color: var(--login-muted);
  }

  .login-form button {
    width: 100%;
    min-height: 2.75rem;
  }

  .login-error {
    margin: 0;
    color: #ffb4ab;
    font-size: var(--font-size-sm);
  }

  @media (max-width: 600px) {
    .login-shell {
      gap: var(--space-6);
    }

    .brand {
      align-items: flex-start;
      flex-direction: column;
      gap: var(--space-3);
    }

    .login-form {
      width: 100%;
      margin-left: 0;
    }
  }
</style>
