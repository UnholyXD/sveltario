import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { getAlocacaoPorUsuario } from '$lib/server/storage/alocacoes';
import { listEquipmentByType } from '$lib/server/storage/equipamentos';
import { getPessoaByUsuario, listPessoas, savePessoa } from '$lib/server/storage/pessoas';
import { assertPessoaPayload } from '$lib/server/validation/pessoas';

export async function GET({ params }: { params: Record<string, string> }) {
  const { usuario } = params;
  const pessoa = await getPessoaByUsuario(usuario);

  if (!pessoa) {
    return json({ error: 'Pessoa não encontrada.' }, { status: 404 });
  }

  const alocacao = await getAlocacaoPorUsuario(usuario);
  const equipamentos = [] as Array<Record<string, unknown>>;

  if (alocacao) {
    for (const item of alocacao.equipamentos) {
      const inventory = await listEquipmentByType(item.tipo);
      const equipment = inventory.find((entry) => String((entry as Record<string, unknown>)[item.tipo === 'computador' || item.tipo === 'monitor' ? 'patrimonio' : 'id'] ?? '') === item.id);

      if (equipment) {
        const entry = equipment as Record<string, unknown>;
        equipamentos.push({
          tipo: item.tipo,
          id: item.id,
          marca: typeof entry.marca === 'string' ? entry.marca : '',
          modelo: typeof entry.modelo === 'string' ? entry.modelo : '',
          estado: typeof entry.estado === 'string' ? entry.estado : ''
        });
      }
    }
  }

  return json({
    ...pessoa,
    equipamentos
  });
}

export async function PATCH({ params, request, cookies }: { params: Record<string, string>; request: Request; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { usuario } = params;
  const pessoa = await getPessoaByUsuario(usuario);

  if (!pessoa) {
    return json({ error: 'Pessoa não encontrada.' }, { status: 404 });
  }

  try {
    const body = await request.json();
    assertPessoaPayload(body, { requireIdentity: false });

    if (typeof body.usuario === 'string' && body.usuario !== usuario) {
      return json({ error: 'O usuário não pode ser alterado.' }, { status: 400 });
    }

    if ('idEmpresa' in body && body.idEmpresa !== pessoa.idEmpresa) {
      return json({ error: 'O ID da empresa não pode ser alterado.' }, { status: 400 });
    }

    const alocacao = await getAlocacaoPorUsuario(usuario);
    if (body.ativo === false && alocacao && alocacao.equipamentos.length > 0) {
      return json({ error: 'Não é possível desativar pessoa com equipamentos alocados.' }, { status: 409 });
    }

    const atualizada = {
      nome: typeof body.nome === 'string' ? body.nome.trim() : pessoa.nome,
      usuario: pessoa.usuario,
      idEmpresa: pessoa.idEmpresa,
      email: typeof body.email === 'string' ? body.email : pessoa.email ?? null,
      telefone: typeof body.telefone === 'string' ? body.telefone : pessoa.telefone ?? null,
      cracha: typeof body.cracha === 'string' ? body.cracha : pessoa.cracha ?? null,
      setor: body.setor === null ? null : typeof body.setor === 'string' ? body.setor : pessoa.setor,
      acessoPortaExterna: typeof body.acessoPortaExterna === 'boolean' ? body.acessoPortaExterna : pessoa.acessoPortaExterna ?? false,
      ativo: typeof body.ativo === 'boolean' ? body.ativo : pessoa.ativo,
      observacoes: typeof body.observacoes === 'string' ? body.observacoes : pessoa.observacoes
    };

    await savePessoa(atualizada);
    return json(atualizada);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar pessoa.';
    return json({ error: message }, { status: 400 });
  }
}
