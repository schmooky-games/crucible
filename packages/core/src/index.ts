import { createItem, type Item, type ItemBase } from './item';
import { createMutator, type Mutator } from './mutator';
import { type Mod } from './mod';

export interface CrucibleConfig<T = string, R = string, Y = string> {
  idGenerator: 'cuidv2' | 'uuidv6' | (() => string);
  maxModsPerItem: number;
  modPool: Mod<T>[];
}

export interface Crucible<T = string, R = string, Y = string> {
  createItem: (base: ItemBase<Y>, rarity: R) => Item<T, R, Y>;
  mutator: Mutator<T, R, Y>;
}

export const createCrucible = <T = string, R = string, Y = string>(
  config: CrucibleConfig<T, R, Y>
): Crucible<T, R, Y> => {
  const idGen = typeof config.idGenerator === 'function' ? config.idGenerator : () => 'id_' + Math.random().toString(36);
  const mutator = createMutator<T, R, Y>(config.modPool);

  return {
    createItem: (base, rarity) => createItem(base, rarity, idGen),
    mutator,
  };
};
export * from "./currency";

export * from "./id";

export * from "./item";

export * from "./mod";

export * from "./mutator";

export * from "./random";

export { generateFlowchart } from "./visualization/flowchart";
