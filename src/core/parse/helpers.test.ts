import { describe, expect, it } from 'vitest';
import { asIndexedNumbers, asIndexedRows, countIndexedKeys, firstNumber, numberToLetter } from './helpers';

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

describe('firstNumber', () => {
  it('reads a scalar or the first indexed value', () => {
    expect(firstNumber(42)).toBe(42);
    expect(firstNumber([9001, 2])).toBe(9001);
    expect(firstNumber({ 0: 25000, 1: 3 })).toBe(25000);
  });
});

describe('countIndexedKeys', () => {
  it('counts numeric keys including zeros', () => {
    expect(countIndexedKeys({ 0: 10, 1: 0, 4: 3, length: 5 })).toBe(3);
  });
});

describe('numberToLetter', () => {
  it('maps jade-emporium indices to unlock letters', () => {
    expect(numberToLetter(0)).toBe('a');
    expect(numberToLetter(22)).toBe('w');
    expect(numberToLetter(38)).toBe('M');
  });
});
