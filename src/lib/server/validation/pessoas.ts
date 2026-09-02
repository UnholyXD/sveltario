export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertPessoaPayload(
  payload: unknown,
  options: { requireIdentity?: boolean } = {}
): asserts payload is Record<string, unknown> {
  if (!isRecord(payload)) {
    throw new Error('Payload de pessoa inválido.');
  }

  const required = options.requireIdentity === false ? [] : ['nome', 'usuario', 'idEmpresa', 'ativo'];
  for (const field of required) {
    if (!(field in payload) || payload[field] === undefined) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }

  if ('nome' in payload && (typeof payload.nome !== 'string' || payload.nome.trim() === '')) {
    throw new Error('Nome inválido.');
  }

  if ('usuario' in payload && (typeof payload.usuario !== 'string' || payload.usuario.trim() === '')) {
    throw new Error('Usuário inválido.');
  }

  if ('idEmpresa' in payload && (typeof payload.idEmpresa !== 'string' || payload.idEmpresa.trim() === '')) {
    throw new Error('ID da empresa inválido.');
  }

  if ('ativo' in payload && typeof payload.ativo !== 'boolean') {
    throw new Error('Campo ativo deve ser booleano.');
  }

  if ('acessoPortaExterna' in payload && typeof payload.acessoPortaExterna !== 'boolean') {
    throw new Error('Campo acessoPortaExterna deve ser booleano.');
  }

  for (const field of ['email', 'telefone', 'cracha', 'setor']) {
    if (field in payload && payload[field] !== null && typeof payload[field] !== 'string') {
      throw new Error(`Campo ${field} deve ser texto ou nulo.`);
    }
  }

  if ('observacoes' in payload && typeof payload.observacoes !== 'string') {
    throw new Error('Campo observacoes deve ser texto.');
  }
}
