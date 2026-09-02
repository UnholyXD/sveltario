import path from 'node:path';
import { dataDirectory, readJsonFile, writeJsonFile } from './json';
import type { JsonCollection } from './json';
import { VALID_EQUIPMENT_TYPES, type EquipmentType } from '../validation/equipamentos';

const equipmentFiles: Record<EquipmentType, string> = {
  computador: 'computador.json',
  monitor: 'monitor.json',
  mouse: 'mouse.json',
  teclado: 'teclado.json',
  fone: 'fone.json',
  outros: 'outros.json'
};

export type EquipmentCollection<T = Record<string, unknown>> = JsonCollection<T>;

export function getEquipmentPath(tipo: EquipmentType): string {
  return path.join(dataDirectory, equipmentFiles[tipo]);
}

export function getEquipmentIdentifierKey(tipo: EquipmentType): 'patrimonio' | 'id' {
  return tipo === 'computador' || tipo === 'monitor' ? 'patrimonio' : 'id';
}

export async function listEquipmentByType<T = Record<string, unknown>>(tipo: EquipmentType): Promise<T[]> {
  const filePath = getEquipmentPath(tipo);
  const payload = await readJsonFile<EquipmentCollection<T>>(filePath, { requireCollection: true });
  return payload.items;
}

export async function saveEquipmentByType<T = Record<string, unknown>>(tipo: EquipmentType, items: T[]): Promise<void> {
  const filePath = getEquipmentPath(tipo);
  await writeJsonFile(filePath, {
    version: 1,
    items
  });
}

export async function getEquipmentByTypeAndId<T = Record<string, unknown>>(tipo: EquipmentType, id: string): Promise<T | null> {
  const items = await listEquipmentByType<T>(tipo);
  const key = getEquipmentIdentifierKey(tipo);

  return (
    items.find((item) => {
      const entry = item as Record<string, unknown>;
      return String(entry[key] ?? '') === String(id);
    }) ?? null
  );
}

export async function getAllEquipment(): Promise<Array<Record<string, unknown> & { tipo: EquipmentType; id: string }>> {
  const result: Array<Record<string, unknown> & { tipo: EquipmentType; id: string }> = [];

  for (const tipo of VALID_EQUIPMENT_TYPES) {
    const items = await listEquipmentByType(tipo);
    const key = getEquipmentIdentifierKey(tipo);

    for (const item of items) {
      const entry = item as Record<string, unknown>;
      result.push({
        ...entry,
        tipo,
        id: String(entry[key] ?? '')
      });
    }
  }

  return result;
}
