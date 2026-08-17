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

/** Idleon often stores lists as `{ "0": n, "1": n, length: n }` instead of JSON arrays. */
export function asIndexedNumbers(value: unknown): number[] {
  const parsed = tryToParse(value);
  if (Array.isArray(parsed)) return parsed.map((item) => asNumber(item));
  if (parsed && typeof parsed === 'object') {
    const rec = parsed as Record<string, unknown>;
    const keys = Object.keys(rec)
      .filter((key) => key !== 'length' && /^\d+$/.test(key))
      .map(Number)
      .sort((a, b) => a - b);
    if (keys.length === 0) return [];
    const max = keys[keys.length - 1] ?? 0;
    const out = Array.from({ length: max + 1 }, () => 0);
    for (const key of keys) {
      out[key] = asNumber(rec[String(key)]);
    }
    return out;
  }
  return [];
}

export function asIndexedRows(value: unknown): number[][] {
  const parsed = tryToParse(value);
  if (Array.isArray(parsed)) return parsed.map((row) => asIndexedNumbers(row));
  if (parsed && typeof parsed === 'object') {
    const rec = parsed as Record<string, unknown>;
    const keys = Object.keys(rec)
      .filter((key) => key !== 'length' && /^\d+$/.test(key))
      .map(Number)
      .sort((a, b) => a - b);
    return keys.map((key) => asIndexedNumbers(rec[String(key)]));
  }
  return [];
}

export function forIndexed(value: unknown, visit: (index: number, item: unknown) => void): void {
  const parsed = tryToParse(value);
  if (Array.isArray(parsed)) {
    parsed.forEach((item, index) => visit(index, item));
    return;
  }
  if (parsed && typeof parsed === 'object') {
    const rec = parsed as Record<string, unknown>;
    const keys = Object.keys(rec)
      .filter((key) => key !== 'length' && /^\d+$/.test(key))
      .map(Number)
      .sort((a, b) => a - b);
    for (const key of keys) visit(key, rec[String(key)]);
  }
}

export function firstNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const nums = asIndexedNumbers(value);
  if (nums.length > 0) return nums[0] ?? 0;
  return asNumber(value);
}

export function toList(value: unknown): unknown[] {
  const parsed = tryToParse(value);
  if (Array.isArray(parsed)) return parsed;
  const out: unknown[] = [];
  forIndexed(parsed, (index, item) => {
    out[index] = item;
  });
  return out;
}

export function countIndexedKeys(value: unknown): number {
  let count = 0;
  forIndexed(value, () => {
    count += 1;
  });
  return count;
}
