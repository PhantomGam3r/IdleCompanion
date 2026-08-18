import { describe, expect, it } from 'vitest';
import { LavaRand, labWeekRotation } from './lavaRand';

describe('LavaRand', () => {
  it('matches Idleon Toolbox first draws for a fixed seed', () => {
    const rng = new LavaRand(12345);
    expect(rng.rand()).toBeCloseTo(0.38203257719596284, 12);
    expect(rng.rand()).toBeCloseTo(0.3035874887578695, 12);
  });

  it('is deterministic across instances', () => {
    expect(new LavaRand(99).rand()).toBe(new LavaRand(99).rand());
  });

  it('computes the IT chip/jewel week rotation before ChipRepo override', () => {
    expect(labWeekRotation(0, 22, 24)).toEqual([6, 4, 16]);
    expect(labWeekRotation(2809, 22, 24)).toEqual([2, 17, 23]);
    expect(labWeekRotation(2810, 22, 24)).toEqual([0, 18, 15]);
  });
});
