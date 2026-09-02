import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { findEquipmentOwner } from '$lib/server/storage/alocacoes';
import { nextGenericId } from '$lib/server/storage/contadores';
import { listEquipmentByType, saveEquipmentByType } from '$lib/server/storage/equipamentos';
import { getPessoaByUsuario } from '$lib/server/storage/pessoas';
import { assertUniqueIdentifier, assertRequiredFields, assertValidEquipmentType, assertValidState } from '$lib/server/validation/equipamentos';

function normalizePayload(tipo: string, payload: Record<string, unknown>) {
  if (tipo === 'computador') {
    assertRequiredFields(payload, ['patrimonio', 'marca', 'modelo', 'serviceTag', 'hostname', 'processador', 'memoriaRamGb', 'armazenamento', 'estado']);
    assertValidState(payload.estado);

    if (!Array.isArray(payload.armazenamento)) {
      throw new Error('Campo armazenamento deve ser um array.');
    }

    return {
      ...payload,
      observacoes: typeof payload.observacoes === 'string' ? payload.observacoes : '',
      armazenamento: payload.armazenamento
    };
  }

  if (tipo === 'monitor') {
    assertRequiredFields(payload, ['patrimonio', 'marca', 'modelo', 'numeroSerie', 'estado']);
    assertValidState(payload.estado);

    return {
      ...payload,
      observacoes: typeof payload.observacoes === 'string' ? payload.observacoes : ''
    };
  }

  if (tipo === 'mouse') {
    assertRequiredFields(payload, ['marca', 'modelo', 'modeloTecnico', 'partNumber', 'conexao', 'estado']);
    assertValidState(payload.estado);

    return {
      ...payload,
      id: '',
      numeroSerie: payload.numeroSerie ?? null,
      pid: payload.pid ?? null,
      observacoes: typeof payload.observacoes === 'string' ? payload.observacoes : ''
    };
  }

  if (tipo === 'teclado') {
    assertRequiredFields(payload, ['marca', 'modelo', 'modeloTecnico', 'partNumber', 'conexao', 'layout', 'estado']);
    assertValidState(payload.estado);

    return {
      ...payload,
      id: '',
      numeroSerie: payload.numeroSerie ?? null,
      pid: payload.pid ?? null,
      observacoes: typeof payload.observacoes === 'string' ? payload.observacoes : ''
    };
  }

  if (tipo === 'fone') {
    assertRequiredFields(payload, ['marca', 'modelo', 'tipo', 'conexao', 'microfone', 'estado']);
    assertValidState(payload.estado);

    return {
      ...payload,
      id: '',
      numeroSerie: payload.numeroSerie ?? null,
      observacoes: typeof payload.observacoes === 'string' ? payload.observacoes : ''
    };
  }

  if (tipo === 'outros') {
    assertRequiredFields(payload, ['categoria', 'estado']);
    if (typeof payload.categoria !== 'string' || payload.categoria.trim() === '') {
      throw new Error('Categoria é obrigatória.');
    }
    assertValidState(payload.estado);

    return {
      ...payload,
      id: '',
      numeroSerie: payload.numeroSerie ?? null,
      patrimonio: payload.patrimonio ?? null,
      observacoes: typeof payload.observacoes === 'string' ? payload.observacoes : ''
    };
  }

  throw new Error('Tipo de equipamento inválido.');
}

export async function GET({ params }: { params: Record<string, string> }) {
  const { tipo } = params;

  try {
    assertValidEquipmentType(tipo);
    const items = await listEquipmentByType(tipo);
    const result = [] as Array<Record<string, unknown>>;

    for (const item of items) {
      const entry = item as Record<string, unknown>;
      const owner = await findEquipmentOwner(tipo, String(entry[(tipo === 'computador' || tipo === 'monitor') ? 'patrimonio' : 'id'] ?? ''));
      const pessoa = owner ? await getPessoaByUsuario(owner.usuario) : null;

      result.push({
        ...entry,
        alocadoPara: owner && pessoa ? { usuario: pessoa.usuario, nome: pessoa.nome } : null
      });
    }

    return json(result);
  } catch {
    return json({ error: 'Tipo de equipamento inválido.' }, { status: 400 });
  }
}

export async function POST({ params, request, cookies }: { params: Record<string, string>; request: Request; cookies: any }) {
  const { tipo } = params;
  const session = getSessionFromRequest(cookies);

  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    assertValidEquipmentType(tipo);
    const payload = await request.json();
    if (!payload || typeof payload !== 'object') {
      return json({ error: 'Corpo inválido.' }, { status: 400 });
    }

    const items = await listEquipmentByType(tipo);
    const normalized = normalizePayload(tipo, payload as Record<string, unknown>);

    if (tipo === 'computador' || tipo === 'monitor') {
      const normalizedRecord = normalized as Record<string, unknown>;
      assertUniqueIdentifier(items as Array<Record<string, unknown>>, 'patrimonio', normalizedRecord.patrimonio, 'Equipamento');
    }

    if (tipo === 'mouse' || tipo === 'teclado' || tipo === 'fone' || tipo === 'outros') {
      const id = await nextGenericId(tipo);
      const item = { ...normalized, id };
      items.push(item as never);
      await saveEquipmentByType(tipo, items as never[]);
      return json(item, { status: 201 });
    }

    items.push(normalized as never);
    await saveEquipmentByType(tipo, items as never[]);
    return json(normalized, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao cadastrar equipamento.';
    return json({ error: message }, { status: 400 });
  }
}
