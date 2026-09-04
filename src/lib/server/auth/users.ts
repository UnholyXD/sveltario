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
  const store = await readJsonFile<UsuariosStore>(usuariosPath, { requireCollection: true });

  if (store.items.length === 0) {
    const { salt, hash } = await hashPassword('admin');
    const initialStore: UsuariosStore = {
      version: 1,
      items: [{
        usuario: 'admin',
        salt,
        senhaHash: hash,
        ativo: true
      }]
    };
    await writeJsonFile(usuariosPath, initialStore);
    return initialStore;
  }

  return store;
}

export async function writeUsuarios(store: UsuariosStore): Promise<void> {
  await writeJsonFile(usuariosPath, store);
}

export async function getUsuarioByName(usuario: string): Promise<UsuarioPersistido | null> {
  const store = await readUsuarios();
  return store.items.find((user) => user.usuario === usuario) ?? null;
}

export async function createUsuario(usuario: string, senha: string, ativo = true): Promise<UsuarioPersistido> {
  const store = await readUsuarios();
  if (store.items.some((item) => item.usuario === usuario)) {
    throw new Error(`Usuário já cadastrado: ${usuario}`);
  }

  const { salt, hash } = await hashPassword(senha);
  const novoUsuario: UsuarioPersistido = {
    usuario,
    salt,
    senhaHash: hash,
    ativo
  };

  store.items.push(novoUsuario);
  await writeUsuarios(store);

  return novoUsuario;
}

export async function changeUsuarioPassword(usuario: string, senha: string): Promise<void> {
  const store = await readUsuarios();
  const user = store.items.find((item) => item.usuario === usuario);

  if (!user) {
    throw new Error(`Usuário não encontrado: ${usuario}`);
  }

  const { salt, hash } = await hashPassword(senha);
  user.salt = salt;
  user.senhaHash = hash;
  await writeUsuarios(store);
}

export async function setUsuarioAtivo(usuario: string, ativo: boolean): Promise<UsuarioPersistido> {
  const store = await readUsuarios();
  const user = store.items.find((item) => item.usuario === usuario);
  if (!user) throw new Error(`Usuário não encontrado: ${usuario}`);
  if (!ativo && user.ativo && store.items.filter((item) => item.ativo).length <= 1) {
    throw new Error('Não é possível desativar a última conta ativa.');
  }
  user.ativo = ativo;
  await writeUsuarios(store);
  return user;
}

export async function removeUsuario(usuario: string): Promise<void> {
  const store = await readUsuarios();
  const index = store.items.findIndex((item) => item.usuario === usuario);
  if (index < 0) throw new Error(`Usuário não encontrado: ${usuario}`);
  if (store.items[index].ativo && store.items.filter((item) => item.ativo).length <= 1) {
    throw new Error('Não é possível remover a última conta ativa.');
  }
  store.items.splice(index, 1);
  await writeUsuarios(store);
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
