import { describe, it, expect } from 'vitest';
import { createCrucible} from '../src';
import { ChaosOrb, ExaltedOrb } from '../src/currency';
import { ItemBase } from '../src/item';
import { Mod } from '../src/mod';

// Inline fixtures for item bases
const OneHandedWeaponBases: Record<string, ItemBase> = {
  'Rusted Sword': {
    name: 'Rusted Sword',
    type: '1h_weapon' as const,
    implicitMods: ['+5% Critical Strike Chance'],
  },
  'Rusted Hatchet': {
    name: 'Rusted Hatchet',
    type: '1h_weapon' as const,
    implicitMods: ['+6 Attack Speed'],
  },
};

// Inline fixtures for mods
const BasicMods: Mod[] = [
  {
    id: 'str1',
    text: (v) => `+${v[0]} to Strength`,
    tags: ['attribute'],
    weights: { default: 100 },
    magnitudes: [{ min: 8, max: 12 }],
    family: 'Strength',
  },
  {
    id: 'dex1',
    text: (v) => `+${v[0]} to Dexterity`,
    tags: ['attribute'],
    weights: { default: 100 },
    magnitudes: [{ min: 8, max: 12 }],
    family: 'Dexterity',
  },
  {
    id: 'phys1',
    text: (v) => `Adds ${v[0]} to ${v[1]} Physical Damage`,
    tags: ['damage', 'physical'],
    weights: { default: 100, '1h_weapon': 150 },
    magnitudes: [{ min: 4, max: 6 }, { min: 12, max: 18 }],
    family: 'PhysicalDamage',
  },
];

describe('Mutator System', () => {
  // Initialize crucible with inline mod pool
  const crucible = createCrucible({
    idGenerator: () => `test_id_${Math.random().toString(36).slice(2)}`, // Unique IDs for tests
    maxModsPerItem: 6,
    modPool: BasicMods,
  });
  const mutator = crucible.mutator;

  it('applies Chaos Orb to reroll mods on a rare item', () => {
    const base = OneHandedWeaponBases['Rusted Sword'];
    const item = crucible.createItem(base, 'rare');
    item.explicitMods = ['+10 to Strength', '+5 to Dexterity'];

    const result = mutator.apply(ChaosOrb, item);
    expect(result).not.toBeInstanceOf(Error);
    if (result instanceof Error) return;

    expect(result.explicitMods.length).toBeGreaterThanOrEqual(3);
    expect(result.explicitMods.length).toBeLessThanOrEqual(6);
    expect(result.explicitMods).not.toEqual(item.explicitMods); // Mods should be rerolled
    expect(result.base.implicitMods).toEqual(base.implicitMods); // Implicits unchanged

    // Game designer note: Chaos Orb rerolls all explicit mods, ideal for players seeking a fresh stat combo.
    // Example: A warrior might use this to swap defensive stats for offensive ones on a sword.
  });

  it('applies Exalted Orb to add a mod to a rare item', () => {
    const base = OneHandedWeaponBases['Rusted Hatchet'];
    const item = crucible.createItem(base, 'rare');
    item.explicitMods = ['+12 to Dexterity'];

    const result = mutator.apply(ExaltedOrb, item);
    expect(result).not.toBeInstanceOf(Error);
    if (result instanceof Error) return;

    expect(result.explicitMods.length).toBe(2);
    expect(result.explicitMods[0]).toBe('+12 to Dexterity'); // Original mod preserved
    expect(result.explicitMods[1]).not.toBe('+12 to Dexterity'); // New mod added
    expect(result.base.implicitMods).toEqual(base.implicitMods);

    // Game designer note: Exalted Orb adds a rare mod, perfect for late-game optimization.
    // Example: A rogue might add "+Physical Damage" to a hatchet already boosting dexterity.
  });

  it('rolls back a transaction to restore original item state', () => {
    const base = OneHandedWeaponBases['Rusted Sword'];
    const item = crucible.createItem(base, 'rare');
    const originalMods = ['+8 to Strength'];
    item.explicitMods = originalMods.slice();

    const result = mutator.apply(ChaosOrb, item);
    expect(result).not.toBeInstanceOf(Error);
    if (result instanceof Error) return;

    const tx = mutator.log[0];
    const rolledBack = mutator.rollback(tx.id);
    expect(rolledBack).not.toBeInstanceOf(Error);
    if (rolledBack instanceof Error) return;

    expect(rolledBack.explicitMods).toEqual(originalMods);
    expect(rolledBack.base.implicitMods).toEqual(base.implicitMods);
    expect(rolledBack.id).toBe(item.id); // Same item ID preserved

    // Game designer note: Rollback ensures crafting mistakes can be undone, enhancing player trust.
    // Example: A mage accidentally rerolls a perfect staff and can revert to keep their +Strength.
  });

  it('rejects Chaos Orb application on a common item', () => {
    const base = OneHandedWeaponBases['Rusted Hatchet'];
    const item = crucible.createItem(base, 'common');

    const result = mutator.apply(ChaosOrb, item);
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('Cannot apply Chaos Orb');

    // Game designer note: Restrictions enforce rarity progression (e.g., common -> rare).
    // Example: A novice adventurer must first upgrade their gear with an Orb of Alchemy.
  });

  it('verifies item integrity after mutation', () => {
    const base = OneHandedWeaponBases['Rusted Sword'];
    const item = crucible.createItem(base, 'rare');
    item.explicitMods = ['+9 to Strength'];

    const result = mutator.apply(ChaosOrb, item);
    expect(result).not.toBeInstanceOf(Error);
    if (result instanceof Error) return;

    const isValid = mutator.verify(result);
    expect(isValid).toBe(true);

    // Tamper with the item to test verification failure
    const tampered = { ...result, explicitMods: ['+999 to Strength'] };
    expect(mutator.verify(tampered)).toBe(false);

    // Game designer note: Verification ensures item integrity, preventing exploits or corrupted data.
    // Example: A server can reject hacked items with impossible stats.
  });

  it('handles max mod limit with Exalted Orb', () => {
    const base = OneHandedWeaponBases['Rusted Hatchet'];
    const item = crucible.createItem(base, 'rare');
    item.explicitMods = Array(6).fill('+10 to Strength'); // Max mods reached

    const result = mutator.apply(ExaltedOrb, item);
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('Cannot apply Exalted Orb');

    // Game designer note: Max mod limits cap item power, encouraging diverse crafting strategies.
    // Example: A blacksmith must scour and recraft if they hit the limit but want new stats.
  });
});