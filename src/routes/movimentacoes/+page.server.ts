import { listMovimentacoes } from '$lib/server/storage/movimentacoes';

export async function load() {
  return {
    movimentacoes: await listMovimentacoes()
  };
}
