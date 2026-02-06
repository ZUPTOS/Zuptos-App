"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import PaginatedTable, { type Column } from "@/shared/components/PaginatedTable";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, LayoutGrid, MoreHorizontal, Trash2 } from "lucide-react";
import { listMembersProducts } from "../requests/members.api";
import type { MembersProduct } from "../types/members.types";

type ProductMembersPageProps = {
  areaId: string;
};

type ProductRow = {
  id: string;
  items: MembersProduct[];
};

const tabs = ["Produtos", "Alunos", "Configurações", "Personalização"] as const;

const buildRows = (products: MembersProduct[], perRow = 3): ProductRow[] => {
  const rows: ProductRow[] = [];
  for (let index = 0; index < products.length; index += perRow) {
    rows.push({
      id: `row-${index}`,
      items: products.slice(index, index + perRow),
    });
  }
  return rows;
};

export default function ProductMembersPage({ areaId }: ProductMembersPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Produtos");
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<MembersProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const userName = useMemo(
    () => user?.fullName || user?.username || "Zuptos",
    [user]
  );

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);

    const delay = 250 + Math.floor(Math.random() * 200);
    const timer = window.setTimeout(async () => {
      const response = await listMembersProducts(areaId, 1, searchValue);
      if (!isActive) return;
      setProducts(response.data);
      setIsLoading(false);
    }, delay);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
    };
  }, [areaId, searchValue]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-members-menu=\"true\"]')) return;
      setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const rows = useMemo(() => buildRows(products), [products]);
  const hasProducts = products.length > 0;

  const columns: Column<ProductRow>[] = useMemo(
    () =>
      Array.from({ length: 3 }, (_, columnIndex) => ({
        id: `col-${columnIndex}`,
        header: "",
        cellClassName: "align-top !px-0 !py-0",
        render: (row) => {
          const product = row.items[columnIndex];
          if (!product) {
            return <div className="h-full min-h-[190px]" />;
          }

          const modulesLabel = `${product.modulesCount ?? 0} módulos`;
          const isMenuOpen = openMenuId === product.id;

          return (
            <article className="relative flex min-h-[190px] flex-col rounded-[4px] border border-border bg-card">
              <div className="h-[140px] bg-muted/70" aria-hidden="true" />
              <div className="flex flex-1 items-center justify-between gap-3 p-3.5">
                <div>
                  <p className="text-[14px] font-semibold text-foreground">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {modulesLabel}
                  </p>
                </div>

                <div className="relative" data-members-menu="true">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === product.id ? null : product.id
                      )
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-[4px] border border-border bg-background text-muted-foreground transition hover:text-foreground"
                    aria-label="Abrir menu do produto"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[160px] rounded-[6px] border border-foreground/10 bg-card p-2 shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Pré-visualizar
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Layout
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-[12px] text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        },
      })),
    [openMenuId]
  );

  return (
    <DashboardLayout userName={userName} userLocation="RJ" pageTitle="Área de membros">
      <section className="min-h-full bg-background px-5 py-6 pb-9 text-foreground sm:px-8">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-[320px]">
              <span
                className="absolute left-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-sm bg-muted-foreground/60"
                aria-hidden="true"
              />
              <input
                className="h-10 w-full rounded-[4px] border border-border bg-card px-4 pl-10 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                type="search"
                placeholder="Buscar"
                aria-label="Buscar produtos"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />
            </div>

            <button
              type="button"
              className="h-9 rounded-[8px] border border-foreground/10 bg-card px-4 text-[12px] text-muted-foreground transition hover:text-foreground"
            >
              Importar produto
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            {tabs.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-semibold transition ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="relative pb-2">
                    {tab}
                    {isActive && (
                      <span className="absolute left-0 top-full h-[2px] w-full rounded-full bg-primary" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === "Produtos" ? (
            <div className="mt-6">
              <PaginatedTable<ProductRow>
                data={rows}
                columns={columns}
                rowKey={(row) => row.id}
                rowsPerPage={2}
                isLoading={isLoading}
                loadingRows={2}
                emptyMessage={hasProducts ? "" : "Nenhum produto encontrado."}
                tableContainerClassName="border-0 bg-transparent"
                tableClassName="border-separate border-spacing-4 text-left"
                headerRowClassName="hidden"
                paginationContainerClassName="mt-4"
              />
            </div>
          ) : (
            <div className="mt-6 rounded-[8px] border border-dashed border-foreground/10 px-6 py-10 text-sm text-muted-foreground">
              Em breve.
            </div>
          )}

          <button
            type="button"
            className="mt-6 text-sm text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/members")}
          >
            Voltar para áreas de membros
          </button>
        </div>
      </section>
    </DashboardLayout>
  );
}
