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

async function main() {
  const usuario = String(await readQuestion('Usuário: ')).trim();
  const senha = String(await readQuestion('Nova senha: '));
  const confirmacao = String(await readQuestion('Confirmação da senha: '));

  if (!usuario) {
    throw new Error('Usuário obrigatório.');
  }

  if (!senha) {
    throw new Error('Nova senha obrigatória.');
  }

  if (senha !== confirmacao) {
    throw new Error('As senhas não conferem.');
  }

  const data = JSON.parse(await readFile(usuariosPath, 'utf8'));
  if (!Array.isArray(data.items)) {
    throw new Error('Arquivo de usuários inválido.');
  }

  const user = data.items.find((entry) => entry.usuario === usuario);
  if (!user) {
    throw new Error(`Usuário não encontrado: ${usuario}`);
  }

  const salt = randomBytes(16);
  const hash = scryptSync(senha, salt, 64);
  user.salt = salt.toString('hex');
  user.senhaHash = hash.toString('hex');

  await writeFile(usuariosPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`Senha alterada: ${usuario}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : 'Erro ao alterar senha.');
    process.exitCode = 1;
  })
  .finally(() => rl.close());
