import type { Item } from './item';
import type { Currency } from './currency';
import { generateId } from './id';
import { Mod } from './mod';

export interface Transaction<T = string, R = string, Y = string> {
  id: string;
  itemBefore: Item<T, R, Y>;
  itemAfter: Item<T, R, Y>;
  currency: string;
  timestamp: number;
  rollback: () => Item<T, R, Y>;
}

export interface MutatorContext<T = string, R = string, Y = string> {
  modPool: Mod<T>[];
  transactionLog: Transaction<T, R, Y>[];
}

export class Mutator<T = string, R = string, Y = string> {
  constructor(public context: MutatorContext<T, R, Y>) {}

  apply(currency: Currency<T, R, Y>, item: Item<T, R, Y>): Item<T, R, Y> | Error {
    if (!currency.canApply(item)) {
      return new Error(`Cannot apply ${currency.name} to this item`);
    }
    const itemBefore = { ...item };
    const itemAfter = currency.mutator(structuredClone(item), this.context.modPool);
    const transaction: Transaction<T, R, Y> = {
      id: generateId(() => 'txn_' + Date.now() + Math.random().toString(36).slice(2)),
      itemBefore,
      itemAfter,
      currency: currency.name,
      timestamp: Date.now(),
      rollback: () => ({ ...itemBefore }),
    };
    this.context.transactionLog.push(transaction);
    return itemAfter;
  }

  rollback(transactionId: string): Item<T, R, Y> | Error {
    const tx = this.context.transactionLog.find(t => t.id === transactionId);
    if (!tx) return new Error('Transaction not found');
    return tx.rollback();
  }

  verify(item: Item<T, R, Y>): boolean {
    const lastTx = this.context.transactionLog[this.context.transactionLog.length - 1];
    return lastTx ? JSON.stringify(lastTx.itemAfter) === JSON.stringify(item) : true;
  }
}

export const createMutator = <T = string, R = string, Y = string>(
  modPool: Mod<T>[]
): Mutator<T, R, Y> => {
  return new Mutator({ modPool, transactionLog: [] });
};