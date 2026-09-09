import { error } from '@sveltejs/kit';

function parseObject(value: string | null, label: string): Record<string, unknown> {
  if (!value) throw error(400, `Dados do termo de troca ausentes: ${label}.`);
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw error(400, 'Não foi possível carregar os dados do termo de troca.');
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function load({ params, url }) {
  const pessoa = parseObject(url.searchParams.get('pessoa'), 'colaborador');
  const anterior = parseObject(url.searchParams.get('anterior'), 'equipamento anterior');
  const novo = parseObject(url.searchParams.get('novo'), 'equipamento novo');

  if (text(pessoa.nome) === '' || text(anterior.tipo) === '' || text(novo.tipo) === '') {
    throw error(400, 'Dados inválidos para o termo de troca.');
  }

  return {
    usuario: params.usuario,
    pessoa: {
      nome: text(pessoa.nome),
      setor: text(pessoa.setor),
      cargo: text(pessoa.cargo)
    },
    anterior,
    novo,
    executadoPor: text(url.searchParams.get('executadoPor')),
    data: new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(text(url.searchParams.get('data'))))
  };
}
