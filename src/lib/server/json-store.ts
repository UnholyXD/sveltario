export const DATA_DIRECTORY = 'data';
export const BACKUP_DIRECTORY = 'backups';

export type DataKind =
  | 'computador'
  | 'monitor'
  | 'mouse'
  | 'teclado'
  | 'fone'
  | 'outros'
  | 'pessoas'
  | 'alocacoes'
  | 'movimentacoes';

export const DATA_FILES: Record<DataKind, string> = {
  computador: 'computador.json',
  monitor: 'monitor.json',
  mouse: 'mouse.json',
  teclado: 'teclado.json',
  fone: 'fone.json',
  outros: 'outros.json',
  pessoas: 'pessoas.json',
  alocacoes: 'alocacoes.json',
  movimentacoes: 'movimentacoes.json'
};
