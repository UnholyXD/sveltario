export const VALID_EQUIPMENT_TYPES = ['computador', 'monitor', 'mouse', 'teclado', 'fone', 'outros'] as const;
export const VALID_STATES = ['novo', 'bom', 'marcas_de_uso', 'danificado', 'manutencao', 'baixado'] as const;

export type EquipmentType = (typeof VALID_EQUIPMENT_TYPES)[number];
export type EquipmentState = (typeof VALID_STATES)[number];

export function isValidEquipmentType(value: unknown): value is EquipmentType {
  return typeof value === 'string' && VALID_EQUIPMENT_TYPES.includes(value as EquipmentType);
}

export function assertValidEquipmentType(value: unknown): asserts value is EquipmentType {
  if (!isValidEquipmentType(value)) {
    throw new Error('Tipo de equipamento inválido.');
  }
}

export function assertValidState(value: unknown): asserts value is EquipmentState {
  if (typeof value !== 'string' || !VALID_STATES.includes(value as EquipmentState)) {
    throw new Error(`Estado inválido. Valores aceitos: ${VALID_STATES.join(', ')}`);
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function assertRequiredFields(payload: unknown, requiredFields: string[]): void {
  if (!isRecord(payload)) {
    throw new Error('Payload inválido.');
  }

  for (const field of requiredFields) {
    if (!(field in payload) || payload[field] === undefined || payload[field] === null) {
      throw new Error(`Campo obrigatório ausente: ${field}`);
    }
  }
}

export function assertUniqueIdentifier(items: Array<Record<string, unknown>>, key: string, value: unknown, label: string): void {
  const duplicate = items.some((item) => String(item[key]) === String(value));
  if (duplicate) {
    throw new Error(`${label} duplicado: ${String(value)}`);
  }
}
