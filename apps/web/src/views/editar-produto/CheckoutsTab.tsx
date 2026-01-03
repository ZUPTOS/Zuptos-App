'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { Checkout } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import PaginatedTable from "@/components/PaginatedTable";

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

        {loading ? (
          <div className="rounded-[10px] border border-foreground/10 bg-card">
            <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
              <span>Nome</span>
              <span>Tema</span>
              <span>Template</span>
              <span className="text-center">Ação</span>
            </div>
            <div className="divide-y divide-foreground/10">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-3">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex justify-center">
                    <Skeleton className="h-8 w-20 rounded-[8px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <PaginatedTable<Checkout>
            data={checkouts}
            rowsPerPage={6}
            rowKey={item => item.id ?? item.name ?? Math.random().toString()}
            emptyMessage={error || "Nenhum checkout cadastrado."}
            wrapperClassName="space-y-3"
            tableContainerClassName="rounded-[10px] border border-foreground/10 bg-card"
            paginationContainerClassName="border-t-0 pt-3"
            headerRowClassName="bg-card/60 text-muted-foreground"
            tableClassName="text-left"
            columns={[
              {
                id: "nome",
                header: "Nome",
                render: item => <span className="font-semibold text-foreground">{item.name}</span>,
              },
              {
                id: "tema",
                header: "Tema",
                render: item => <span className="text-muted-foreground text-foreground">{item.theme ?? "-"}</span>,
              },
              {
                id: "template",
                header: "Template",
                render: item => <span className="text-muted-foreground text-foreground">{item.template ?? "-"}</span>,
              },
              {
                id: "acao",
                header: "Ação",
                headerClassName: "text-center",
                cellClassName: "text-center",
              render: () => (
                <div className="flex justify-center">
                  <button
                    className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
                      onClick={() => productId && router.push(`/editar-produto/${encodeURIComponent(productId)}/checkout`)}
                      type="button"
                    >
                      EDITAR
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
    </>
  );
}
