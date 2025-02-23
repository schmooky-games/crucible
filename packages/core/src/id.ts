// Placeholder for cuidv2/uuidv6 (implement with actual libraries if needed)
export const generateId = (generator: 'cuidv2' | 'uuidv6' | (() => string)): string => {
    if (typeof generator === 'function') return generator();
    if (generator === 'cuidv2') return `cuid_${Math.random().toString(36).slice(2)}`; // Mock
    if (generator === 'uuidv6') return `uuid_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`; // Mock
    throw new Error('Invalid ID generator');
  };