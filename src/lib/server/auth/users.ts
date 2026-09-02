import path from 'node:path';
import { configDirectory, readJsonFile, writeJsonFile } from '../storage/json';
import { hashPassword, verifyPassword } from './password';

export interface UsuarioPersistido {
  usuario: string;
  salt: string;
  senhaHash: string;
  ativo: boolean;
}

export interface UsuariosStore {
  version: number;
  items: UsuarioPersistido[];
}

const usuariosPath = path.join(configDirectory, 'usuarios.json');

export async function readUsuarios(): Promise<UsuariosStore> {
  return readJsonFile<UsuariosStore>(usuariosPath, { requireCollection: true });
}

export async function writeUsuarios(store: UsuariosStore): Promise<void> {
  await writeJsonFile(usuariosPath, store);
}

export async function getUsuarioByName(usuario: string): Promise<UsuarioPersistido | null> {
  const store = await readUsuarios();
  return store.items.find((user) => user.usuario === usuario) ?? null;
}

export async function createUsuario(usuario: string, senha: string): Promise<UsuarioPersistido> {
  const store = await readUsuarios();
  if (store.items.some((item) => item.usuario === usuario)) {
    throw new Error(`Usuário já cadastrado: ${usuario}`);
  }

  const { salt, hash } = await hashPassword(senha);
  const novoUsuario: UsuarioPersistido = {
    usuario,
    salt,
    senhaHash: hash,
    ativo: true
  };

  store.items.push(novoUsuario);
  await writeUsuarios(store);

  return novoUsuario;
}

export async function autenticateUsuario(usuario: string, senha: string): Promise<{ usuario: string } | null> {
  const user = await getUsuarioByName(usuario);
  if (!user || !user.ativo) {
    return null;
  }

  const valid = await verifyPassword(senha, user.salt, user.senhaHash);
  if (!valid) {
    return null;
  }

  return { usuario: user.usuario };
}

export function sanitizeUsuario(user: UsuarioPersistido): { usuario: string; ativo: boolean } {
  return {
    usuario: user.usuario,
    ativo: user.ativo
  };
}
