import path from 'node:path';
import type { EquipmentType } from '../validation/equipamentos';
import { dataDirectory, readJsonFile, updateJsonFile } from './json';
import { nextMovimentacaoId } from './contadores';

export type MovimentacaoTipo = 'alocacao' | 'desalocacao' | 'transferencia';

export interface EquipamentoSnapshot {
  tipo: EquipmentType;
  id: string;
  marca: string;
  modelo: string;
}

export interface PessoaSnapshot {
  usuario: string;
  nome: string;
}

export interface MovimentacaoRecord {
  id: string;
  acao: MovimentacaoTipo;
  data: string;
  executadoPor: string;
  equipamento: EquipamentoSnapshot;
  origem: PessoaSnapshot | null;
  destino: PessoaSnapshot | null;
}

export type MovimentacoesStore = { version: number; items: MovimentacaoRecord[] };
const movimentacoesPath = path.join(dataDirectory, 'movimentacoes.json');

export async function readMovimentacoes(): Promise<MovimentacoesStore> {
  return readJsonFile<MovimentacoesStore>(movimentacoesPath, { requireCollection: true });
}

export async function appendMovimentacao(
  movimentacao: Omit<MovimentacaoRecord, 'id' | 'data'> & { data?: string }
): Promise<MovimentacaoRecord> {
  const record: MovimentacaoRecord = {
    ...movimentacao,
    id: `MOV-${String(await nextMovimentacaoId()).padStart(6, '0')}`,
    data: movimentacao.data ?? new Date().toISOString()
  };
  await updateJsonFile<MovimentacoesStore>(
    movimentacoesPath,
    (store) => ({ version: store.version ?? 1, items: [...(store.items ?? []), record] }),
    JSON.stringify({ version: 1, items: [] }, null, 2) + '\n'
  );
  return record;
}

export async function listMovimentacoes(): Promise<MovimentacaoRecord[]> {
  return (await readMovimentacoes()).items;
}

export async function listMovimentacoesPorEquipamento(tipo: EquipmentType, id: string): Promise<MovimentacaoRecord[]> {
  return (await listMovimentacoes()).filter((item) => item.equipamento.tipo === tipo && item.equipamento.id === id);
}

export async function listMovimentacoesPorPessoa(usuario: string): Promise<MovimentacaoRecord[]> {
  return (await listMovimentacoes()).filter(
    (item) => item.origem?.usuario === usuario || item.destino?.usuario === usuario
  );
}

export const listarMovimentacoes = listMovimentacoes;
export const listarMovimentacoesPorEquipamento = listMovimentacoesPorEquipamento;
export const listarMovimentacoesPorPessoa = listMovimentacoesPorPessoa;
