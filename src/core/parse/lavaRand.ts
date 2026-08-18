/** Idleon LavaRand (`utility/lavaRand.js`) — JS number / Math.imul semantics. */

function murmurHash(seed: number, start = 5381): number {
  let e = Math.imul(seed, -862048943);
  let t = start ^ (e = Math.imul((e << 15) | (e >>> 17), 461845907));
  t = (Math.imul((t << 13) | (t >>> 19), 5) + -430675100) | 0;
  t = Math.imul(t ^ (t >> 16), -2048144789);
  t = Math.imul(t ^ (t >> 13), -1028477387);
  return t ^ (t >> 16);
}

export class LavaRand {
  seed: number;
  seed2: number;

  constructor(seed: number) {
    this.seed = seed;
    this.seed2 = murmurHash(seed);
    if (this.seed === 0) this.seed = 1;
    if (this.seed2 === 0) this.seed2 = 1;
  }

  rand(): number {
    this.seed = 36969 * (65535 & this.seed) + (this.seed >> 16);
    this.seed2 = 18000 * (65535 & this.seed2) + (this.seed2 >> 16);
    return ((1073741823 & (((this.seed << 16) + this.seed2) | 0)) % 10007) / 10007;
  }
}

export function lavaRandom1000(seed: number): number {
  return Math.floor(1000 * new LavaRand(seed).rand());
}

function lavaModuloIndex(seed: number, modulo: number): number {
  const random = lavaRandom1000(seed);
  if (modulo <= 0) return 0;
  return Math.round(random - Math.floor(random / modulo) * modulo);
}

/** Current-week ChipRepo RNG from IT `getChipsAndJewels` (size=1, i=0), before ChipRepo override. */
export function labWeekRotation(weekSeed: number, chipsLength: number, jewelsLength: number): [number, number, number] {
  const rotation: [number, number, number] = [
    lavaModuloIndex(Math.round(weekSeed), chipsLength - 10),
    lavaModuloIndex(Math.round(weekSeed + 500), chipsLength),
    lavaModuloIndex(Math.round(weekSeed + 1000), jewelsLength)
  ];
  for (let slot = 0; slot < 3; slot += 1) {
    const tempRotation: number[] = [];
    for (let pass = 0; pass < 2; pass += 1) {
      const modulo = slot === 2 ? jewelsLength : chipsLength - Math.round(10 * (1 - slot));
      tempRotation.push(lavaModuloIndex(Math.round(weekSeed + 500 * slot + (-1 + 2 * pass)), modulo));
    }
    if (tempRotation[0] !== rotation[slot]) continue;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const modulo = slot === 2 ? jewelsLength : chipsLength - Math.round(10 * (1 - slot));
      const index = lavaModuloIndex(Math.round(weekSeed + 500 * slot + 765 * (attempt + 1)), modulo);
      if (tempRotation[0] !== index && tempRotation[1] !== index) {
        rotation[slot] = index;
        break;
      }
    }
  }
  return rotation;
}

export function lavaListIndex(random: number, length: number): number {
  if (length <= 0) return 0;
  return Math.round(random - Math.floor(random / length) * length);
}
