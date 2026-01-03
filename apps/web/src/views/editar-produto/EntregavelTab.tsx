'use client';

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productApi } from "@/lib/api";
import type { ProductDeliverable } from "@/lib/api";
import PaginatedTable from "@/components/PaginatedTable";

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
  onOpenCreate?: () => void;
  refreshKey?: number;
};

const formatSize = (size?: number) => {
  if (!size) return "-";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function EntregavelTab({ productId, token, withLoading, onOpenCreate, refreshKey }: Props) {
  const [deliverables, setDeliverables] = useState<ProductDeliverable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await withLoading(
        () => productApi.getDeliverablesByProductId(productId, token),
        "Carregando entregáveis"
      );
      setDeliverables(data);
    } catch (err) {
      console.error("Erro ao carregar entregáveis:", err);
      setError("Não foi possível carregar os entregáveis agora.");
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
        <h2 className="text-lg font-semibold text-foreground">Entregável</h2>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
          <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden />
            <input
              type="text"
              placeholder="Buscar arquivo"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled
            />
          </div>
          <button
            type="button"
            className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
            onClick={onOpenCreate}
          >
            Adicionar arquivo
          </button>
        </div>
      </div>

        <PaginatedTable
          data={deliverables}
          rowsPerPage={6}
          rowKey={item => item.id ?? item.name ?? Math.random().toString()}
          emptyMessage={loading ? "Carregando..." : error || "Nenhum entregável cadastrado."}
          wrapperClassName="space-y-3"
          tableContainerClassName="rounded-[10px] border border-foreground/10 bg-card"
          headerRowClassName="bg-card/60"
          tableClassName="text-left"
          columns={[
            {
              id: "nome",
              header: "Nome",
              render: item => (
                <div className="space-y-1">
                  <p className="text-sm font-medium capitalize">{item.name || item.type || "Entregável"}</p>
                  <p className="break-all text-xs text-muted-foreground">ID: {item.id}</p>
                </div>
              ),
            },
            {
              id: "conteudo",
              header: "Entregável",
              render: item => {
                const linkLabel = item.content?.replace(/^https?:\/\//, "") ?? item.content ?? "-";
                if (!item.content) return <span className="text-sm text-muted-foreground">-</span>;
                return (
                  <div className="flex items-center gap-2">
                    <a
                      href={item.content}
                      className="rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs text-foreground transition hover:border-foreground/30"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {linkLabel}
                    </a>
                    <button
                      type="button"
                      className="h-8 w-8 rounded-[6px] border border-foreground/15 bg-card text-sm text-foreground transition hover:border-foreground/30"
                      aria-label="Baixar"
                    >
                      📎
                    </button>
                  </div>
                );
              },
            },
            {
              id: "tamanho",
              header: "Tamanho",
              render: item => <span className="text-sm text-muted-foreground">{formatSize(item.size)}</span>,
            },
            {
              id: "status",
              header: "Status",
              render: item => {
                const isActive = (item.status ?? "active").toLowerCase() === "active";
                return (
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/50"}`} aria-hidden />
                    <span className="font-medium text-foreground">{isActive ? "Ativo" : item.status ?? "-"}</span>
                  </div>
                );
              },
            },
          ]}
        />
    </>
  );
}
