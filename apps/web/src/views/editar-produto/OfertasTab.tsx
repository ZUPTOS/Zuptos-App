'use client';

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { ProductOffer } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
  onOpenOfferModal?: () => void;
  refreshKey?: number;
};

export function OfertasTab({ productId, token, withLoading, onOpenOfferModal, refreshKey }: Props) {
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await withLoading(
        () => productApi.getOffersByProductId(productId, token),
        "Carregando ofertas"
      );
      setOffers(data);
    } catch (err) {
      console.error("Erro ao carregar ofertas:", err);
      setError("Não foi possível carregar as ofertas agora.");
    } finally {
      setLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Ofertas</h2>
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
            onClick={onOpenOfferModal}
          >
            Adicionar oferta
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-6 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
          <span>Nome</span>
          <span>Checkout</span>
          <span>Tipo</span>
          <span>Valor</span>
          <span>Acesso</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-foreground/10">
          {loading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-5 items-center gap-4 px-4 py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-24 rounded-[10px]" />
                </div>
              ))}
            </>
          )}
          {!loading && error && <div className="px-4 py-4 text-sm text-rose-300">{error}</div>}
          {!loading && !error && offers.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Nenhuma oferta cadastrada.</div>
          )}
          {!loading &&
            !error &&
            offers.map(offer => {
              const isActive = offer.status?.toLowerCase() === "active";
              return (
                <div key={offer.id ?? offer.name} className="grid grid-cols-6 items-center gap-4 px-4 py-4 text-sm text-foreground">
                  <span className="break-words font-semibold uppercase">{offer.name}</span>
                  <span className="font-semibold text-muted-foreground">-</span>
                  <span className="text-muted-foreground">{offer.type}</span>
                  <span className="font-semibold">
                    {offer.free ? "Grátis" : offer.offer_price != null ? `R$ ${offer.offer_price}` : "-"}
                  </span>
                  <div className="flex items-center">
                    <button
                      type="button"
                      className="rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs text-foreground transition hover:border-foreground/30"
                      disabled
                    >
                      {offer.next_redirect_url?.replace(/^https?:\/\//, "") || "-"}
                    </button>
                  </div>
                  <div className="flex items-center justify-start">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${
                        isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      {isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
