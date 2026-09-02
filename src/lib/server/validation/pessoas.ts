export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertPessoaPayload(payload: unknown): asserts payload is Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new Error('Payload de pessoa inválido.');
  }

  const required = ['nome', 'usuario', 'ativo'];
  for (const field of required) {
    if (!(field in payload) || payload[field] === undefined) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  if (typeof payload.nome !== 'string' || payload.nome.trim() === '') {
    throw new Error('Nome inválido.');
  }

  if (typeof payload.usuario !== 'string' || payload.usuario.trim() === '') {
    throw new Error('Usuário inválido.');
  }

  if (typeof payload.ativo !== 'boolean') {
    throw new Error('Campo ativo deve ser booleano.');
  }
}
