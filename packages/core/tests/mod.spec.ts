import { describe, it, expect } from 'vitest';
import { rollMod, canApplyMod, allMods } from '../src/mod';
import { createItem, ItemBase } from '../src/item';

describe('Mod System', () => {
  const swordBase: ItemBase = { name: 'Rusted Sword', type: '1h_weapon', implicitMods: [] };
  const item = createItem(swordBase, 'rare', () => 'test_id');

  it('rolls a mod with random values', () => {
    const mod = allMods[0]; // Physical Damage
    const rolled = rollMod(mod);
    const [min, max] = rolled.match(/\d+/g)!.map(Number);
    expect(min).toBeGreaterThanOrEqual(4);
    expect(min).toBeLessThanOrEqual(6);
    expect(max).toBeGreaterThanOrEqual(12);
    expect(max).toBeLessThanOrEqual(18);
  });

  it('prevents duplicate family mods', () => {
    item.explicitMods = ['Adds 4 to 12 Physical Damage'];
    const canApply = canApplyMod(allMods[0], item, item.explicitMods);
    expect(canApply).toBe(false);
    // Game designer note: Family restrictions prevent stacking similar mods, balancing item power.
  });
});