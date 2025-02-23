import { createCrucible, type Item, type ItemBase } from '@crucible/core';
import { ChaosOrb, ExaltedOrb } from '@crucible/core';
import { generateFlowchart } from '@crucible/core';
import { updateElement, addEvent } from './ui';

type Rarity = 'common' | 'magic' | 'rare' | 'unique';
type ItemType = 'weapon' | 'armor' | 'accessory';

const swordBase: ItemBase<ItemType> = {
  name: 'Rusted Sword',
  type: 'weapon',
  implicitMods: ['+5% Critical Strike Chance'],
};

const demoMods = [
  {
    id: 'str1',
    text: (v: number[]) => `+${v[0]} to Strength` as const,
    tags: ['attribute'],
    weights: { default: 100 },
    magnitudes: [{ min: 8, max: 12 }],
    family: 'Strength',
  },
  {
    id: 'phys1',
    text: (v: number[]) => `Adds ${v[0]} to ${v[1]} Physical Damage` as const,
    tags: ['damage', 'physical'],
    weights: { default: 100, weapon: 150 },
    magnitudes: [{ min: 4, max: 6 }, { min: 12, max: 18 }],
    family: 'PhysicalDamage',
  },
];

export function setupApp(appElement: HTMLElement) {
  const crucible = createCrucible<string, Rarity, ItemType>({
    idGenerator: () => `demo_${Math.random().toString(36).slice(2)}`,
    maxModsPerItem: 6,
    modPool: demoMods,
  });

  let currentItem: Item<string, Rarity, ItemType> = crucible.createItem(swordBase, 'rare');
  const transactions: { currency: string; before: Item<string, Rarity, ItemType>; after: Item<string, Rarity, ItemType> }[] = [];

  const itemDetails = appElement.querySelector('#item-details')!;
  const flowchartContent = appElement.querySelector('#flowchart-content')!;
  const chaosButton = appElement.querySelector('#chaos-orb') as HTMLButtonElement;
  const exaltedButton = appElement.querySelector('#exalted-orb') as HTMLButtonElement;
  const rollbackButton = appElement.querySelector('#rollback') as HTMLButtonElement;

  function updateUI() {
    const itemText = `
      <strong>${currentItem.base.name}</strong> (${currentItem.rarity})<br>
      Type: ${currentItem.base.type}<br>
      Implicits: ${currentItem.base.implicitMods.join(', ') || 'None'}<br>
      Explicits: ${currentItem.explicitMods.join(', ') || 'None'}
    `;
    updateElement(itemDetails, itemText);
    updateElement(flowchartContent, generateFlowchart(currentItem, transactions));
    rollbackButton.disabled = transactions.length === 0;
    exaltedButton.disabled = currentItem.explicitMods.length >= 6;
  }

  function applyCurrency(currency: typeof ChaosOrb | typeof ExaltedOrb) {
    const result = crucible.mutator.apply(currency, currentItem);
    if (result instanceof Error) {
      alert(result.message);
      return;
    }
    transactions.push({ currency: currency.name, before: { ...currentItem }, after: result });
    currentItem = result;
    updateUI();
  }

  addEvent(chaosButton, 'click', () => applyCurrency(ChaosOrb));
  addEvent(exaltedButton, 'click', () => applyCurrency(ExaltedOrb));
  addEvent(rollbackButton, 'click', () => {
    if (transactions.length === 0) return;
    const lastTx = transactions.pop()!;
    currentItem = lastTx.before;
    updateUI();
  });

  updateUI();
}