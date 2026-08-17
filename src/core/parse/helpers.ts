export function tryToParse(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  const first = trimmed[0];
  if (first !== '{' && first !== '[' && first !== '"') return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export function asArray<T = unknown>(value: unknown): T[] {
  const parsed = tryToParse(value);
  return Array.isArray(parsed) ? (parsed as T[]) : [];
}

export function asRecord(value: unknown): Record<string, unknown> {
  const parsed = tryToParse(value);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  return {};
}
