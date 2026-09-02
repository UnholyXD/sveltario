import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { findEquipmentOwner, isEquipmentAllocated } from '$lib/server/storage/alocacoes';
import { getEquipmentByTypeAndId, listEquipmentByType, saveEquipmentByType } from '$lib/server/storage/equipamentos';
import { getPessoaByUsuario } from '$lib/server/storage/pessoas';
import { assertValidEquipmentType, assertValidState } from '$lib/server/validation/equipamentos';

function ensureNotChangingIdentifier(tipo: string, payload: Record<string, unknown>, id: string) {
  if (tipo === 'computador' || tipo === 'monitor') {
    if ('patrimonio' in payload && String(payload.patrimonio) !== id) {
      throw new Error('O patrimônio não pode ser alterado.');
    }
  }

  if (tipo === 'mouse' || tipo === 'teclado' || tipo === 'fone' || tipo === 'outros') {
    if ('id' in payload && String(payload.id) !== id) {
      throw new Error('O identificador do equipamento não pode ser alterado.');
    }
  }
}

export async function GET({ params }: { params: Record<string, string> }) {
  const { tipo, id } = params;

  try {
    assertValidEquipmentType(tipo);
    const item = await getEquipmentByTypeAndId(tipo, id);
    if (!item) {
      return json({ error: 'Equipamento não encontrado.' }, { status: 404 });
    }

    const owner = await findEquipmentOwner(tipo, id);
    const pessoa = owner ? await getPessoaByUsuario(owner.usuario) : null;

    return json({
      ...item,
      alocadoPara: owner && pessoa ? { usuario: pessoa.usuario, nome: pessoa.nome } : null
    });
  } catch {
    return json({ error: 'Tipo de equipamento inválido.' }, { status: 400 });
  }
}

export async function PATCH({ params, request, cookies }: { params: Record<string, string>; request: Request; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { tipo, id } = params;

  try {
    assertValidEquipmentType(tipo);
    const payload = await request.json();
    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Corpo inválido.' }, { status: 400 });
    }

    const items = await listEquipmentByType(tipo);
    const index = items.findIndex((item) => String((item as Record<string, unknown>)[tipo === 'computador' || tipo === 'monitor' ? 'patrimonio' : 'id'] ?? '') === id);

    if (index === -1) {
      return json({ error: 'Equipamento não encontrado.' }, { status: 404 });
    }

    const existing = items[index] as Record<string, unknown>;
    const merged = { ...existing, ...(payload as Record<string, unknown>) };
    ensureNotChangingIdentifier(tipo, payload as Record<string, unknown>, id);

    if ('estado' in merged && typeof merged.estado === 'string') {
      assertValidState(merged.estado);
    }

    if (tipo === 'computador') {
      if (!merged.patrimonio || !merged.marca || !merged.modelo || !merged.serviceTag || !merged.hostname || !merged.processador || !merged.memoriaRamGb || !merged.armazenamento) {
        throw new Error('Dados do computador incompletos.');
      }
    }

    if (tipo === 'monitor') {
      if (!merged.patrimonio || !merged.marca || !merged.modelo || !merged.numeroSerie) {
        throw new Error('Dados do monitor incompletos.');
      }
    }

    if (tipo === 'outros' && (typeof merged.categoria !== 'string' || merged.categoria.trim() === '')) {
      throw new Error('Categoria é obrigatória.');
    }

    items[index] = merged as never;
    await saveEquipmentByType(tipo, items as never[]);
    return json(merged);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar equipamento.';
    return json({ error: message }, { status: 400 });
  }
}

export async function DELETE({ params, cookies }: { params: Record<string, string>; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { tipo, id } = params;

  try {
    assertValidEquipmentType(tipo);
    const item = await getEquipmentByTypeAndId(tipo, id);
    if (!item) {
      return json({ error: 'Equipamento não encontrado.' }, { status: 404 });
    }

    if (await isEquipmentAllocated(tipo, id)) {
      return json({ error: 'Não é possível excluir um equipamento alocado.' }, { status: 409 });
    }

    const items = await listEquipmentByType(tipo);
    const updated = items.filter((entry) => String((entry as Record<string, unknown>)[tipo === 'computador' || tipo === 'monitor' ? 'patrimonio' : 'id'] ?? '') !== id);
    await saveEquipmentByType(tipo, updated as never[]);
    return json({ ok: true });
  } catch {
    return json({ error: 'Tipo de equipamento inválido.' }, { status: 400 });
  }
}
