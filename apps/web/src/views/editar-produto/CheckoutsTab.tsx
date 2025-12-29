'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { Checkout } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function CheckoutsTab({ productId, token, withLoading }: Props) {
  const router = useRouter();
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
    void load();
  }, [load]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Checkouts</h2>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
          <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden />
            <input
              type="text"
              placeholder="Buscar checkout"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled
            />
          </div>
          <button
            type="button"
            className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90 disabled:opacity-60"
            onClick={() => {
              const id =
                productId ??
                (typeof window !== "undefined" ? localStorage.getItem("lastProductId") ?? undefined : undefined);
              if (!id) return;
              router.push(`/editar-produto/${encodeURIComponent(id)}/checkout`);
            }}
            disabled={false}
          >
            Adicionar checkout
          </button>
        </div>
      </div>

      <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
          <span>Nome</span>
          <span>Pagamento</span>
          <span>Ofertas</span>
          <span className="text-right">Ação</span>
        </div>
        <div className="divide-y divide-foreground/10">
          {loading && (
            <>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <div className="flex justify-end">
                    <Skeleton className="h-8 w-24 rounded-[8px]" />
                  </div>
                </div>
              ))}
            </>
          )}
          {!loading && error && <div className="px-4 py-4 text-sm text-rose-300">{error}</div>}
          {!loading && !error && checkouts.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum checkout cadastrado.</div>
          )}
          {!loading &&
            !error &&
            checkouts.map(checkout => (
              <div
                key={checkout.id ?? checkout.name}
                className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
              >
                <span className="font-semibold">{checkout.name}</span>
                <span className="text-muted-foreground">{checkout.theme ?? "-"}</span>
                <span className="text-muted-foreground">{checkout.template ?? "-"}</span>
                <div className="flex justify-end">
                  <button
                    className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
                    onClick={() => productId && router.push(`/editar-produto/${encodeURIComponent(productId)}/checkout`)}
                    type="button"
                  >
                    EDITAR
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
