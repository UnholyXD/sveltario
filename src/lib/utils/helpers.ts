export const isNonEmptyArray = <T>(value: T[] | undefined): value is T[] =>
  Array.isArray(value) && value.length > 0;

export const createSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
