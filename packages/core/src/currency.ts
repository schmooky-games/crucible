
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

type OneOrTwo<T> = [T] | [T, T];

type NormalItem<T, R, Y> = Omit<Item<T, R, Y>, 'explicitMods' | 'rarity'> & {
  explicitMods: [];
  rarity: R; // Normal rarity (e.g., 'common')
};

type MagicItem<T, R, Y> = Omit<Item<T, R, Y>, 'explicitMods' | 'rarity'> & {
  explicitMods: [T] | [T, T];
  rarity: R; // Magic rarity (e.g., 'magic')
};

type RareItem<T, R, Y> = Omit<Item<T, R, Y>, 'explicitMods' | 'rarity'> & {
  explicitMods: T[]; // 3-6 enforced in mutator
  rarity: R; // Rare rarity (e.g., 'rare')
};

export const ChaosOrb: Currency<string, Rarity, ItemType> = {
  name: 'Chaos Orb',
  canApply: (item) => item.rarity === 'rare',
  mutator: (item, modPool): RareItem<string, Rarity, ItemType> => {
    const modCount = Math.floor(Math.random() * 4) + 3; // 3-6
    const newMods: string[] = [];
    for (let i = 0; i < modCount; i++) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newMods.push(rollMod(mod));
    }
    return { ...item, explicitMods: newMods };
  },
};

export const ExaltedOrb: Currency<string, Rarity, ItemType> = {
  name: 'Exalted Orb',
  canApply: (item) => item.rarity === 'rare' && item.explicitMods.length < 6,
  mutator: (item, modPool): RareItem<string, Rarity, ItemType> => {
    const newMods = [...item.explicitMods];
    const mod = modPool[Math.floor(Math.random() * modPool.length)];
    newMods.push(rollMod(mod));
    return { ...item, explicitMods: newMods };
  },
};

export const OrbOfAlchemy: Currency<string, Rarity, ItemType> = {
  name: 'Orb of Alchemy',
  canApply: (item) => item.rarity === 'common',
  mutator: (item, modPool): RareItem<string, Rarity, ItemType> => {
    const modCount = Math.floor(Math.random() * 4) + 3; // 3-6
    const newMods: string[] = [];
    for (let i = 0; i < modCount; i++) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newMods.push(rollMod(mod));
    }
    return { ...item, rarity: 'rare' as const, explicitMods: newMods };
  },
};

export const OrbOfAlteration: Currency<string, Rarity, ItemType> = {
  name: 'Orb of Alteration',
  canApply: (item) => item.rarity === 'magic',
  mutator: (item, modPool): MagicItem<string, Rarity, ItemType> => {
    const modCount = Math.random() < 0.5 ? 1 : 2;
    const newMods: string[] = [];
    for (let i = 0; i < modCount; i++) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newMods.push(rollMod(mod));
    }
    const explicitMods = (newMods.length === 1 ? [newMods[0]] : [newMods[0], newMods[1]]) as [string] | [string, string];
    return { ...item, explicitMods };
  },
};

type AnnulledItem<T, R, Y> = Item<T, R, Y>; // Could be 0 mods for Rare, 1-2 for Magic post-check

export const OrbOfAnnulment: Currency<string, Rarity, ItemType> = {
  name: 'Orb of Annulment',
  canApply: (item) => item.explicitMods.length > 0 && (item.rarity === 'magic' || item.rarity === 'rare'),
  mutator: (item): AnnulledItem<string, Rarity, ItemType> => {
    const newMods = [...item.explicitMods];
    const removeIndex = Math.floor(Math.random() * newMods.length);
    newMods.splice(removeIndex, 1);
    return { ...item, explicitMods: newMods };
  },
};

export const OrbOfTransmutation: Currency<string, Rarity, ItemType> = {
  name: 'Orb of Transmutation',
  canApply: (item) => item.rarity === 'common',
  mutator: (item, modPool): MagicItem<string, Rarity, ItemType> => {
    const modCount = Math.random() < 0.5 ? 1 : 2;
    const newMods: string[] = [];
    for (let i = 0; i < modCount; i++) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newMods.push(rollMod(mod));
    }
    const explicitMods = (newMods.length === 1 ? [newMods[0]] : [newMods[0], newMods[1]]) as [string] | [string, string];
    return { ...item, rarity: 'magic' as const, explicitMods };
  },
};

export const OrbOfScouring: Currency<string, Rarity, ItemType> = {
  name: 'Orb of Scouring',
  canApply: (item) => item.rarity === 'magic' || item.rarity === 'rare',
  mutator: (item): NormalItem<string, Rarity, ItemType> => ({
    ...item,
    rarity: 'common' as const,
    explicitMods: [],
  }),
};

export const RegalOrb: Currency<string, Rarity, ItemType> = {
  name: 'Regal Orb',
  canApply: (item) => item.rarity === 'magic',
  mutator: (item, modPool): RareItem<string, Rarity, ItemType> => {
    const newMods = [...item.explicitMods];
    const mod = modPool[Math.floor(Math.random() * modPool.length)];
    newMods.push(rollMod(mod));
    return { ...item, rarity: 'rare' as const, explicitMods: newMods };
  },
};

export const DivineOrb: Currency<string, Rarity, ItemType> = {
  name: 'Divine Orb',
  canApply: (item) => item.explicitMods.length > 0,
  mutator: (item, modPool): Item<string, Rarity, ItemType> => {
    const newMods: string[] = [];
    item.explicitMods.forEach(modText => {
      const mod = modPool.find(m => m.text(m.magnitudes.map(m => m.min)) === modText.split(/\d+/).join('#'));
      if (mod) newMods.push(rollMod(mod));
    });
    return { ...item, explicitMods: newMods };
  },
};

export const ArmourersScrap: Currency<string, Rarity, ItemType> = {
  name: 'Armourer’s Scrap',
  canApply: (item) => item.quality < 20 && item.base.type === 'chest_armor',
  mutator: (item): Item<string, Rarity, ItemType> => ({
    ...item,
    quality: Math.min(item.quality + 5, 20),
  }),
};

export const EssenceOfGreed: Currency<string, Rarity, ItemType> = {
  name: 'Essence of Greed',
  canApply: (item) => item.rarity === 'common',
  mutator: (item, modPool): RareItem<string, Rarity, ItemType> => {
    const newMods: string[] = ['+25 to maximum Life'];
    const modCount = Math.floor(Math.random() * 4) + 2; // 2-5
    for (let i = 0; i < modCount; i++) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newMods.push(rollMod(mod));
    }
    return { ...item, rarity: 'rare' as const, explicitMods: newMods };
  },
};

export const PrismaticFossil: Currency<string, Rarity, ItemType> = {
  name: 'Prismatic Fossil',
  canApply: (item) => item.rarity === 'common' || item.rarity === 'magic' || item.rarity === 'rare',
  mutator: (item, modPool): RareItem<string, Rarity, ItemType> => {
    const elementalMods = modPool.filter(m => m.tags.includes('elemental'));
    const modCount = Math.floor(Math.random() * 4) + 3;
    const newMods: string[] = [];
    for (let i = 0; i < modCount; i++) {
      const mod = elementalMods[Math.floor(Math.random() * elementalMods.length)];
      newMods.push(rollMod(mod));
    }
    return { ...item, rarity: 'rare' as const, explicitMods: newMods };
  },
};

export const HarvestReforgeLife: Currency<string, Rarity, ItemType> = {
  name: 'Harvest Reforge Life',
  canApply: (item) => item.rarity === 'rare',
  mutator: (item, modPool): RareItem<string, Rarity, ItemType> => {
    const lifeMods = modPool.filter(m => m.tags.includes('life'));
    const newMods: string[] = [rollMod(lifeMods[Math.floor(Math.random() * lifeMods.length)])];
    const modCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < modCount; i++) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newMods.push(rollMod(mod));
    }
    return { ...item, explicitMods: newMods };
  },
};

export const VeiledChaosOrb: Currency<string, Rarity, ItemType> = {
  name: 'Veiled Chaos Orb',
  canApply: (item) => item.rarity === 'rare',
  mutator: (item, modPool): RareItem<string, Rarity, ItemType> => {
    const newMods: string[] = ['Veiled Modifier'];
    const modCount = Math.floor(Math.random() * 4) + 2;
    for (let i = 0; i < modCount; i++) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newMods.push(rollMod(mod));
    }
    return { ...item, explicitMods: newMods };
  },
};

export const EldritchExaltedOrb: Currency<string, Rarity, ItemType> = {
  name: 'Eldritch Exalted Orb',
  canApply: (item) => item.rarity === 'rare' && item.base.eldritchImplicits !== undefined,
  mutator: (item): Item<string, Rarity, ItemType> => {
    const newItem = { ...item };
    newItem.base.eldritchImplicits = newItem.base.eldritchImplicits || [];
    newItem.base.eldritchImplicits.push('+10% increased Damage');
    return newItem;
  },
};

export const MultiModCraft: Currency<string, Rarity, ItemType> = {
  name: 'Can have up to 3 Crafted Modifiers',
  canApply: (item) => !item.craftedMods || item.craftedMods.length < 3,
  mutator: (item): Item<string, Rarity, ItemType> => {
    const newItem = { ...item, craftedMods: item.craftedMods || [] };
    newItem.craftedMods.push('Crafted Modifier Placeholder');
    return newItem;
  },
};

export const VaalOrb: Currency<string, Rarity, ItemType> = {
  name: 'Vaal Orb',
  canApply: (item) => !item.corrupted,
  mutator: (item, modPool): Item<string, Rarity, ItemType> => {
    const newItem = { ...item, corrupted: true };
    if (Math.random() < 0.5) {
      const mod = modPool[Math.floor(Math.random() * modPool.length)];
      newItem.explicitMods.push(rollMod(mod));
    }
    return newItem;
  },
};  