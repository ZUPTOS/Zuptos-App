'use client';

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { ProductStrategy } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function UpsellTab({ productId, token, withLoading }: Props) {
  const [strategies, setStrategies] = useState<ProductStrategy[]>([]);
  const [strategiesLoading, setStrategiesLoading] = useState(false);
  const [strategiesError, setStrategiesError] = useState<string | null>(null);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  useEffect(() => {
    const loadStrategies = async () => {
      if (!productId || !token) return;
      setStrategiesLoading(true);
      setStrategiesError(null);
      try {
        const data = await withLoading(
          () => productApi.getProductStrategy(productId, token),
          "Carregando upsells"
        );
        setStrategies(data);
      } catch (error) {
        console.error("Erro ao carregar upsells:", error);
        setStrategiesError("Não foi possível carregar as estratégias agora.");
      } finally {
        setStrategiesLoading(false);
      }
    };
    void loadStrategies();
  }, [productId, token, withLoading]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Upsell, downsell e mais</h2>
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
            onClick={() => setShowUpsellModal(true)}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-5 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
          <span>Nome</span>
          <span>Tipo</span>
          <span>Oferta</span>
          <span>Valor</span>
          <span className="text-right">Script</span>
        </div>
        <div className="divide-y divide-foreground/10">
          {strategiesLoading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-5 items-center gap-4 px-4 py-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <div className="flex justify-end">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </>
          )}
          {!strategiesLoading && strategiesError && (
            <div className="px-4 py-4 text-sm text-rose-300">{strategiesError}</div>
          )}
          {!strategiesLoading && !strategiesError && strategies.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Nenhuma estratégia cadastrada.</div>
          )}
          {!strategiesLoading &&
            !strategiesError &&
            strategies.map(item => (
              <div
                key={item.id}
                className="grid grid-cols-5 items-center gap-4 px-4 py-4 text-sm text-foreground"
              >
                <span className="font-semibold uppercase">{item.name || item.type || "Estrategia"}</span>
                <span className="text-muted-foreground">{item.type ?? "-"}</span>
                <span className="text-muted-foreground">{item.offer ?? "-"}</span>
                <span className="font-semibold">
                  {item.value !== undefined && item.value !== null ? item.value : "-"}
                </span>
                <div className="flex justify-end">
                  <span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-[6px] text-[11px] font-semibold text-muted-foreground">
                    {item.script ?? "-"}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUpsellModal(false)}
            aria-label="Fechar modal estratégia"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Criar estratégia</h2>
                <p className="text-sm text-muted-foreground">Crie upsell, cross sell ou downsell para aumentar seu ticket médio.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpsellModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Nome</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Tipo de estratégia</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Upsell"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
              </div>

              <label className="space-y-1 text-sm text-muted-foreground">
                <span className="text-foreground">Selecione o produto</span>
                <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                  <input
                    className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder="Selecione um produto"
                  />
                  <span className="text-lg text-muted-foreground">▾</span>
                </div>
              </label>

              <div className="space-y-4 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Caso o cliente aceite a oferta</p>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Ação</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Nova oferta"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">URL</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
              </div>

              <div className="space-y-4 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Se recusar</p>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Ação</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Nova oferta"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">URL</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowUpsellModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowUpsellModal(false)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
