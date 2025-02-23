import type { Item } from '../item';
import { serializeItem } from '../item';

export const generateFlowchart = <T, R, Y>(
  initialItem: Item<T, R, Y>,
  transactions: { currency: string; before: Item<T, R, Y>; after: Item<T, R, Y> }[]
): string => {
  let html = `
    <div style="font-family: Arial; display: flex; flex-direction: column; align-items: center; gap: 15px;">
      <div style="background: #e0e0e0; padding: 15px; border-radius: 5px; width: 300px; text-align: center;">
        <strong>Base Item</strong><br>
        ${initialItem.base.name} (${String(initialItem.rarity)})<br>
        Implicits: ${initialItem.base.implicitMods.join(', ') || 'None'}
      </div>
  `;

  transactions.forEach((tx, index) => {
    html += `
      <div style="background: #fff3e0; padding: 15px; border-radius: 5px; width: 300px; text-align: center; border: 1px solid #ccc;">
        <strong>${tx.currency} (#${index + 1})</strong><br>
        <small>Before:</small> ${tx.before.explicitMods.map(m => (typeof m === 'string' ? m : JSON.stringify(m))).join(', ') || 'None'}<br>
        <small>After:</small> ${tx.after.explicitMods.map(m => (typeof m === 'string' ? m : JSON.stringify(m))).join(', ') || 'None'}<br>
        <small>Time: ${new Date(tx.after.id.length > 0 ? Date.now() : Date.now()).toLocaleTimeString()}</small>
      </div>
    `;
  });

  html += `</div>`;
  return html;
};