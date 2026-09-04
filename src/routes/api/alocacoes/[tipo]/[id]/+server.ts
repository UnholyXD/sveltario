import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { findEquipmentOwner, transferEquipment } from '$lib/server/storage/alocacoes';
import { assertTransferPayload } from '$lib/server/validation/alocacoes';
import { assertValidEquipmentType } from '$lib/server/validation/equipamentos';
import { getEquipmentByTypeAndId } from '$lib/server/storage/equipamentos';
import { getPessoaByUsuario } from '$lib/server/storage/pessoas';
import { appendMovimentacao } from '$lib/server/storage/movimentacoes';

export async function PATCH({ params, request, cookies }: { params: Record<string, string>; request: Request; cookies: any }) {
  const session = getSessionFromRequest(cookies);
  if (!session) {
    return json({ error: 'Não autenticado.' }, { status: 401 });
  }

  const { tipo, id } = params;

  try {
    assertValidEquipmentType(tipo);
    const body = await request.json();
    assertTransferPayload(body);
    const [equipment, origemPessoa, destinoPessoa] = await Promise.all([
      getEquipmentByTypeAndId(tipo, id),
      (async () => {
        const owner = await findEquipmentOwner(tipo, id);
        return owner ? getPessoaByUsuario(owner.usuario) : null;
      })(),
      getPessoaByUsuario(body.usuarioDestino)
    ]);

    const result = await transferEquipment(tipo, id, body.usuarioDestino);
    if (equipment) {
      const entry = equipment as Record<string, unknown>;
      const equipamento = {
        tipo,
        id,
        marca: typeof entry.marca === 'string' ? entry.marca : '',
        modelo: typeof entry.modelo === 'string' ? entry.modelo : ''
      };
      await appendMovimentacao({
        acao: 'transferencia',
        executadoPor: session.usuario,
        equipamento,
        origem: origemPessoa ? { usuario: origemPessoa.usuario, nome: origemPessoa.nome } : null,
        destino: { usuario: destinoPessoa?.usuario ?? body.usuarioDestino, nome: destinoPessoa?.nome ?? body.usuarioDestino }
      });
    }
    return json({
      ok: true,
      tipo,
      id,
      usuarioOrigem: result.usuarioOrigem,
      usuarioDestino: result.usuarioDestino
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao transferir equipamento.';
    return json({ error: message }, { status: 400 });
  }
}
