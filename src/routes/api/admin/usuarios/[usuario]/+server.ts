import { json } from '@sveltejs/kit';
import { changeUsuarioPassword, getUsuarioByName, removeUsuario, sanitizeUsuario, setUsuarioAtivo } from '$lib/server/auth/users';
import { destroySessionsForUser } from '$lib/server/auth/session';

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : 'Não foi possível alterar o usuário.';
  const status = message.includes('última conta') ? 409 : message.includes('não encontrado') ? 404 : 400;
  return json({ error: message }, { status });
}

export async function PATCH({ params, request }: { params: { usuario: string }; request: Request }) {
  try {
    const body = await request.json();
    if (body?.senha !== undefined) {
      if (typeof body.senha !== 'string' || !body.senha || body.confirmarSenha !== body.senha) {
        return json({ error: 'A senha e a confirmação devem ser iguais.' }, { status: 400 });
      }
      await changeUsuarioPassword(params.usuario, body.senha);
    } else if (typeof body?.ativo === 'boolean') {
      await setUsuarioAtivo(params.usuario, body.ativo);
      if (!body.ativo) destroySessionsForUser(params.usuario);
    } else {
      return json({ error: 'Informe uma senha ou o estado ativo.' }, { status: 400 });
    }
    const user = await getUsuarioByName(params.usuario);
    return json(user ? sanitizeUsuario(user) : null);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE({ params }: { params: { usuario: string } }) {
  try {
    await removeUsuario(params.usuario);
    destroySessionsForUser(params.usuario);
    return json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
