import path from 'node:path';
import { dataDirectory, readJsonFile, writeJsonFile } from './json';
import type { JsonCollection } from './json';

export interface PessoaRecord {
  nome: string;
  usuario: string;
  setor: string | null;
  ativo: boolean;
  observacoes: string;
}

export type PessoasStore = JsonCollection<PessoaRecord>;

const pessoasPath = path.join(dataDirectory, 'pessoas.json');

export async function readPessoas(): Promise<PessoasStore> {
  return readJsonFile<PessoasStore>(pessoasPath, { requireCollection: true });
}

export async function writePessoas(store: PessoasStore): Promise<void> {
  await writeJsonFile(pessoasPath, store);
}

export async function listPessoas(): Promise<PessoaRecord[]> {
  return (await readPessoas()).items;
}

export async function getPessoaByUsuario(usuario: string): Promise<PessoaRecord | null> {
  const store = await readPessoas();
  return store.items.find((pessoa) => pessoa.usuario === usuario) ?? null;
}

export async function savePessoa(pessoa: PessoaRecord): Promise<void> {
  const store = await readPessoas();
  const index = store.items.findIndex((entry) => entry.usuario === pessoa.usuario);

  if (index >= 0) {
    store.items[index] = pessoa;
  } else {
    store.items.push(pessoa);
  }

  await writePessoas(store);
}
