import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { findEquipmentOwner, getAlocacaoPorUsuario, readAlocacoes, saveOrCreateAlocacao } from '$lib/server/storage/alocacoes';
import { getEquipmentByTypeAndId } from '$lib/server/storage/equipamentos';
import { getPessoaByUsuario } from '$lib/server/storage/pessoas';
import { assertAlocacaoPayload } from '$lib/server/validation/alocacoes';

export async function GET() {
  const store = await readAlocacoes();
  return json(store.items);
}

export async function POST({ request, cookies }: { request: Request; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    assertAlocacaoPayload(body);

    const pessoa = await getPessoaByUsuario(body.usuario);
    if (!pessoa) {
      return json({ error: 'Pessoa não encontrada.' }, { status: 404 });
    }

    if (!pessoa.ativo) {
      return json({ error: 'Pessoa inativa não pode receber equipamento.' }, { status: 409 });
    }

    const item = await getEquipmentByTypeAndId(body.tipo, body.id);
    if (!item) {
      return json({ error: 'Equipamento não encontrado.' }, { status: 404 });
    }

    const owner = await findEquipmentOwner(body.tipo, body.id);
    if (owner && owner.usuario !== body.usuario) {
      return json({ error: 'Equipamento já está alocado a outra pessoa.' }, { status: 409 });
    }

    const atual = await getAlocacaoPorUsuario(body.usuario);
    if (atual && atual.equipamentos.some((entry) => entry.tipo === body.tipo && entry.id === body.id)) {
      return json({ error: 'Equipamento já está alocado para a pessoa.' }, { status: 409 });
    }

    await saveOrCreateAlocacao(body.usuario, { tipo: body.tipo, id: body.id });
    return json({ usuario: body.usuario, tipo: body.tipo, id: body.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao alocar equipamento.';
    return json({ error: message }, { status: 400 });
  }
}
