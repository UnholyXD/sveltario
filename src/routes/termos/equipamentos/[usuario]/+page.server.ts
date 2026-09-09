import { error } from '@sveltejs/kit';
import { getAlocacaoPorUsuario } from '$lib/server/storage/alocacoes';
import { getPessoaByUsuario } from '$lib/server/storage/pessoas';
import {
  getEquipmentIdentifierKey,
  listEquipmentByType
} from '$lib/server/storage/equipamentos';
import { VALID_EQUIPMENT_TYPES, type EquipmentType } from '$lib/server/validation/equipamentos';

type EquipmentRow = {
  tipo: EquipmentType;
  item: string;
  descricao: string;
  identificacao: string;
  estado: string;
};

const itemLabels: Record<EquipmentType, string> = {
  computador: 'Computador / Notebook',
  monitor: 'Monitor',
  mouse: 'Mouse',
  teclado: 'Teclado',
  fone: 'Fone de Ouvido / Headset',
  outros: 'Outros'
};

function text(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function combine(...values: unknown[]): string {
  return values.map(text).filter(Boolean).join(' / ');
}

function stateLabel(value: unknown): string {
  const state = text(value);
  const knownStates: Record<string, string> = {
    novo: 'Novo',
    bom: 'Bom',
    marcas_de_uso: 'Com marcas de uso'
  };
  return knownStates[state] ?? state.replaceAll('_', ' ');
}

function resolveRow(tipo: EquipmentType, equipment: Record<string, unknown>, id: string): EquipmentRow {
  const descricao = combine(equipment.marca, equipment.modelo, equipment.modeloTecnico);
  let identificacao = '';

  if (tipo === 'computador') {
    identificacao = combine(equipment.serviceTag, equipment.patrimonio);
  } else if (tipo === 'monitor') {
    identificacao = combine(equipment.numeroSerie, equipment.patrimonio);
  } else {
    identificacao = combine(equipment.numeroSerie, equipment.patrimonio, id);
  }

  return {
    tipo,
    item: tipo === 'outros' ? text(equipment.categoria) || itemLabels.outros : itemLabels[tipo],
    descricao: descricao || '—',
    identificacao: identificacao || '—',
    estado: stateLabel(equipment.estado) || '—'
  };
}

export async function load({ params }) {
  const usuario = params.usuario;
  if (!usuario) throw error(404, 'Colaborador não encontrado.');

  const pessoa = await getPessoaByUsuario(usuario);
  if (!pessoa) throw error(404, 'Colaborador não encontrado.');

  const alocacao = await getAlocacaoPorUsuario(usuario);
  const allocated = alocacao?.equipamentos ?? [];
  const types = [...new Set(allocated.map((item) => item.tipo))];
  const inventories = await Promise.all(
    types.map(async (tipo) => [tipo, await listEquipmentByType(tipo)] as const)
  );
  const inventoryByType = new Map(inventories);
  const equipamentos: EquipmentRow[] = [];

  for (const allocatedItem of allocated) {
    const tipo = allocatedItem.tipo;
    if (!VALID_EQUIPMENT_TYPES.includes(tipo)) continue;
    const key = getEquipmentIdentifierKey(tipo);
    const equipment = (inventoryByType.get(tipo) ?? []).find((entry) => {
      const record = entry as Record<string, unknown>;
      return text(record[key]) === allocatedItem.id;
    });
    if (equipment) equipamentos.push(resolveRow(tipo, equipment as Record<string, unknown>, allocatedItem.id));
  }

  return {
    usuario,
    pessoa: {
      nome: pessoa.nome,
      setor: text(pessoa.setor),
      cargo: text(pessoa.cargo)
    },
    equipamentos,
    data: new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date())
  };
}
