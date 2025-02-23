
import type { Item } from './item';
import { rollMod, type Mod } from './mod';

export interface Currency<T = string, R = string, Y = string> {
  name: string;
  mutator: (item: Item<T, R, Y>, modPool: Mod<T>[]) => Item<T, R, Y>;
  canApply: (item: Item<T, R, Y>) => boolean;
}

// Example rarities for demo purposes (user-defined)
type Rarity = 'common' | 'magic' | 'rare' | 'unique';
type ItemType = '1h_weapon' | 'chest_armor' | 'ring' | 'currency';

export const ChaosOrb: Currency<string, Rarity, ItemType> = {
  name: 'Chaos Orb',
  canApply: (item) => item.rarity === 'rare',
  mutator: (item, modPool) => {
    const newItem = { ...item, explicitMods: [] as string[] };
    const modCount = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < modCount; i++) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newItem.explicitMods.push(rollMod(mod));
    }
    return newItem;
  },
};

export const ExaltedOrb: Currency<string, Rarity, ItemType> = {
  name: 'Exalted Orb',
  canApply: (item) => item.rarity === 'rare' && item.explicitMods.length < 6,
  mutator: (item, modPool) => {
    const newItem = { ...item };
    const mod = modPool[Math.floor(Math.random() * modPool.length)];
    newItem.explicitMods.push(rollMod(mod));
    return newItem;
  },
};