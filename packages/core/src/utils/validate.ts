import type { Item } from '../item';

export const hasTag = (item: Item, tag: string): boolean => {
  return item.base.type === tag || item.explicitMods.some(mod => mod.includes(tag));
};