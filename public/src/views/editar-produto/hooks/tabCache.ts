'use client';

type CacheEntry<T> = {
  data: T;
  ts: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

export const readCache = <T>(key: string): T | undefined => {
  return cache.get(key)?.data as T | undefined;
};

export const writeCache = <T>(key: string, data: T) => {
  cache.set(key, { data, ts: Date.now() });
};
