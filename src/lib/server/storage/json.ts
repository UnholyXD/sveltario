import { promises as fs } from 'node:fs';
import path from 'node:path';

export type JsonCollection<T = unknown> = {
  version: number;
  items: T[];
};

const fileLocks = new Map<string, Promise<void>>();

export const projectRoot = process.cwd();
export const dataDirectory = path.join(projectRoot, 'data');
export const configDirectory = path.join(projectRoot, 'config');

export async function ensureDirectory(directoryPath: string): Promise<void> {
  await fs.mkdir(directoryPath, { recursive: true });
}

export async function ensureFileExists(filePath: string, defaultContent = ''): Promise<void> {
  await ensureDirectory(path.dirname(filePath));

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, defaultContent, 'utf8');
  }
}

export async function readJsonFile<T>(filePath: string, options: { requireCollection?: boolean } = { requireCollection: true }): Promise<T> {
  const requireCollection = options.requireCollection ?? true;

  await ensureFileExists(filePath, requireCollection ? JSON.stringify({ version: 1, items: [] }, null, 2) + '\n' : '{}\n');

  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new Error(`Não foi possível ler o arquivo ${filePath}: ${(error as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error(`JSON inválido em ${filePath}.`);
  }

  if (requireCollection) {
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || !('items' in parsed)) {
      throw new Error(`Estrutura inválida em ${filePath}. Esperado { version, items }.`);
    }

    const record = parsed as Record<string, unknown>;
    if (typeof record.version !== 'number' || !Array.isArray(record.items)) {
      throw new Error(`Estrutura inválida em ${filePath}. Esperado version numérico e items em array.`);
    }
  }

  return parsed as T;
}

export async function writeJsonFile(filePath: string, payload: unknown): Promise<void> {
  await ensureDirectory(path.dirname(filePath));
  const serialized = `${JSON.stringify(payload, null, 2)}\n`;
  const tempPath = `${filePath}.tmp`;

  await withFileLock(filePath, async () => {
    await fs.writeFile(tempPath, serialized, 'utf8');

    try {
      await fs.rename(tempPath, filePath);
    } catch (error) {
      await fs.unlink(tempPath).catch(() => undefined);
      throw error;
    }

  });
}

/** Updates a JSON file while holding the same per-file lock used by writes. */
export async function updateJsonFile<T>(
  filePath: string,
  update: (current: T) => T | Promise<T>,
  defaultContent = '{}\n'
): Promise<T> {
  await ensureFileExists(filePath, defaultContent);

  return withFileLock(filePath, async () => {
    const current = JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
    const next = await update(current);
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
    try {
      await fs.rename(tempPath, filePath);
    } catch (error) {
      await fs.unlink(tempPath).catch(() => undefined);
      throw error;
    }
    return next;
  });
}

async function withFileLock<T>(filePath: string, operation: () => Promise<T>): Promise<T> {
  const previous = fileLocks.get(filePath) ?? Promise.resolve();
  let release: (() => void) | undefined;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });

  fileLocks.set(filePath, previous.then(() => next));

  await previous;

  try {
    return await operation();
  } finally {
    release?.();
    fileLocks.delete(filePath);
  }
}
