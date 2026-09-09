import { error } from '@sveltejs/kit';
import { getMovimentacaoById } from '$lib/server/storage/movimentacoes';

function text(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export async function load({ params }) {
  const movimentacao = await getMovimentacaoById(params.movimentacaoId);
  if (!movimentacao || movimentacao.acao !== 'troca' || !movimentacao.equipamentoAnterior || !movimentacao.equipamentoNovo) {
    throw error(404, 'Movimentação de troca não encontrada.');
  }

  const pessoa = movimentacao.origem ?? movimentacao.destino;
  if (!pessoa || text(pessoa.nome) === '') {
    throw error(404, 'Colaborador da troca não encontrado.');
  }

  return {
    usuario: pessoa.usuario,
    pessoa: {
      nome: text(pessoa.nome),
      setor: text(pessoa.setor),
      cargo: text(pessoa.cargo)
    },
    anterior: movimentacao.equipamentoAnterior,
    novo: movimentacao.equipamentoNovo,
    data: new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(movimentacao.data))
  };
}
