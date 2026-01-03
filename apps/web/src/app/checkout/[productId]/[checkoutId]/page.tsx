'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { productApi } from "@/lib/api";
import type { Checkout as CheckoutType, Product, ProductOffer } from "@/lib/api";
import Checkout from "@/views/Checkout";

export default function PublicCheckoutPage() {
  const routeParams = useParams<{ productId?: string; checkoutId?: string }>();
  const productId = routeParams?.productId;
  const checkoutId = routeParams?.checkoutId;
  const [checkout, setCheckout] = useState<CheckoutType | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [offer, setOffer] = useState<ProductOffer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCheckout = async () => {
      if (!productId || !checkoutId) return;
      try {
        const data = await productApi.getCheckoutById(productId, checkoutId);
        console.log("[publicCheckout] Dados carregados:", { productId, checkoutId, data });
        setCheckout(data);
      } catch (err) {
        console.error("Erro ao carregar checkout público", err);
        setError("Checkout não encontrado");
      }
    };
    void loadCheckout();
  }, [productId, checkoutId]);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      try {
        const data = await productApi.getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error("Erro ao carregar produto público", err);
      }
    };
    void loadProduct();
  }, [productId]);

  useEffect(() => {
    const loadOffer = async () => {
      if (!productId || !checkoutId) return;
      try {
        const offers = await productApi.getOffersByProductId(productId);
        const matched = offers.find(off => off.checkout_id === checkoutId || off.checkout?.id === checkoutId);
        if (matched) setOffer(matched);
      } catch (err) {
        console.error("Erro ao carregar oferta pública", err);
      }
    };
    void loadOffer();
  }, [productId, checkoutId]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-red-500">{error}</div>;
  }

  if (!checkout) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Carregando checkout...</div>;
  }

  // Checkout mantém o layout existente; no futuro podemos injetar os dados do checkout para personalizar conforme template.
  return <Checkout checkout={checkout} product={product} offer={offer} />;
}
