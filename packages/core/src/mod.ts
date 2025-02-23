import { Item } from './item';
import { randomIntFromInterval } from './random';

export interface Mod<T = string> {
  id: string;
  text: (values: number[]) => T;
  tags: string[];
  weights: Record<string, number>;
  magnitudes: { min: number; max: number }[];
  family?: string;
}
export const rollMod = <T>(mod: Mod<T>): T => {
  const values = mod.magnitudes.map(m => randomIntFromInterval(m.min, m.max));
  return mod.text(values);
};

export const canApplyMod = <T>(
  mod: Mod<T>,
  item: Item<T>,
  existingMods: T[],
  conditions?: (item: Item<T>) => boolean
): boolean => {
  const modFamilies = existingMods.map(m => {
    // Since T might not be string, we can't use string methods directly
    // Assume allMods contains all possible mods for lookup
    return allMods.find(modTemplate => modTemplate.text(modTemplate.magnitudes.map(m => m.min)) === m)?.family;
  });
  if (mod.family && modFamilies.includes(mod.family)) return false;
  return conditions ? conditions(item) : true;
};

// Example mod pool (updated to be generic)
export const allMods: Mod<string>[] = [
  {
    id: 'phys1',
    text: (v) => `Adds ${v[0]} to ${v[1]} Physical Damage` as const,
    tags: ['damage', 'physical'],
    weights: { default: 100, '1h_weapon': 150 },
    magnitudes: [{ min: 4, max: 6 }, { min: 12, max: 18 }],
    family: 'PhysicalDamage',
  },
  {
    id: 'str1',
    text: (v) => `+${v[0]} to Strength` as const,
    tags: ['attribute'],
    weights: { default: 1000 },
    magnitudes: [{ min: 8, max: 12 }],
    family: 'Strength',
  },
];