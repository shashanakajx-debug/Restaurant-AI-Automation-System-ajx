/**
 * Storage utility functions for localStorage and sessionStorage
 */

export class StorageHelper {
  private storage: globalThis.Storage;
  
  constructor(type: 'local' | 'session' = 'local') {
    this.storage = type === 'local' ? window.localStorage : window.sessionStorage;
  }
  
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        return defaultValue || null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error reading from storage:`, error);
      return defaultValue || null;
    }
  }
  
  set<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage:`, error);
    }
  }
  
  remove(key: string): void {
    try {
      this.storage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage:`, error);
    }
  }
  
  clear(): void {
    try {
      this.storage.clear();
    } catch (error) {
      console.error(`Error clearing storage:`, error);
    }
  }
  
  has(key: string): boolean {
    return this.storage.getItem(key) !== null;
  }
  
  keys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key) {
        keys.push(key);
      }
    }
    return keys;
  }
  
  size(): number {
    return this.storage.length;
  }
}

// Create instances (avoid name collision with DOM globals)
export const appLocalStorage = new StorageHelper('local');
export const appSessionStorage = new StorageHelper('session');

// Specific storage utilities for common use cases
export const cartStorage = {
  key: 'restaurant_cart',
  
  get() {
    return appLocalStorage.get(this.key, []);
  },
  
  set(items: any[]) {
    appLocalStorage.set(this.key, items);
  },
  
  clear() {
    appLocalStorage.remove(this.key);
  },
  
  add(item: any) {
    const items = this.get() as any[];
    const existingIndex = items.findIndex(i => i.id === item.id);
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity || 1;
    } else {
      items.push({ ...item, quantity: item.quantity || 1 });
    }
    
    this.set(items);
  },
  
  remove(itemId: string) {
    const items = this.get() as any[];
    const filtered = items.filter(item => item.id !== itemId);
    this.set(filtered);
  },
  
  updateQuantity(itemId: string, quantity: number) {
    const items = this.get() as any[];
    const item = items.find(i => i.id === itemId);
    
    if (item) {
      if (quantity <= 0) {
        this.remove(itemId);
      } else {
        item.quantity = quantity;
        this.set(items);
      }
    }
  },
};

export const userPreferencesStorage = {
  key: 'user_preferences',
  
  get() {
    return appLocalStorage.get(this.key, {});
  },
  
  set(preferences: any) {
    appLocalStorage.set(this.key, preferences);
  },
  
  update(updates: any) {
    const current = this.get();
    this.set({ ...current, ...updates });
  },
  
  clear() {
    appLocalStorage.remove(this.key);
  },
};

export const aiSessionStorage = {
  key: 'ai_session',
  
  get() {
    return appSessionStorage.get(this.key, { messages: [] });
  },
  
  set(session: any) {
    appSessionStorage.set(this.key, session);
  },
  
  addMessage(message: any) {
    const session = (this.get() as any) || { messages: [] };
    const messages = Array.isArray(session.messages) ? session.messages : [];
    messages.push({
      ...message,
      timestamp: new Date().toISOString(),
    });
    this.set({ ...session, messages });
  },
  
  clear() {
    appSessionStorage.remove(this.key);
  },
};
