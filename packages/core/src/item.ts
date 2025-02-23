export interface ItemBase<Y = string> {
  name: string;
  type: Y;
  implicitMods: string[];
}

export interface Item<T = string, R = string, Y = string> {
  id: string;
  base: ItemBase<Y>;
  rarity: R;
  explicitMods: T[];
}

export const createItem = <T = string, R = string, Y = string>(
  base: ItemBase<Y>,
  rarity: R,
  idGenerator: () => string
): Item<T, R, Y> => {
  return {
    id: idGenerator(),
    base,
    rarity,
    explicitMods: [] as T[],
  };
};

export const canAddMods = <T, R, Y>(item: Item<T, R, Y>, maxMods: number): boolean => {
  return item.explicitMods.length < maxMods;
};

// Utility function for serialization
export const serializeItem = <T, R, Y>(item: Item<T, R, Y>): string => {
  return JSON.stringify({
    id: item.id,
    base: item.base.name,
    rarity: item.rarity,
    implicitMods: item.base.implicitMods,
    explicitMods: item.explicitMods,
  });
};