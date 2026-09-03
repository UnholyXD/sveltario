import { isValidEquipmentType, type EquipmentType } from './equipamentos';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertAlocacaoPayload(payload: unknown): asserts payload is { usuario: string; tipo: EquipmentType; id: string } | { usuario: string; equipamentos: Array<{ tipo: EquipmentType; id: string }> } {
  if (!isRecord(payload)) {
    throw new Error('Payload de alocação inválido.');
  }

  if (typeof payload.usuario !== 'string' || payload.usuario.trim() === '') {
    throw new Error('Usuário inválido.');
  }

  if ('equipamentos' in payload) {
    if (!Array.isArray(payload.equipamentos) || payload.equipamentos.length === 0) {
      throw new Error('A lista de equipamentos é obrigatória.');
    }
    for (const equipamento of payload.equipamentos) {
      if (!isRecord(equipamento) || !isValidEquipmentType(equipamento.tipo) || typeof equipamento.id !== 'string' || equipamento.id.trim() === '') {
        throw new Error('Equipamento inválido para alocação.');
      }
    }
    return;
  }

  if (!isValidEquipmentType(payload.tipo) || typeof payload.id !== 'string' || payload.id.trim() === '') {
    throw new Error('Equipamento inválido para alocação.');
  }
}

export function assertTransferPayload(payload: unknown): asserts payload is { usuarioDestino: string } {
  if (!isRecord(payload)) {
    throw new Error('Payload de transferência inválido.');
  }

  if (typeof payload.usuarioDestino !== 'string' || payload.usuarioDestino.trim() === '') {
    throw new Error('Usuário de destino inválido.');
  }
}
