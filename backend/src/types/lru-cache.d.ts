declare module 'lru-cache' {
  interface LRUCacheOptions<K, V> {
    max?: number;
    maxSize?: number;
    ttl?: number;
    dispose?: (value: V, key: K) => void;
    updateAgeOnGet?: boolean;
    updateAgeOnHas?: boolean;
    allowStale?: boolean;
    noDisposeOnSet?: boolean;
    noUpdateTTL?: boolean;
    length?: (value: V, key: K) => number;
    maxAge?: number;
    sizeCalculation?: (value: V, key: K) => number;
  }

  class LRUCache<K, V> {
    constructor(options?: LRUCacheOptions<K, V>);
    get(key: K): V | undefined;
    set(key: K, value: V, options?: { ttl?: number }): boolean;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    readonly size: number;
  }

  namespace LRUCache {
    export interface Options<K, V> extends LRUCacheOptions<K, V> {}
  }

  export = LRUCache;
} 