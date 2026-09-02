import { json } from '@sveltejs/kit';
import { getSessionFromRequest } from '$lib/server/auth/session';
import { transferEquipment } from '$lib/server/storage/alocacoes';
import { assertTransferPayload } from '$lib/server/validation/alocacoes';
import { assertValidEquipmentType } from '$lib/server/validation/equipamentos';

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

    const result = await transferEquipment(tipo, id, body.usuarioDestino);
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
