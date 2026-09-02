import path from 'node:path';
import { configDirectory, readJsonFile, writeJsonFile } from './json';

export type CounterRecord = {
  version: number;
  mouse: number;
  teclado: number;
  fone: number;
};

const counterPath = path.join(configDirectory, 'contadores.json');

export async function readCounters(): Promise<CounterRecord> {
  const data = await readJsonFile<CounterRecord>(counterPath, { requireCollection: false });

  if (!data || typeof data !== 'object' || !('version' in data) || !('mouse' in data) || !('teclado' in data) || !('fone' in data)) {
    throw new Error('Arquivo de contadores inválido.');
  }

  const counter = data as Record<string, unknown>;
  return {
    version: Number(counter.version ?? 1),
    mouse: Number(counter.mouse ?? 0),
    teclado: Number(counter.teclado ?? 0),
    fone: Number(counter.fone ?? 0)
  };
}

export async function nextGenericId(tipo: 'mouse' | 'teclado' | 'fone'): Promise<string> {
  const counters = await readCounters();
  const prefixMap = {
    mouse: 'MOU',
    teclado: 'TEC',
    fone: 'FON'
  } as const;

  const key = tipo;
  const nextValue = Number(counters[key] ?? 0) + 1;
  const update = {
    ...counters,
    version: 1,
    [key]: nextValue
  };

  await writeJsonFile(counterPath, update);
  return `${prefixMap[tipo]}-${String(nextValue).padStart(4, '0')}`;
}
