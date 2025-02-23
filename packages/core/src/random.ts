export const randomIntFromInterval = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  export const weightedRandom = <T>(items: T[], weights: number[]): T => {
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const rnd = Math.random() * totalWeight;
    let sum = 0;
  
    for (let i = 0; i < items.length; i++) {
      sum += weights[i];
      if (rnd <= sum) return items[i];
    }
    return items[items.length - 1]; // Fallback
  };