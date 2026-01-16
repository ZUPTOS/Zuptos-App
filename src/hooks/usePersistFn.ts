'use client';

import { useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericFn = (...args: any[]) => unknown;

export function usePersistFn<T extends GenericFn>(fn: T) {
  const fnRef = useRef<T>(fn);
  fnRef.current = fn;

  const persistFn = useRef<T | null>(null);
  if (!persistFn.current) {
    persistFn.current = function (this: ThisParameterType<T>, ...args: Parameters<T>) {
      return fnRef.current!.apply(this, args);
    } as T;
  }

  return persistFn.current as T;
}
