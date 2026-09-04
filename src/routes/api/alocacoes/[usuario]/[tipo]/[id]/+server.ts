import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { removeEquipmentFromUser } from '$lib/server/storage/alocacoes';
import { assertValidEquipmentType } from '$lib/server/validation/equipamentos';
import { getEquipmentByTypeAndId } from '$lib/server/storage/equipamentos';
import { getPessoaByUsuario } from '$lib/server/storage/pessoas';
import { appendMovimentacao } from '$lib/server/storage/movimentacoes';

export async function DELETE({ params, cookies }: { params: Record<string, string>; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { usuario, tipo, id } = params;

  try {
    assertValidEquipmentType(tipo);
    const [equipment, pessoa] = await Promise.all([getEquipmentByTypeAndId(tipo, id), getPessoaByUsuario(usuario)]);
    const removed = await removeEquipmentFromUser(usuario, tipo, id);

    if (!removed) {
      return json({ error: 'Equipamento não encontrado na alocação do usuário.' }, { status: 404 });
    }

    if (equipment) {
      const entry = equipment as Record<string, unknown>;
      await appendMovimentacao({
        acao: 'desalocacao',
        executadoPor: session.usuario,
        equipamento: {
          tipo,
          id,
          marca: typeof entry.marca === 'string' ? entry.marca : '',
          modelo: typeof entry.modelo === 'string' ? entry.modelo : ''
        },
        origem: { usuario, nome: pessoa?.nome ?? usuario },
        destino: null
      });
    }
    return json({ ok: true, usuario, tipo, id });
  } catch {
    return json({ error: 'Tipo de equipamento inválido.' }, { status: 400 });
  }
}
