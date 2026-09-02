export type EstadoEquipamento = 'bom' | 'manutencao' | 'defeito' | 'inativo';

export interface ArmazenamentoItem {
  tipo: string;
  modelo: string;
  capacidadeGb: number;
}

export interface Computador {
  patrimonio: string;
  marca: string;
  modelo: string;
  serviceTag: string;
  hostname: string;
  processador: string;
  memoriaRamGb: number;
  armazenamento: ArmazenamentoItem[];
  estado: EstadoEquipamento;
  observacoes: string;
}

export interface Monitor {
  patrimonio: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  estado: EstadoEquipamento;
  observacoes: string;
}

export interface Mouse {
  id: string;
  marca: string;
  modelo: string;
  modeloTecnico: string;
  numeroSerie: string | null;
  partNumber: string;
  pid: string | null;
  conexao: string;
  estado: EstadoEquipamento;
  observacoes: string;
}

export interface Teclado {
  id: string;
  marca: string;
  modelo: string;
  modeloTecnico: string;
  numeroSerie: string | null;
  partNumber: string;
  pid: string | null;
  conexao: string;
  layout: string;
  estado: EstadoEquipamento;
  observacoes: string;
}

export interface Fone {
  id: string;
  marca: string;
  modelo: string;
  numeroSerie: string | null;
  tipo: 'headset' | 'intra' | 'over-ear';
  conexao: string;
  microfone: boolean;
  estado: EstadoEquipamento;
  observacoes: string;
}

export interface Pessoa {
  nome: string;
  usuario: string;
  setor: string | null;
  ativo: boolean;
  observacoes: string;
}

export interface AlocacaoEquipamento {
  tipo: 'computador' | 'monitor' | 'mouse' | 'teclado' | 'fone';
  id: string;
}

export interface AlocacaoPessoa {
  usuario: string;
  equipamentos: AlocacaoEquipamento[];
}

export interface JsonFile<T> {
  version: number;
  items: T[];
}
