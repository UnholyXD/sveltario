import path from 'node:path';
import { dataDirectory, readJsonFile, writeJsonFile } from './json';
import type { JsonCollection } from './json';
import type { EquipmentType } from '../validation/equipamentos';

export interface EquipamentoAlocado {
  tipo: EquipmentType;
  id: string;
}

export interface AlocacaoRecord {
  usuario: string;
  equipamentos: EquipamentoAlocado[];
}

export type AlocacoesStore = JsonCollection<AlocacaoRecord>;

const alocacoesPath = path.join(dataDirectory, 'alocacoes.json');

export async function readAlocacoes(): Promise<AlocacoesStore> {
  return readJsonFile<AlocacoesStore>(alocacoesPath, { requireCollection: true });
}

export async function writeAlocacoes(store: AlocacoesStore): Promise<void> {
  await writeJsonFile(alocacoesPath, store);
}

export async function getAlocacaoPorUsuario(usuario: string): Promise<AlocacaoRecord | null> {
  const store = await readAlocacoes();
  return store.items.find((entry) => entry.usuario === usuario) ?? null;
}

export async function findEquipmentOwner(tipo: EquipmentType, id: string): Promise<{ usuario: string } | null> {
  const store = await readAlocacoes();

  for (const entry of store.items) {
    if (entry.equipamentos.some((equipamento) => equipamento.tipo === tipo && equipamento.id === id)) {
      return { usuario: entry.usuario };
    }
  }

  return null;
}

export async function isEquipmentAllocated(tipo: EquipmentType, id: string): Promise<boolean> {
  return (await findEquipmentOwner(tipo, id)) !== null;
}

export async function saveOrCreateAlocacao(usuario: string, equipamento: EquipamentoAlocado): Promise<void> {
  const store = await readAlocacoes();
  let entry = store.items.find((item) => item.usuario === usuario);

  if (!entry) {
    entry = { usuario, equipamentos: [] };
    store.items.push(entry);
  }

  const alreadyAllocated = entry.equipamentos.some(
    (item) => item.tipo === equipamento.tipo && item.id === equipamento.id
  );

  if (!alreadyAllocated) {
    entry.equipamentos.push(equipamento);
  }

  await writeAlocacoes(store);
}

export async function removeEquipmentFromUser(usuario: string, tipo: EquipmentType, id: string): Promise<boolean> {
  const store = await readAlocacoes();
  const entry = store.items.find((item) => item.usuario === usuario);
  if (!entry) {
    return false;
  }

  const before = entry.equipamentos.length;
  entry.equipamentos = entry.equipamentos.filter(
    (equipamento) => !(equipamento.tipo === tipo && equipamento.id === id)
  );

  if (before === entry.equipamentos.length) {
    return false;
  }

  await writeAlocacoes(store);
  return true;
}

export async function transferEquipment(tipo: EquipmentType, id: string, usuarioDestino: string): Promise<{ usuarioOrigem: string; usuarioDestino: string }> {
  const store = await readAlocacoes();
  const origem = store.items.find((entry) => entry.equipamentos.some((equipamento) => equipamento.tipo === tipo && equipamento.id === id));

  if (!origem) {
    throw new Error('Equipamento não está alocado.');
  }

  origem.equipamentos = origem.equipamentos.filter((equipamento) => !(equipamento.tipo === tipo && equipamento.id === id));

  let destino = store.items.find((entry) => entry.usuario === usuarioDestino);
  if (!destino) {
    destino = { usuario: usuarioDestino, equipamentos: [] };
    store.items.push(destino);
  }

  destino.equipamentos.push({ tipo, id });
  await writeAlocacoes(store);

  return {
    usuarioOrigem: origem.usuario,
    usuarioDestino: destino.usuario
  };
}
