'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { productApi } from "@/lib/api";
import type { Checkout } from "@/lib/api";
import { readCache, writeCache } from "./tabCache";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function useCheckouts({ productId, token, withLoading }: Params) {
  const cacheKey = productId ? `checkouts:${productId}` : null;
  const cachedCheckouts = cacheKey ? readCache<Checkout[]>(cacheKey) : undefined;
  const hasCachedCheckouts = Array.isArray(cachedCheckouts)
    ? cachedCheckouts.length > 0
    : Boolean(cachedCheckouts);
  const [checkouts, setCheckouts] = useState<Checkout[]>(cachedCheckouts ?? []);
  const [loading, setLoading] = useState(!hasCachedCheckouts);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Checkout | null>(null);
  const [deletingCheckout, setDeletingCheckout] = useState(false);
  const loadRef = useRef<Promise<void> | null>(null);
  const loadIdRef = useRef(0);

  useEffect(() => {
    if (!cacheKey) return;
    const cached = readCache<Checkout[]>(cacheKey);
    const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
    if (hasCache) {
      setCheckouts(cached ?? []);
      setLoading(false);
    }
  }, [cacheKey]);

  const loadCheckouts = useCallback(
    async (force = false) => {
    if (!productId || !token) return;
    if (!force && loadRef.current) return loadRef.current;
    const requestId = ++loadIdRef.current;
    const cached = cacheKey ? readCache<Checkout[]>(cacheKey) : undefined;
    const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
    const shouldShowSkeleton = force || !hasCache;
    if (shouldShowSkeleton) {
      setLoading(true);
    }
    setError(null);
    const task = (async () => {
      try {
        const fetcher = () => productApi.getCheckoutsByProductId(productId, token);
        const data = hasCache ? await fetcher() : await withLoading(fetcher, "Carregando checkouts");
        setCheckouts(data);
        if (cacheKey) {
          writeCache(cacheKey, data);
        }
      } catch (err) {
        console.error("Erro ao carregar checkouts:", err);
        setError("Não foi possível carregar os checkouts agora.");
      } finally {
        if (requestId === loadIdRef.current) {
          setLoading(false);
        }
      }
    })();
    loadRef.current = task;
    try {
      await task;
    } finally {
      if (loadRef.current === task) {
        loadRef.current = null;
      }
    }
    return task;
  },
    [productId, token, withLoading, cacheKey]
  );

  useEffect(() => {
    void loadCheckouts();
  }, [loadCheckouts]);

  const handleDeleteCheckout = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingCheckout(true);
    try {
      await productApi.deleteCheckout(productId, deleteTarget.id, token);
      setDeleteTarget(null);
      await loadCheckouts(true);
    } catch (err) {
      console.error("Erro ao excluir checkout:", err);
    } finally {
      setDeletingCheckout(false);
    }
  }, [productId, token, deleteTarget, loadCheckouts]);

  return {
    checkouts,
    loading,
    error,
    deleteTarget,
    deletingCheckout,
    setDeleteTarget,
    handleDeleteCheckout,
    reload: loadCheckouts,
  };
}
