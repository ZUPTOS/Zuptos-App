'use client';

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { ProductPlan } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
  onOpenPixelForm?: () => void;
  refreshKey?: number;
};

export function PixelsTab({ productId, token, withLoading, onOpenPixelForm, refreshKey }: Props) {
  const [plans, setPlans] = useState<ProductPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    if (!productId || !token) return;
    setPlansLoading(true);
    setPlansError(null);
    try {
      const data = await withLoading(
        () => productApi.getPlansByProductId(productId, token),
        "Carregando pixels"
      );
      setPlans(data);
    } catch (error) {
      console.error("Erro ao carregar pixels:", error);
      setPlansError("Não foi possível carregar os pixels agora.");
    } finally {
      setPlansLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans, refreshKey]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Pixels de rastreamento</h2>
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
            onClick={onOpenPixelForm}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
          <span>Nome</span>
          <span>ID</span>
          <span>Plataforma</span>
          <span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-foreground/10">
          {plansLoading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex justify-end">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </>
          )}
          {!plansLoading && plansError && <div className="px-4 py-4 text-sm text-rose-300">{plansError}</div>}
          {!plansLoading && !plansError && plans.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum pixel cadastrado.</div>
          )}
          {!plansLoading &&
            !plansError &&
            plans.map(pixel => (
              <div key={pixel.id} className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground">
                <span className="font-semibold uppercase">{pixel.name || pixel.platform || "PIXEL"}</span>
                <span className="text-muted-foreground">{pixel.id}</span>
                <span className="flex items-center gap-2 text-muted-foreground">{pixel.platform ?? "-"}</span>
                <div className="flex justify-end">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                    {pixel.status ?? "Ativo"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
