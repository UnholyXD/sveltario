import path from 'node:path';
import { configDirectory, readJsonFile, updateJsonFile, writeJsonFile } from './json';

export type CounterRecord = {
  version: number;
  mouse: number;
  teclado: number;
  fone: number;
  outros: number;
  movimentacoes: number;
};

const counterPath = path.join(configDirectory, 'contadores.json');

export async function readCounters(): Promise<CounterRecord> {
  const data = await readJsonFile<CounterRecord>(counterPath, { requireCollection: false });

  if (!data || typeof data !== 'object' || !('version' in data) || !('mouse' in data) || !('teclado' in data) || !('fone' in data) || !('outros' in data)) {
    throw new Error('Arquivo de contadores inválido.');
  }

  const counter = data as Record<string, unknown>;
  return {
    version: Number(counter.version ?? 1),
    mouse: Number(counter.mouse ?? 0),
    teclado: Number(counter.teclado ?? 0),
    fone: Number(counter.fone ?? 0),
    outros: Number(counter.outros ?? 0),
    movimentacoes: Number(counter.movimentacoes ?? 0)
  };
}

export async function nextMovimentacaoId(): Promise<number> {
  const counters = await updateJsonFile<CounterRecord>(
    counterPath,
    (current) => ({
      ...current,
      version: 1,
      movimentacoes: Number(current.movimentacoes ?? 0) + 1
    }),
    JSON.stringify({ version: 1, mouse: 0, teclado: 0, fone: 0, outros: 0, movimentacoes: 0 }, null, 2) + '\n'
  );
  return counters.movimentacoes;
}

export async function nextGenericId(tipo: 'mouse' | 'teclado' | 'fone' | 'outros'): Promise<string> {
  const counters = await readCounters();
  const prefixMap = {
    mouse: 'MOU',
    teclado: 'TEC',
    fone: 'FON',
    outros: 'OUT'
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
