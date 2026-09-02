import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { stdin, stdout } from 'node:process';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import { randomBytes, scryptSync } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const usuariosPath = path.join(projectRoot, 'config', 'usuarios.json');

const rl = readline.createInterface({ input: stdin, output: stdout });

function readQuestion(prompt) {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

async function readPipedValues() {
  if (stdin.isTTY) {
    return null;
  }

  const chunks = [];
  for await (const chunk of stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const values = Buffer.concat(chunks)
    .toString('utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '');

  return values.length > 0 ? values : null;
}

async function main() {
  const pipedValues = await readPipedValues();
  let usuario = '';
  let senha = '';
  let confirmacao = '';

  if (pipedValues) {
    usuario = String(pipedValues[0] ?? '').trim();
    senha = String(pipedValues[1] ?? '');
    confirmacao = String(pipedValues[2] ?? '');
  } else {
    usuario = String(await readQuestion('Usuário: ')).trim();
    senha = String(await readQuestion('Senha: '));
    confirmacao = String(await readQuestion('Confirmação da senha: '));
  }

  if (!usuario) {
    throw new Error('Usuário obrigatório.');
  }

  if (senha !== confirmacao) {
    throw new Error('As senhas não conferem.');
  }

  const raw = await readFile(usuariosPath, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data.items)) {
    throw new Error('Arquivo de usuários inválido.');
  }

  if (data.items.some((entry) => entry.usuario === usuario)) {
    throw new Error('Usuário já cadastrado.');
  }

  const salt = randomBytes(16);
  const hash = scryptSync(senha, salt, 64);

  data.items.push({
    usuario,
    salt: salt.toString('hex'),
    senhaHash: hash.toString('hex'),
    ativo: true
  });

  await writeFile(usuariosPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Usuário criado: ${usuario}`);
  rl.close();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Erro ao criar usuário.');
  rl.close();
  process.exit(1);
});
