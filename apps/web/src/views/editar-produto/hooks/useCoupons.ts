'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { productApi } from "@/lib/api";
import type { CreateProductCouponRequest, ProductCoupon } from "@/lib/api";
import { formatBRLInput, parseBRLToNumber, formatPercentInput, parsePercentToNumber } from "./couponUtils";

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
  const [coupons, setCoupons] = useState<ProductCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponUnit, setCouponUnit] = useState<"valor" | "percent">("valor");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const couponCodeRef = useRef<HTMLInputElement | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<ProductCoupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductCoupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState(false);
  const [couponForm, setCouponForm] = useState({ ...emptyCouponForm });

  const loadCoupons = useCallback(async () => {
    if (!productId || !token) return;
    setCouponsLoading(true);
    setCouponsError(null);
    try {
      const data = await withLoading(
        () => productApi.getProductCoupons(productId, token),
        "Carregando cupons"
      );
      console.log("Cupons carregados:", data);
      setCoupons(data);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
      setCouponsError("Não foi possível carregar os cupons agora.");
    } finally {
      setCouponsLoading(false);
    }
  }, [productId, token, withLoading]);

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
      await loadCoupons();
      resetCouponForm();
      setShowCouponModal(false);
    } catch (error) {
      console.error("Erro ao salvar cupom:", error);
      setCouponsError("Não foi possível salvar o cupom.");
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
      await loadCoupons();
    } catch (error) {
      console.error("Erro ao excluir cupom:", error);
      setCouponsError("Não foi possível excluir o cupom.");
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
