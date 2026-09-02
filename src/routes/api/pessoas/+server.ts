import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { listPessoas, savePessoa } from '$lib/server/storage/pessoas';
import { assertPessoaPayload } from '$lib/server/validation/pessoas';

export async function GET() {
  const pessoas = await listPessoas();
  return json(pessoas);
}

export async function POST({ request, cookies }: { request: Request; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    assertPessoaPayload(body);

    const pessoas = await listPessoas();
    if (pessoas.some((pessoa) => pessoa.usuario === String(body.usuario))) {
      return json({ error: 'Usuário já cadastrado.' }, { status: 409 });
    }

    const pessoa = {
      nome: String(body.nome).trim(),
      usuario: String(body.usuario).trim(),
      setor: body.setor === null ? null : typeof body.setor === 'string' ? body.setor : String(body.setor),
      ativo: Boolean(body.ativo),
      observacoes: typeof body.observacoes === 'string' ? body.observacoes : ''
    };

    await savePessoa(pessoa);
    return json(pessoa, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao cadastrar pessoa.';
    return json({ error: message }, { status: 400 });
  }
}
