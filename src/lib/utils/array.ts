/**
 * Array utility functions
 */

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const groups = new Map<K, T[]>();
  
  for (const item of array) {
    const key = keyFn(item);
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }
  
  return groups;
}

export function sortBy<T>(array: T[], keyFn: (item: T) => any, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((acc, item) => {
    return acc.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function sample<T>(array: T[], count = 1): T[] {
  if (count >= array.length) return shuffle(array);
  
  const shuffled = shuffle(array);
  return shuffled.slice(0, count);
}

export function intersection<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => array2.includes(item));
}

export function difference<T>(array1: T[], array2: T[]): T[] {
  return array1.filter(item => !array2.includes(item));
}

export function union<T>(array1: T[], array2: T[]): T[] {
  return unique([...array1, ...array2]);
}

export function partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  for (const item of array) {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  }
  
  return [truthy, falsy];
}

export function countBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, number> {
  const counts = new Map<K, number>();
  
  for (const item of array) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  
  return counts;
}

export function sumBy<T>(array: T[], keyFn: (item: T) => number): number {
  return array.reduce((sum, item) => sum + keyFn(item), 0);
}

export function averageBy<T>(array: T[], keyFn: (item: T) => number): number {
  if (array.length === 0) return 0;
  return sumBy(array, keyFn) / array.length;
}

export function maxBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  
  return array.reduce((max, item) => {
    return keyFn(item) > keyFn(max) ? item : max;
  });
}

export function minBy<T>(array: T[], keyFn: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  
  return array.reduce((min, item) => {
    return keyFn(item) < keyFn(min) ? item : min;
  });
}

export function findLast<T>(array: T[], predicate: (item: T) => boolean): T | undefined {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
  return undefined;
}

export function findIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
}

export function findLastIndex<T>(array: T[], predicate: (item: T) => boolean): number {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
}

export function remove<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(item => !predicate(item));
}

export function removeAt<T>(array: T[], index: number): T[] {
  if (index < 0 || index >= array.length) return array;
  return array.filter((_, i) => i !== index);
}

export function insertAt<T>(array: T[], index: number, item: T): T[] {
  const result = [...array];
  result.splice(index, 0, item);
  return result;
}

export function replaceAt<T>(array: T[], index: number, item: T): T[] {
  if (index < 0 || index >= array.length) return array;
  const result = [...array];
  result[index] = item;
  return result;
}

export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

export function isNotEmpty<T>(array: T[]): boolean {
  return array.length > 0;
}

export function first<T>(array: T[]): T | undefined {
  return array[0];
}

export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export function take<T>(array: T[], count: number): T[] {
  return array.slice(0, count);
}

export function takeWhile<T>(array: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (predicate(item)) {
      result.push(item);
    } else {
      break;
    }
  }
  return result;
}

export function drop<T>(array: T[], count: number): T[] {
  return array.slice(count);
}

export function dropWhile<T>(array: T[], predicate: (item: T) => boolean): T[] {
  let startIndex = 0;
  for (let i = 0; i < array.length; i++) {
    if (!predicate(array[i])) {
      startIndex = i;
      break;
    }
  }
  return array.slice(startIndex);
}
