'use client';

import { useCallback, useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import type { Checkout } from "@/lib/api";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function useCheckouts({ productId, token, withLoading }: Params) {
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Checkout | null>(null);
  const [deletingCheckout, setDeletingCheckout] = useState(false);

  const loadCheckouts = useCallback(async () => {
    if (!productId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await withLoading(
        () => productApi.getCheckoutsByProductId(productId, token),
        "Carregando checkouts"
      );
      setCheckouts(data);
    } catch (err) {
      console.error("Erro ao carregar checkouts:", err);
      setError("Não foi possível carregar os checkouts agora.");
    } finally {
      setLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void loadCheckouts();
  }, [loadCheckouts]);

  const handleDeleteCheckout = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingCheckout(true);
    try {
      await productApi.deleteCheckout(productId, deleteTarget.id, token);
      setDeleteTarget(null);
      await loadCheckouts();
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
