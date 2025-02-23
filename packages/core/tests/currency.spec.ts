import { describe, it, expect } from 'vitest';
import { createCrucible } from '../src';
import { ChaosOrb } from '../src/currency';
import { allMods } from '../src/mod';
import { ItemBase } from '../src/item';

describe('Currency System', () => {
  const crucible = createCrucible({ idGenerator: () => 'test_id', maxModsPerItem: 6, modPool: allMods });
  const swordBase: ItemBase = { name: 'Rusted Sword', type: '1h_weapon', implicitMods: [] };

  it('applies Chaos Orb to a rare item', () => {
    const item = crucible.createItem(swordBase, 'rare');
    item.explicitMods = ['+8 to Strength'];
    const result = crucible.mutator.apply(ChaosOrb, item);
    expect(result).not.toBeInstanceOf(Error);
    if (result instanceof Error) return;
    expect(result.explicitMods.length).toBeGreaterThanOrEqual(3);
    expect(result.explicitMods).not.toContain('+8 to Strength');
  });
});