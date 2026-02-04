'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { productApi } from "@/lib/api";
import { notifyApiError } from "@/lib/notify-error";
import type { CreateProductCouponRequest, ProductCoupon } from "@/lib/api";
import { formatBRLInput, parseBRLToNumber, formatPercentInput, parsePercentToNumber } from "./couponUtils";
import { readCache, writeCache } from "./tabCache";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

const emptyCouponForm = {
  coupon_code: "",
  discount_amount: "",
  is_percentage: false,
  internal_name: "",
  expires_at: "",
  minimum_purchase_amount: "",
  limit_usage: "",
  status: "active" as "active" | "inactive",
};

export function useCoupons({ productId, token, withLoading }: Params) {
  const cacheKey = productId ? `coupons:${productId}` : null;
  const cachedCoupons = cacheKey ? readCache<ProductCoupon[]>(cacheKey) : undefined;
  const hasCachedCoupons = Array.isArray(cachedCoupons) ? cachedCoupons.length > 0 : Boolean(cachedCoupons);
  const [coupons, setCoupons] = useState<ProductCoupon[]>(cachedCoupons ?? []);
  const [couponsLoading, setCouponsLoading] = useState(!hasCachedCoupons);
  const [couponsError, setCouponsError] = useState<string | null>(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponUnit, setCouponUnit] = useState<"valor" | "percent">("valor");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const couponCodeRef = useRef<HTMLInputElement | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<ProductCoupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCoupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({ ...emptyCouponForm });
  const loadRef = useRef<Promise<void> | null>(null);
  const loadIdRef = useRef(0);

  useEffect(() => {
    if (!cacheKey) return;
    const cached = readCache<ProductCoupon[]>(cacheKey);
    const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
    if (hasCache) {
      setCoupons(cached ?? []);
      setCouponsLoading(false);
    }
  }, [cacheKey]);

  const loadCoupons = useCallback(
    async (force = false) => {
      if (!productId || !token) return;
      if (!force && loadRef.current) return loadRef.current;
      const requestId = ++loadIdRef.current;
      const cached = cacheKey ? readCache<ProductCoupon[]>(cacheKey) : undefined;
      const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
      const shouldShowSkeleton = force || !hasCache;
      if (shouldShowSkeleton) {
        setCouponsLoading(true);
      }
      setCouponsError(null);
      const task = (async () => {
        try {
          const fetcher = () => productApi.getProductCoupons(productId, token);
          const data = hasCache ? await fetcher() : await withLoading(fetcher, "Carregando cupons");
          console.log("Cupons carregados:", data);
          setCoupons(data);
          if (cacheKey) {
            writeCache(cacheKey, data);
          }
        } catch (error) {
          console.error("Erro ao carregar cupons:", error);
          setCouponsError("Não foi possível carregar os cupons agora.");
        } finally {
          if (requestId === loadIdRef.current) {
            setCouponsLoading(false);
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
    void loadCoupons();
  }, [loadCoupons]);

  const resetCouponForm = useCallback(() => {
    setCouponForm({ ...emptyCouponForm });
    setCouponUnit("valor");
    setEditingCoupon(null);
  }, []);

  const openCreateCoupon = useCallback(() => {
    resetCouponForm();
    setShowCouponModal(true);
  }, [resetCouponForm]);

  const closeCouponModal = useCallback(() => {
    setShowCouponModal(false);
    resetCouponForm();
  }, [resetCouponForm]);

  const handleSaveCoupon = useCallback(async () => {
    if (!productId || !token) {
      console.warn("[coupon] missing productId or token", { productId, tokenPresent: Boolean(token) });
      setCouponsError("Sessão expirada. Faça login novamente.");
      return;
    }

    const discountValue =
      couponUnit === "percent"
        ? parsePercentToNumber(couponForm.discount_amount)
        : parseBRLToNumber(couponForm.discount_amount);
    if (discountValue === undefined || Number.isNaN(discountValue)) {
      setCouponsError("Informe um valor de desconto válido.");
      return;
    }

    const minimumPurchase = parseBRLToNumber(couponForm.minimum_purchase_amount);
    if (minimumPurchase !== undefined && Number.isNaN(minimumPurchase)) {
      setCouponsError("Informe um valor mínimo de compra válido.");
      return;
    }

    const limitUsage = couponForm.limit_usage ? Number(couponForm.limit_usage) : undefined;
    if (limitUsage !== undefined && Number.isNaN(limitUsage)) {
      setCouponsError("Informe um limite de uso válido.");
      return;
    }

    const rawCouponCode = couponCodeRef.current?.value ?? couponForm.coupon_code;
    const payload: CreateProductCouponRequest = {
      coupon_code: rawCouponCode.trim(),
      discount_amount: discountValue,
      status: couponForm.status,
      is_percentage: couponUnit === "percent",
      internal_name: couponForm.internal_name || undefined,
      expires_at: couponForm.expires_at || undefined,
      minimum_purchase_amount: minimumPurchase,
      limit_usage: limitUsage,
    };

    setCouponsError(null);
    setCouponSaving(true);
    try {
      if (editingCoupon?.id) {
        console.log("[coupon] Enviando atualização de cupom:", payload);
        const response = await withLoading(
          () => productApi.updateProductCoupon(productId, editingCoupon.id!, payload, token),
          "Atualizando cupom"
        );
        console.log("[coupon] Resposta atualização:", response);
      } else {
        console.log("[coupon] Enviando criação de cupom:", payload);
        const response = await withLoading(
          () => productApi.createProductCoupon(productId, payload, token),
          "Criando cupom"
        );
        console.log("[coupon] Resposta do servidor:", response);
      }
      await loadCoupons(true);
      resetCouponForm();
      setShowCouponModal(false);
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);
      setCouponsError("Não foi possível salvar o cupom.");
      notifyApiError(error, { title: "Não foi possível salvar o cupom" });
    } finally {
      setCouponSaving(false);
    }
  }, [productId, token, couponForm, couponUnit, withLoading, loadCoupons, editingCoupon, resetCouponForm]);

  const openEditCoupon = useCallback((coupon: ProductCoupon) => {
    const isPercent = coupon.is_percentage ?? false;
    setCouponUnit(isPercent ? "percent" : "valor");
    setCouponForm({
      coupon_code: coupon.coupon_code ?? coupon.code ?? "",
      discount_amount: isPercent
        ? formatPercentInput(String(coupon.discount_amount ?? ""))
        : formatBRLInput(String(coupon.discount_amount ?? "")),
      is_percentage: Boolean(coupon.is_percentage),
      internal_name: coupon.internal_name ?? coupon.name ?? "",
      expires_at: coupon.expires_at ?? "",
      minimum_purchase_amount: coupon.minimum_purchase_amount
        ? formatBRLInput(String(coupon.minimum_purchase_amount))
        : "",
      limit_usage: coupon.limit_usage ? String(coupon.limit_usage) : "",
      status: (coupon.status ?? "active").toLowerCase() === "inactive" ? "inactive" : "active",
    });
    setEditingCoupon(coupon);
    setShowCouponModal(true);
  }, []);

  const handleDeleteCoupon = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingCoupon(true);
    try {
      await withLoading(
        () => productApi.deleteProductCoupon(productId, deleteTarget.id!, token),
        "Excluindo cupom"
      );
      setDeleteTarget(null);
      await loadCoupons(true);
    } catch (error) {
      console.error("Erro ao excluir cupom:", error);
      setCouponsError("Não foi possível excluir o cupom.");
      notifyApiError(error, { title: "Não foi possível excluir o cupom" });
    } finally {
      setDeletingCoupon(false);
    }
  }, [productId, token, deleteTarget, withLoading, loadCoupons]);

  return {
    coupons,
    couponsLoading,
    couponsError,
    couponSaving,
    couponUnit,
    showCouponModal,
    editingCoupon,
    deleteTarget,
    deletingCoupon,
    couponForm,
    couponCodeRef,
    setCouponForm,
    setCouponUnit,
    setShowCouponModal,
    setDeleteTarget,
    openCreateCoupon,
    openEditCoupon,
    closeCouponModal,
    handleSaveCoupon,
    handleDeleteCoupon,
  };
}
