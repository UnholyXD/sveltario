import { json } from '@sveltejs/kit';
import { getAlocacaoPorUsuario, readAlocacoes } from '$lib/server/storage/alocacoes';

export async function GET({ params }: { params: Record<string, string> }) {
  const { usuario } = params;
  const store = await readAlocacoes();
  const loc = store.items.find((entry) => entry.usuario === usuario);

  if (!loc) {
    return json({ usuario, equipamentos: [] });
  }

  return json(loc);
}
