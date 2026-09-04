import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { getAlocacaoPorUsuario, readAlocacoes, writeAlocacoes } from '$lib/server/storage/alocacoes';
import { listEquipmentByType } from '$lib/server/storage/equipamentos';
import { getPessoaByUsuario, readPessoas, writePessoas } from '$lib/server/storage/pessoas';
import { assertPessoaPayload } from '$lib/server/validation/pessoas';

export async function GET({ params, cookies }: { params: Record<string, string>; cookies: any }) {
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

  return json({ ...pessoa, equipamentos });
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

    const desativando = pessoa.ativo && atualizada.ativo === false;
    const pessoasStore = await readPessoas();
    const alocacoesStore = desativando ? await readAlocacoes() : null;
    const alocacaoAnterior = alocacoesStore?.items.find((entry) => entry.usuario === usuario);

    if (desativando && alocacoesStore && alocacaoAnterior) {
      const alocacaoSemEquipamentos = {
        ...alocacaoAnterior,
        equipamentos: []
      };
      const alocacaoIndex = alocacoesStore.items.indexOf(alocacaoAnterior);
      alocacoesStore.items[alocacaoIndex] = alocacaoSemEquipamentos;
      await writeAlocacoes(alocacoesStore);
    }

    const pessoaIndex = pessoasStore.items.findIndex((entry) => entry.usuario === usuario);
    pessoasStore.items[pessoaIndex] = atualizada;

    try {
      await writePessoas(pessoasStore);
    } catch (error) {
      if (desativando && alocacoesStore && alocacaoAnterior) {
        alocacoesStore.items[alocacoesStore.items.findIndex((entry) => entry.usuario === usuario)] = alocacaoAnterior;
        await writeAlocacoes(alocacoesStore);
      }
      throw error;
    }

    return json(atualizada);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar pessoa.';
    return json({ error: message }, { status: 400 });
  }
}
