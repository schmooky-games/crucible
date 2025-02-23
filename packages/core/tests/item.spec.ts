import { describe, it, expect } from 'vitest';
import { createItem, ItemBase } from '../src/item';

describe('Item System', () => {
  const mockIdGen = () => 'test_id_123';
  const swordBase: ItemBase = {
    name: 'Rusted Sword',
    type: '1h_weapon',
    implicitMods: ['+5% Critical Strike Chance'],
  };

  it('creates a common item with implicit mods', () => {
    const item = createItem(swordBase, 'common', mockIdGen);
    expect(item.id).toBe('test_id_123');
    expect(item.base.name).toBe('Rusted Sword');
    expect(item.rarity).toBe('common');
    expect(item.explicitMods).toEqual([]);
    expect(item.base.implicitMods).toEqual(['+5% Critical Strike Chance']);
  });

  it('serializes an item correctly', () => {
    const item = createItem(swordBase, 'rare', mockIdGen);
    item.explicitMods.push('+10 to Strength');
    const serialized = item.serialize();
    expect(serialized).toBe(
      '{"id":"test_id_123","base":"Rusted Sword","rarity":"rare","implicitMods":["+5% Critical Strike Chance"],"explicitMods":["+10 to Strength"]}'
    );
    // Game designer note: Serialization ensures items can be saved or networked easily.
  });
});