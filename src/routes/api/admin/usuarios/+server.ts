import { json } from '@sveltejs/kit';
import { createUsuario, readUsuarios, sanitizeUsuario } from '$lib/server/auth/users';

export async function GET() {
  const store = await readUsuarios();
  return json(store.items.map(sanitizeUsuario));
}

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    if (!body || typeof body.usuario !== 'string' || typeof body.senha !== 'string' ||
        !body.usuario.trim() || !body.senha || body.confirmarSenha !== body.senha) {
      return json({ error: 'Usuário e senha são obrigatórios.' }, { status: 400 });
    }
    const user = await createUsuario(body.usuario.trim(), body.senha, body.ativo !== false);
    return json(sanitizeUsuario(user), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível criar o usuário.';
    return json({ error: message }, { status: message.startsWith('Usuário já') ? 409 : 400 });
  }
}
