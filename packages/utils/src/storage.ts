export interface StorageOptions<T> {
  key: string;
  defaultValue: T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export class LocalStorageManager<T> {
  private key: string;
  private defaultValue: T;
  private serializer: (value: T) => string;
  private deserializer: (value: string) => T;

  constructor(options: StorageOptions<T>) {
    this.key = options.key;
    this.defaultValue = options.defaultValue;
    this.serializer = options.serializer || JSON.stringify;
    this.deserializer = options.deserializer || JSON.parse;
  }

  get(): T {
    if (typeof window === 'undefined') return this.defaultValue;
    
    try {
      const item = localStorage.getItem(this.key);
      return item ? this.deserializer(item) : this.defaultValue;
    } catch {
      return this.defaultValue;
    }
  }

  set(value: T): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.key, this.serializer(value));
    } catch {
      // Silently fail if storage is not available
    }
  }

  remove(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.key);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  }
}

export function createStorage<T>(options: StorageOptions<T>): LocalStorageManager<T> {
  return new LocalStorageManager(options);
}
