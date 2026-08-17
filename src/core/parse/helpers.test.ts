import { describe, expect, it } from 'vitest';
import { asIndexedNumbers, asIndexedRows } from './helpers';

describe('asIndexedNumbers', () => {
  it('reads JSON arrays', () => {
    expect(asIndexedNumbers([1, '2', 3])).toEqual([1, 2, 3]);
  });

  it('reads Idleon length-objects', () => {
    expect(asIndexedNumbers({ 0: 10, 1: 8, 3: 4, length: 4 })).toEqual([10, 8, 0, 4]);
  });
});

describe('asIndexedRows', () => {
  it('reads object-of-objects stamp/bubble rows', () => {
    expect(
      asIndexedRows({
        0: { 0: 10, 1: 8, length: 2 },
        1: { 0: 5, length: 1 }
      })
    ).toEqual([
      [10, 8],
      [5]
    ]);
  });
});
