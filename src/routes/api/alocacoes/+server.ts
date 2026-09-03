import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { findEquipmentOwner, getAlocacaoPorUsuario, readAlocacoes, writeAlocacoes } from '$lib/server/storage/alocacoes';
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

    const equipamentos = 'equipamentos' in body ? body.equipamentos : [{ tipo: body.tipo, id: body.id }];
    const alocacoes = await readAlocacoes();
    const atual = alocacoes.items.find((entry) => entry.usuario === body.usuario);
    const indisponiveis: string[] = [];

    for (const equipamento of equipamentos) {
      const item = await getEquipmentByTypeAndId(equipamento.tipo, equipamento.id);
      const owner = await findEquipmentOwner(equipamento.tipo, equipamento.id);
      const jaNaPessoa = atual?.equipamentos.some((entry) => entry.tipo === equipamento.tipo && entry.id === equipamento.id);
      if (!item || owner || jaNaPessoa) {
        indisponiveis.push(`${equipamento.tipo}:${equipamento.id}`);
      }
    }

    if (indisponiveis.length) {
      return json({ error: 'Alguns equipamentos não estão mais disponíveis.', indisponiveis }, { status: 409 });
    }

    const destino = atual ?? { usuario: body.usuario, equipamentos: [] };
    if (!atual) alocacoes.items.push(destino);
    destino.equipamentos.push(...equipamentos);
    await writeAlocacoes(alocacoes);
    return json({ usuario: body.usuario, equipamentos }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao alocar equipamento.';
    return json({ error: message }, { status: 400 });
  }
}
