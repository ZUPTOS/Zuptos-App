'use client';

import { Pencil, Search, Trash2 } from "lucide-react";
import type { ProductCoupon } from "@/lib/api";
import PaginatedTable from "@/shared/components/PaginatedTable";
import { useCoupons } from "./hooks/useCoupons";
import {
  formatBRLInput,
  formatPercentInput,
  parseBRLToNumber,
  parsePercentToNumber,
} from "./hooks/couponUtils";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function CuponsTab({ productId, token, withLoading }: Props) {
  const {
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
    setDeleteTarget,
    openCreateCoupon,
    openEditCoupon,
    closeCouponModal,
    handleSaveCoupon,
    handleDeleteCoupon,
  } = useCoupons({ productId, token, withLoading });

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
            onClick={openCreateCoupon}
          >
            Adicionar
          </button>
        </div>
      </div>

      <PaginatedTable<ProductCoupon>
        data={coupons}
        rowsPerPage={6}
        rowKey={coupon => coupon.id ?? coupon.code ?? coupon.coupon_code ?? Math.random().toString()}
        isLoading={couponsLoading}
        emptyMessage={couponsError || "Nenhum cupom cadastrado ainda."}
        wrapperClassName="space-y-3"
        tableContainerClassName="rounded-[12px] border border-foreground/10 bg-card/80"
        headerRowClassName="text-foreground"
        tableClassName="text-left"
        columns={[
          {
            id: "nome",
            header: "Nome",
            render: coupon => (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {coupon.internal_name || coupon.name || "Cupom"}
                </p>
              </div>
            ),
          },
          {
            id: "desconto",
            header: "Desconto",
            render: coupon => {
              const isPercent = coupon.is_percentage ?? false;
              const value = coupon.discount_amount ?? coupon.discount;
              if (value === undefined || value === null) return <span className="text-muted-foreground">-</span>;
              const numericValue =
                typeof value === "number"
                  ? value
                  : Number(String(value).replace(/[^0-9,.-]/g, "").replace(",", "."));
              if (Number.isNaN(numericValue)) {
                return <span className="text-muted-foreground">-</span>;
              }
              if (isPercent) {
                return (
                  <span className="font-semibold text-foreground">
                    {numericValue.toString().replace(".", ",")}%
                  </span>
                );
              }
              return (
                <span className="font-semibold text-foreground">
                  {numericValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              );
            },
          },
          {
            id: "codigo",
            header: "Código",
            render: coupon => (
              <span className="text-muted-foreground">{coupon.coupon_code || coupon.code || "-"}</span>
            ),
          },
          {
            id: "status",
            header: "Status",
            headerClassName: "text-right",
            cellClassName: "text-right",
            render: coupon => {
              const isActive = (coupon.status ?? "active").toLowerCase() === "active";
              return (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-[6px] text-[11px] font-semibold ${
                    isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {isActive ? "Ativo" : "Inativo"}
                </span>
              );
            },
          },
          {
            id: "acoes",
            header: "",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: coupon => (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/15 bg-card text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
                  onClick={event => {
                    event.stopPropagation();
                    openEditCoupon(coupon);
                  }}
                  aria-label="Editar cupom"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-rose-500/30 bg-rose-500/10 text-rose-200 transition hover:border-rose-500/60"
                  onClick={event => {
                    event.stopPropagation();
                    setDeleteTarget(coupon);
                  }}
                  aria-label="Excluir cupom"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={closeCouponModal}
            aria-label="Fechar modal cupom"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {editingCoupon ? "Atualizar cupom" : "Novo Desconto"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Configure um cupom de desconto e aumente as conversões da sua loja, capte novos compradores e incentive a conclusão da compra.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCouponModal}
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
                  ref={couponCodeRef}
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
                    inputMode="decimal"
                    value={couponForm.discount_amount}
                    onChange={event =>
                      setCouponForm(prev => ({
                        ...prev,
                        discount_amount:
                          couponUnit === "percent"
                            ? formatPercentInput(event.target.value)
                            : formatBRLInput(event.target.value),
                      }))
                    }
                  />
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Compra mínima"
                    inputMode="decimal"
                    value={couponForm.minimum_purchase_amount}
                    onChange={event =>
                      setCouponForm(prev => ({
                        ...prev,
                        minimum_purchase_amount: formatBRLInput(event.target.value),
                      }))
                    }
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
                  onClick={closeCouponModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => void handleSaveCoupon()}
                  disabled={
                    couponSaving ||
                    !couponForm.coupon_code.trim() ||
                    !couponForm.discount_amount ||
                    (couponUnit === "percent"
                      ? Number.isNaN(parsePercentToNumber(couponForm.discount_amount))
                      : Number.isNaN(parseBRLToNumber(couponForm.discount_amount)))
                  }
                >
                  {couponSaving ? "Salvando..." : editingCoupon ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-[12px] border border-foreground/10 bg-card p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-semibold text-foreground">Excluir cupom?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Tem certeza que deseja excluir este cupom? Essa ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingCoupon}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(255,71,87,0.35)] transition hover:bg-rose-500/90"
                onClick={handleDeleteCoupon}
                disabled={deletingCoupon}
              >
                {deletingCoupon ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
