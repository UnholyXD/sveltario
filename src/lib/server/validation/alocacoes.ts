import { isValidEquipmentType, type EquipmentType } from './equipamentos';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertAlocacaoPayload(payload: unknown): asserts payload is { usuario: string; tipo: EquipmentType; id: string } {
  if (!isRecord(payload)) {
    throw new Error('Payload de alocação inválido.');
  }

  if (typeof payload.usuario !== 'string' || payload.usuario.trim() === '') {
    throw new Error('Usuário inválido.');
  }

  if (!isValidEquipmentType(payload.tipo)) {
    throw new Error('Tipo de equipamento inválido para alocação.');
  }

  if (typeof payload.id !== 'string' || payload.id.trim() === '') {
    throw new Error('Identificador do equipamento inválido.');
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
