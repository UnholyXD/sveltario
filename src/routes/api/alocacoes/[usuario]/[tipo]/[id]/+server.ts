import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { removeEquipmentFromUser } from '$lib/server/storage/alocacoes';
import { assertValidEquipmentType } from '$lib/server/validation/equipamentos';

export async function DELETE({ params, cookies }: { params: Record<string, string>; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { usuario, tipo, id } = params;

  try {
    assertValidEquipmentType(tipo);
    const removed = await removeEquipmentFromUser(usuario, tipo, id);

    if (!removed) {
      return json({ error: 'Equipamento não encontrado na alocação do usuário.' }, { status: 404 });
    }

    return json({ ok: true, usuario, tipo, id });
  } catch {
    return json({ error: 'Tipo de equipamento inválido.' }, { status: 400 });
  }
}
