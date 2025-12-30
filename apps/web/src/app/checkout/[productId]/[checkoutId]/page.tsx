'use client';

import { useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import type { Checkout } from "@/lib/api";
import AdminCheckout from "@/views/AdminCheckout";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function PublicCheckoutPage({ params }: any) {
  const { productId, checkoutId } = (params ?? {}) as { productId?: string; checkoutId?: string };
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCheckout = async () => {
      if (!productId || !checkoutId) return;
      try {
        const data = await productApi.getCheckoutById(productId, checkoutId);
        setCheckout(data);
      } catch (err) {
        console.error("Erro ao carregar checkout público", err);
        setError("Checkout não encontrado");
      }
    };
    void loadCheckout();
  }, [productId, checkoutId]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-red-500">{error}</div>;
  }

  if (!checkout) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Carregando checkout...</div>;
  }

  // AdminCheckout mantém o layout existente; no futuro podemos injetar os dados do checkout para personalizar conforme template.
  return <AdminCheckout />;
}
