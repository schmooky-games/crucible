import { createCrucible, type Item, type ItemBase } from '@crucible/core';
import {
  ChaosOrb,
  ExaltedOrb,
  OrbOfAlchemy,
  OrbOfAlteration,
  OrbOfAnnulment,
  OrbOfTransmutation,
  OrbOfScouring,
  RegalOrb,
  DivineOrb,
  ArmourersScrap,
  EssenceOfGreed,
  PrismaticFossil,
  HarvestReforgeLife,
  VeiledChaosOrb,
  EldritchExaltedOrb,
  MultiModCraft,
  VaalOrb,
} from '@crucible/core'; // Assuming these are exported from a currency module
import { generateFlowchart } from '@crucible/core';
import { updateElement, addEvent } from './ui';

type Rarity = 'common' | 'magic' | 'rare' | 'unique';
type ItemType = 'weapon' | 'armor' | 'accessory';

const swordBase: ItemBase<ItemType> = {
  name: 'Rusted Sword',
  type: 'weapon',
  implicitMods: ['+5% Critical Strike Chance'],
  eldritchImplicits: [], // Initialize for eldritch mods
};

const demoMods = [
  // Life and Defenses (Prefixes)
  {
    id: 'life1',
    text: (v: number[]) => `+${v[0]} to maximum Life` as const,
    tags: ['life'],
    weights: { default: 1000 },
    magnitudes: [{ min: 10, max: 20 }],
    family: 'Life',
  },
  {
    id: 'life2',
    text: (v: number[]) => `+${v[0]} to maximum Life` as const,
    tags: ['life'],
    weights: { default: 800 },
    magnitudes: [{ min: 21, max: 40 }],
    family: 'Life',
  },
  {
    id: 'armor1',
    text: (v: number[]) => `+${v[0]}% increased Armour` as const,
    tags: ['defences', 'armour'],
    weights: { default: 500, armor: 1000 },
    magnitudes: [{ min: 10, max: 20 }],
    family: 'ArmourPercent',
  },
  {
    id: 'evasion1',
    text: (v: number[]) => `+${v[0]}% increased Evasion Rating` as const,
    tags: ['defences', 'evasion'],
    weights: { default: 500, armor: 1000 },
    magnitudes: [{ min: 10, max: 20 }],
    family: 'EvasionPercent',
  },

  // Resistances (Suffixes)
  {
    id: 'fire_res1',
    text: (v: number[]) => `+${v[0]}% to Fire Resistance` as const,
    tags: ['elemental', 'resistance', 'fire'],
    weights: { default: 1000 },
    magnitudes: [{ min: 6, max: 11 }],
    family: 'FireResistance',
  },
  {
    id: 'cold_res1',
    text: (v: number[]) => `+${v[0]}% to Cold Resistance` as const,
    tags: ['elemental', 'resistance', 'cold'],
    weights: { default: 1000 },
    magnitudes: [{ min: 6, max: 11 }],
    family: 'ColdResistance',
  },
  {
    id: 'lightning_res1',
    text: (v: number[]) => `+${v[0]}% to Lightning Resistance` as const,
    tags: ['elemental', 'resistance', 'lightning'],
    weights: { default: 1000 },
    magnitudes: [{ min: 6, max: 11 }],
    family: 'LightningResistance',
  },
  {
    id: 'chaos_res1',
    text: (v: number[]) => `+${v[0]}% to Chaos Resistance` as const,
    tags: ['chaos', 'resistance'],
    weights: { default: 500 },
    magnitudes: [{ min: 5, max: 10 }],
    family: 'ChaosResistance',
  },

  // Attributes (Prefixes)
  {
    id: 'str1',
    text: (v: number[]) => `+${v[0]} to Strength` as const,
    tags: ['attribute'],
    weights: { default: 1000 },
    magnitudes: [{ min: 8, max: 12 }],
    family: 'Strength',
  },
  {
    id: 'dex1',
    text: (v: number[]) => `+${v[0]} to Dexterity` as const,
    tags: ['attribute'],
    weights: { default: 1000 },
    magnitudes: [{ min: 8, max: 12 }],
    family: 'Dexterity',
  },
  {
    id: 'int1',
    text: (v: number[]) => `+${v[0]} to Intelligence` as const,
    tags: ['attribute'],
    weights: { default: 1000 },
    magnitudes: [{ min: 8, max: 12 }],
    family: 'Intelligence',
  },

  // Physical Damage (Prefixes)
  {
    id: 'phys1',
    text: (v: number[]) => `Adds ${v[0]} to ${v[1]} Physical Damage` as const,
    tags: ['damage', 'physical'],
    weights: { default: 100, weapon: 150 },
    magnitudes: [{ min: 4, max: 6 }, { min: 12, max: 18 }],
    family: 'PhysicalDamage',
  },
  {
    id: 'phys_percent1',
    text: (v: number[]) => `+${v[0]}% increased Physical Damage` as const,
    tags: ['damage', 'physical'],
    weights: { default: 500, weapon: 1000 },
    magnitudes: [{ min: 10, max: 20 }],
    family: 'PhysicalDamagePercent',
  },

  // Elemental Damage (Prefixes)
  {
    id: 'fire_dmg1',
    text: (v: number[]) => `Adds ${v[0]} to ${v[1]} Fire Damage` as const,
    tags: ['damage', 'elemental', 'fire'],
    weights: { default: 100, weapon: 150 },
    magnitudes: [{ min: 5, max: 10 }, { min: 15, max: 25 }],
    family: 'FireDamage',
  },
  {
    id: 'cold_dmg1',
    text: (v: number[]) => `Adds ${v[0]} to ${v[1]} Cold Damage` as const,
    tags: ['damage', 'elemental', 'cold'],
    weights: { default: 100, weapon: 150 },
    magnitudes: [{ min: 5, max: 10 }, { min: 15, max: 25 }],
    family: 'ColdDamage',
  },
  {
    id: 'lightning_dmg1',
    text: (v: number[]) => `Adds ${v[0]} to ${v[1]} Lightning Damage` as const,
    tags: ['damage', 'elemental', 'lightning'],
    weights: { default: 100, weapon: 150 },
    magnitudes: [{ min: 1, max: 5 }, { min: 20, max: 30 }],
    family: 'LightningDamage',
  },

  // Attack Speed / Crit (Suffixes)
  {
    id: 'attack_speed1',
    text: (v: number[]) => `+${v[0]}% increased Attack Speed` as const,
    tags: ['speed', 'attack'],
    weights: { default: 500, weapon: 1000 },
    magnitudes: [{ min: 5, max: 10 }],
    family: 'AttackSpeed',
  },
  {
    id: 'crit_chance1',
    text: (v: number[]) => `+${v[0]}% to Critical Strike Chance` as const,
    tags: ['critical'],
    weights: { default: 500, weapon: 1000 },
    magnitudes: [{ min: 10, max: 20 }],
    family: 'CriticalChance',
  },

  // Mana (Prefix)
  {
    id: 'mana1',
    text: (v: number[]) => `+${v[0]} to maximum Mana` as const,
    tags: ['mana'],
    weights: { default: 1000 },
    magnitudes: [{ min: 10, max: 20 }],
    family: 'Mana',
  },

  // Hybrid Mods (Prefix)
  {
    id: 'life_res1',
    text: (v: number[]) => `+${v[0]} to maximum Life, +${v[1]}% to Cold Resistance` as const,
    tags: ['life', 'resistance', 'cold'],
    weights: { default: 300 },
    magnitudes: [{ min: 10, max: 15 }, { min: 5, max: 10 }],
    family: 'LifeAndResistance',
  },

  // Eldritch Implicit (for Eldritch Exalted Orb)
  {
    id: 'eldritch_dmg1',
    text: (v: number[]) => `+${v[0]}% increased Damage` as const,
    tags: ['damage', 'eldritch'],
    weights: { default: 100 },
    magnitudes: [{ min: 5, max: 15 }],
    family: 'EldritchDamage',
  },
];

export function setupApp(appElement: HTMLElement) {
  const crucible = createCrucible<string, Rarity, ItemType>({
    idGenerator: () => `demo_${Math.random().toString(36).slice(2)}`,
    maxModsPerItem: 6,
    modPool: demoMods as any,
  });

  let currentItem: Item<string, Rarity, ItemType> = crucible.createItem(swordBase, 'common');
  const transactions: { currency: string; before: Item<string, Rarity, ItemType>; after: Item<string, Rarity, ItemType> }[] = [];

  const itemDetails = appElement.querySelector('#item-details')!;
  const flowchartContent = appElement.querySelector('#flowchart-content')!;
  
  // Buttons for all crafting methods
  const buttons = {
    transmutation: appElement.querySelector('#transmutation-orb') as HTMLButtonElement,
    alchemy: appElement.querySelector('#alchemy-orb') as HTMLButtonElement,
    alteration: appElement.querySelector('#alteration-orb') as HTMLButtonElement,
    chaos: appElement.querySelector('#chaos-orb') as HTMLButtonElement,
    exalted: appElement.querySelector('#exalted-orb') as HTMLButtonElement,
    annulment: appElement.querySelector('#annulment-orb') as HTMLButtonElement,
    scouring: appElement.querySelector('#scouring-orb') as HTMLButtonElement,
    regal: appElement.querySelector('#regal-orb') as HTMLButtonElement,
    divine: appElement.querySelector('#divine-orb') as HTMLButtonElement,
    armourersScrap: appElement.querySelector('#armourers-scrap') as HTMLButtonElement,
    essenceGreed: appElement.querySelector('#essence-greed') as HTMLButtonElement,
    prismaticFossil: appElement.querySelector('#prismatic-fossil') as HTMLButtonElement,
    harvestLife: appElement.querySelector('#harvest-life') as HTMLButtonElement,
    veiledChaos: appElement.querySelector('#veiled-chaos') as HTMLButtonElement,
    eldritchExalted: appElement.querySelector('#eldritch-exalted') as HTMLButtonElement,
    multiMod: appElement.querySelector('#multi-mod') as HTMLButtonElement,
    vaal: appElement.querySelector('#vaal-orb') as HTMLButtonElement,
    rollback: appElement.querySelector('#rollback') as HTMLButtonElement,
  };

  function updateUI() {
    const itemText = `
      <strong>${currentItem.base.name}</strong> (${currentItem.rarity})<br>
      Type: ${currentItem.base.type}<br>
      Quality: ${currentItem.quality}%<br>
      Implicits: ${currentItem.base.implicitMods.join(', ') || 'None'}<br>
      Eldritch Implicits: ${currentItem.base.eldritchImplicits?.join(', ') || 'None'}<br>
      Explicits: ${currentItem.explicitMods.join(', ') || 'None'}<br>
      Crafted Mods: ${currentItem.craftedMods?.join(', ') || 'None'}<br>
      ${currentItem.corrupted ? '<span style="color: red;">Corrupted</span>' : ''}
    `;
    updateElement(itemDetails, itemText);
    updateElement(flowchartContent, generateFlowchart(currentItem, transactions));

    // Enable/disable buttons based on item state
    buttons.rollback.disabled = transactions.length === 0;
    buttons.transmutation.disabled = currentItem.rarity !== 'common';
    buttons.alchemy.disabled = currentItem.rarity !== 'common';
    buttons.alteration.disabled = currentItem.rarity !== 'magic';
    buttons.chaos.disabled = currentItem.rarity !== 'rare';
    buttons.exalted.disabled = currentItem.rarity !== 'rare' || currentItem.explicitMods.length >= 6;
    buttons.annulment.disabled = currentItem.explicitMods.length === 0 || (currentItem.rarity !== 'magic' && currentItem.rarity !== 'rare');
    buttons.scouring.disabled = currentItem.rarity !== 'magic' && currentItem.rarity !== 'rare';
    buttons.regal.disabled = currentItem.rarity !== 'magic';
    buttons.divine.disabled = currentItem.explicitMods.length === 0;
    buttons.armourersScrap.disabled = currentItem.quality >= 20 || currentItem.base.type !== 'armor';
    buttons.essenceGreed.disabled = currentItem.rarity !== 'common';
    buttons.prismaticFossil.disabled = false; // Applies to all rarities
    buttons.harvestLife.disabled = currentItem.rarity !== 'rare';
    buttons.veiledChaos.disabled = currentItem.rarity !== 'rare';
    buttons.eldritchExalted.disabled = currentItem.rarity !== 'rare' || !currentItem.base.eldritchImplicits;
    buttons.multiMod.disabled = (currentItem.craftedMods && currentItem.craftedMods.length >= 3) ?? false;
    buttons.vaal.disabled = !!currentItem.corrupted;
  }

  function applyCurrency(currency: any) { // Using 'any' due to varying return types; could refine with a union
    const result = crucible.mutator.apply(currency, currentItem);
    if (result instanceof Error) {
      alert(result.message);
      return;
    }
    transactions.push({ currency: currency.name, before: { ...currentItem }, after: result });
    currentItem = result;
    updateUI();
  }

  // Add event listeners for all buttons
  addEvent(buttons.transmutation, 'click', () => applyCurrency(OrbOfTransmutation));
  addEvent(buttons.alchemy, 'click', () => applyCurrency(OrbOfAlchemy));
  addEvent(buttons.alteration, 'click', () => applyCurrency(OrbOfAlteration));
  addEvent(buttons.chaos, 'click', () => applyCurrency(ChaosOrb));
  addEvent(buttons.exalted, 'click', () => applyCurrency(ExaltedOrb));
  addEvent(buttons.annulment, 'click', () => applyCurrency(OrbOfAnnulment));
  addEvent(buttons.scouring, 'click', () => applyCurrency(OrbOfScouring));
  addEvent(buttons.regal, 'click', () => applyCurrency(RegalOrb));
  addEvent(buttons.divine, 'click', () => applyCurrency(DivineOrb));
  addEvent(buttons.armourersScrap, 'click', () => applyCurrency(ArmourersScrap));
  addEvent(buttons.essenceGreed, 'click', () => applyCurrency(EssenceOfGreed));
  addEvent(buttons.prismaticFossil, 'click', () => applyCurrency(PrismaticFossil));
  addEvent(buttons.harvestLife, 'click', () => applyCurrency(HarvestReforgeLife));
  addEvent(buttons.veiledChaos, 'click', () => applyCurrency(VeiledChaosOrb));
  addEvent(buttons.eldritchExalted, 'click', () => applyCurrency(EldritchExaltedOrb));
  addEvent(buttons.multiMod, 'click', () => applyCurrency(MultiModCraft));
  addEvent(buttons.vaal, 'click', () => applyCurrency(VaalOrb));
  addEvent(buttons.rollback, 'click', () => {
    if (transactions.length === 0) return;
    const lastTx = transactions.pop()!;
    currentItem = lastTx.before;
    updateUI();
  });

  updateUI();
}