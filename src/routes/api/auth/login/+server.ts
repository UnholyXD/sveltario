import { json } from '@sveltejs/kit';
import { autenticateUsuario } from '$lib/server/auth/users';
import { createSession, SESSION_COOKIE_NAME } from '$lib/server/auth/session';

export async function POST({ request, cookies }: { request: Request; cookies: any }) {
  try {
    const body = await request.json();

    if (!body || typeof body !== 'object' || typeof body.usuario !== 'string' || typeof body.senha !== 'string') {
      return json({ error: 'Credenciais inválidas.' }, { status: 400 });
    }

    const autenticado = await autenticateUsuario(body.usuario, body.senha);
    if (!autenticado) {
      return json({ error: 'Credenciais inválidas.' }, { status: 401 });
    }

    const { token } = createSession(autenticado.usuario);
    cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false
    });

    return json({ authenticated: true, usuario: autenticado.usuario });
  } catch {
    return json({ error: 'Não foi possível autenticar.' }, { status: 400 });
  }
}
