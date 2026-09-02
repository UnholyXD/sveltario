import { json } from '@sveltejs/kit';
import { getAllEquipment } from '$lib/server/storage/equipamentos';
import { findEquipmentOwner } from '$lib/server/storage/alocacoes';
import { getPessoaByUsuario } from '$lib/server/storage/pessoas';

export async function GET() {
  const equipamentos = await getAllEquipment();
  const response = [] as Array<Record<string, unknown>>;

  for (const equipamento of equipamentos) {
    const owner = await findEquipmentOwner(equipamento.tipo as never, String(equipamento.id));
    const pessoa = owner ? await getPessoaByUsuario(owner.usuario) : null;

    response.push({
      ...equipamento,
      alocadoPara: owner && pessoa ? { usuario: pessoa.usuario, nome: pessoa.nome } : null
    });
  }

  return json(response);
}
