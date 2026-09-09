import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { readAlocacoes, swapEquipmentForUser } from '$lib/server/storage/alocacoes';
import { getEquipmentByTypeAndId, getEquipmentIdentifierKey, listEquipmentByType } from '$lib/server/storage/equipamentos';
import { getPessoaByUsuario } from '$lib/server/storage/pessoas';
import { appendMovimentacao } from '$lib/server/storage/movimentacoes';
import { isValidEquipmentType, type EquipmentType } from '$lib/server/validation/equipamentos';

function snapshot(tipo: EquipmentType, id: string, value: unknown) {
  const entry = (value ?? {}) as Record<string, unknown>;
  return {
    tipo,
    id,
    marca: typeof entry.marca === 'string' ? entry.marca : '',
    modelo: typeof entry.modelo === 'string' ? entry.modelo : '',
    estado: typeof entry.estado === 'string' ? entry.estado : '',
    patrimonio: typeof entry.patrimonio === 'string' ? entry.patrimonio : '',
    serviceTag: typeof entry.serviceTag === 'string' ? entry.serviceTag : '',
    numeroSerie: typeof entry.numeroSerie === 'string' ? entry.numeroSerie : '',
    categoria: typeof entry.categoria === 'string' ? entry.categoria : ''
  };
}

export async function GET({ url }: { url: URL }) {
  const tipo = url.searchParams.get('tipo');
  const atualId = url.searchParams.get('atualId');
  if (!isValidEquipmentType(tipo) || !atualId) {
    return json({ error: 'Dados da troca inválidos.' }, { status: 400 });
  }

  try {
    const [items, allocations] = await Promise.all([listEquipmentByType(tipo), readAlocacoes()]);
    const allocatedIds = new Set(
      allocations.items.flatMap((entry) => entry.equipamentos.filter((item) => item.tipo === tipo).map((item) => item.id))
    );
    const key = getEquipmentIdentifierKey(tipo);
    const available = items
      .map((item) => {
        const entry = item as Record<string, unknown>;
        const id = String(entry[key] ?? '');
        return { ...entry, tipo, id };
      })
      .filter((item) => item.id && item.id !== atualId && !allocatedIds.has(item.id));
    return json(available);
  } catch {
    return json({ error: 'Não foi possível carregar os equipamentos disponíveis.' }, { status: 500 });
  }
}

export async function POST({ request, cookies }: { request: Request; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) return json({ error: 'Não autenticado.' }, { status: 401 });

  try {
    const body = await request.json() as Record<string, unknown>;
    const usuario = typeof body.usuario === 'string' ? body.usuario : '';
    const tipo = body.tipo;
    const atualId = typeof body.atualId === 'string' ? body.atualId : '';
    const novoId = typeof body.novoId === 'string' ? body.novoId : '';
    if (!usuario || !isValidEquipmentType(tipo) || !atualId || !novoId) {
      return json({ error: 'Dados da troca inválidos.' }, { status: 400 });
    }

    const [pessoa, currentEquipment, newEquipment] = await Promise.all([
      getPessoaByUsuario(usuario),
      getEquipmentByTypeAndId(tipo, atualId),
      getEquipmentByTypeAndId(tipo, novoId)
    ]);
    if (!pessoa) return json({ error: 'Colaborador não encontrado.' }, { status: 404 });
    if (!currentEquipment || !newEquipment) return json({ error: 'Equipamento não encontrado.' }, { status: 404 });

    const equipamentoAnterior = snapshot(tipo, atualId, currentEquipment);
    const equipamentoNovo = snapshot(tipo, novoId, newEquipment);
    await swapEquipmentForUser(usuario, tipo, atualId, novoId);
    let movimentacaoData = new Date().toISOString();
    try {
      const movimentacao = await appendMovimentacao({
        acao: 'troca',
        executadoPor: session.usuario,
        equipamento: equipamentoNovo,
        equipamentoAnterior,
        equipamentoNovo,
        origem: { usuario: pessoa.usuario, nome: pessoa.nome },
        destino: { usuario: pessoa.usuario, nome: pessoa.nome }
      });
      movimentacaoData = movimentacao.data;
    } catch {
      try {
        await swapEquipmentForUser(usuario, tipo, novoId, atualId);
      } catch {
        return json({ error: 'Não foi possível concluir a troca com segurança.' }, { status: 500 });
      }
      return json({ error: 'Não foi possível registrar a troca no histórico.' }, { status: 500 });
    }

    return json({
      ok: true,
      usuario,
      pessoa: {
        nome: pessoa.nome,
        setor: pessoa.setor ?? null,
        cargo: pessoa.cargo ?? null
      },
      equipamentoAnterior,
      equipamentoNovo,
      data: movimentacaoData,
      executadoPor: session.usuario
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível concluir a troca.';
    const isConflict = message.includes('não está mais');
    const isValidation = message.includes('deve ser diferente');
    return json({
      error: isConflict || isValidation ? message : 'Não foi possível concluir a troca.'
    }, { status: isConflict ? 409 : isValidation ? 400 : 500 });
  }
}
