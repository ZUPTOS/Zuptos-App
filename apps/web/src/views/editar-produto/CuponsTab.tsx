'use client';

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { CreateProductCouponRequest, ProductCoupon } from "@/lib/api";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function CuponsTab({ productId, token, withLoading }: Props) {
  const [coupons, setCoupons] = useState<ProductCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponUnit, setCouponUnit] = useState<"valor" | "percent">("valor");
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    coupon_code: "",
    discount_amount: "",
    is_percentage: false,
    internal_name: "",
    expires_at: "",
    minimum_purchase_amount: "",
    limit_usage: "",
    status: "active" as "active" | "inactive",
  });

  const loadCoupons = useCallback(async () => {
    if (!productId || !token) return;
    setCouponsLoading(true);
    setCouponsError(null);
    try {
      const data = await withLoading(
        () => productApi.getProductCoupons(productId, token),
        "Carregando cupons"
      );
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

  const handleCreateCoupon = useCallback(async () => {
    if (!productId || !token) {
      console.warn("[coupon] missing productId or token", { productId, tokenPresent: Boolean(token) });
      setCouponsError("Sessão expirada. Faça login novamente.");
      return;
    }

    const discountValue = Number(couponForm.discount_amount);
    if (Number.isNaN(discountValue)) {
      setCouponsError("Informe um valor de desconto válido.");
      return;
    }

    const minimumPurchase = couponForm.minimum_purchase_amount
      ? Number(couponForm.minimum_purchase_amount)
      : undefined;
    if (minimumPurchase !== undefined && Number.isNaN(minimumPurchase)) {
      setCouponsError("Informe um valor mínimo de compra válido.");
      return;
    }

    const limitUsage = couponForm.limit_usage ? Number(couponForm.limit_usage) : undefined;
    if (limitUsage !== undefined && Number.isNaN(limitUsage)) {
      setCouponsError("Informe um limite de uso válido.");
      return;
    }

    const payload: CreateProductCouponRequest = {
      coupon_code: couponForm.coupon_code.trim(),
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
      console.log("[coupon] Enviando criação de cupom:", payload);
      const response = await withLoading(
        () => productApi.createProductCoupon(productId, payload, token),
        "Criando cupom"
      );
      console.log("[coupon] Resposta do servidor:", response);
      await loadCoupons();
      setShowCouponModal(false);
    } catch (error) {
      console.error("Erro ao criar cupom:", error);
      setCouponsError("Não foi possível criar o cupom.");
    } finally {
      setCouponSaving(false);
    }
  }, [productId, token, couponForm, couponUnit, withLoading, loadCoupons]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Cupom</h2>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
          <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden />
            <input
              type="text"
              placeholder="Buscar por código"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled
            />
          </div>
          <button
            type="button"
            className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
            onClick={() => {
              setCouponForm({
                coupon_code: "",
                discount_amount: "",
                is_percentage: false,
                internal_name: "",
                expires_at: "",
                minimum_purchase_amount: "",
                limit_usage: "",
                status: "active",
              });
              setCouponUnit("valor");
              setShowCouponModal(true);
            }}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
          <span>Nome</span>
          <span>Desconto</span>
          <span>Código</span>
          <span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-foreground/10">
          {couponsLoading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                  <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-muted/50" />
                    <div className="h-3 w-24 rounded bg-muted/40" />
                  </div>
                  <div className="h-4 w-16 rounded bg-muted/50" />
                  <div className="h-4 w-24 rounded bg-muted/50" />
                  <div className="flex justify-end">
                    <div className="h-6 w-20 rounded-full bg-muted/60" />
                  </div>
                </div>
              ))}
            </>
          )}
          {!couponsLoading && couponsError && (
            <div className="px-4 py-4 text-sm text-rose-300">{couponsError}</div>
          )}
          {!couponsLoading && !couponsError && coupons.length === 0 && (
            <div className="px-4 py-4 text-sm text-muted-foreground">Nenhum cupom cadastrado ainda.</div>
          )}
          {!couponsLoading &&
            !couponsError &&
            coupons.map(coupon => (
              <div key={coupon.id ?? coupon.code} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{coupon.name ?? "Cupom"}</p>
                  <p className="text-xs text-muted-foreground">{coupon.id ?? "--"}</p>
                </div>
                <span className="font-semibold text-foreground">{coupon.discount ?? "-"}</span>
                <span className="text-muted-foreground">{coupon.code ?? "-"}</span>
                <div className="flex justify-end">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-[11px] font-semibold text-emerald-300">
                    {coupon.status ?? "-"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCouponModal(false)}
            aria-label="Fechar modal cupom"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Novo Desconto</h2>
                <p className="text-sm text-muted-foreground">
                  Configure um cupom de desconto e aumente as conversões da sua loja, capte novos compradores e incentive a conclusão da compra.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                  value={couponForm.internal_name}
                  onChange={event => setCouponForm(prev => ({ ...prev, internal_name: event.target.value }))}
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Código de Cupom</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Selecione um produto"
                  value={couponForm.coupon_code}
                  onChange={event => setCouponForm(prev => ({ ...prev, coupon_code: event.target.value }))}
                />
              </label>

              <div className="space-y-3 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Regras para aplicação de cupom</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`h-11 rounded-[8px] border px-3 text-sm font-semibold ${
                      couponUnit === "valor"
                        ? "border-foreground/25 bg-foreground/10 text-foreground"
                        : "border-foreground/20 bg-card text-foreground"
                    }`}
                    onClick={() => setCouponUnit("valor")}
                  >
                    Valor em R$
                  </button>
                  <button
                    className={`h-11 rounded-[8px] border px-3 text-sm font-semibold ${
                      couponUnit === "percent"
                        ? "border-foreground/25 bg-foreground/10 text-foreground"
                        : "border-foreground/20 bg-card text-foreground"
                    }`}
                    onClick={() => setCouponUnit("percent")}
                  >
                    Porcentagem
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder={couponUnit === "percent" ? "% desconto" : "R$ desconto"}
                    value={couponForm.discount_amount}
                    onChange={event => setCouponForm(prev => ({ ...prev, discount_amount: event.target.value }))}
                  />
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Compra mínima"
                    value={couponForm.minimum_purchase_amount}
                    onChange={event => setCouponForm(prev => ({ ...prev, minimum_purchase_amount: event.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    value={couponForm.expires_at ? couponForm.expires_at.slice(0, 10) : ""}
                    onChange={event =>
                      setCouponForm(prev => ({
                        ...prev,
                        expires_at: event.target.value ? `${event.target.value}T00:00:00Z` : "",
                      }))
                    }
                  />
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Limite de uso"
                    value={couponForm.limit_usage}
                    onChange={event => setCouponForm(prev => ({ ...prev, limit_usage: event.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>Status</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground capitalize">{couponForm.status}</span>
                  <button
                    className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                      couponForm.status === "active" ? "bg-primary/70" : "bg-muted"
                    }`}
                    type="button"
                    onClick={() =>
                      setCouponForm(prev => ({
                        ...prev,
                        status: prev.status === "active" ? "inactive" : "active",
                      }))
                    }
                  >
                    <span
                      className={`absolute h-4 w-4 rounded-full bg-white transition ${
                        couponForm.status === "active" ? "left-[calc(100%-18px)]" : "left-[6px]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowCouponModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => void handleCreateCoupon()}
                  disabled={
                    couponSaving ||
                    !couponForm.coupon_code.trim() ||
                    !couponForm.discount_amount ||
                    Number.isNaN(Number(couponForm.discount_amount))
                  }
                >
                  {couponSaving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
