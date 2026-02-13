"use client";

import { useMemo } from "react";
import PaginatedTable, { type Column } from "@/shared/components/PaginatedTable";
import { Eye, LayoutGrid, MoreHorizontal, Trash2 } from "lucide-react";
import type { MembersProduct } from "@/views/members/types/members.types";
import type { ProductRow } from "../types";

type ProductsTabProps = {
  rows: ProductRow[];
  isLoading: boolean;
  hasProducts: boolean;
  openMenuId: string | null;
  setOpenMenuId: React.Dispatch<React.SetStateAction<string | null>>;
  onOpenLayout: (product: MembersProduct) => void;
  onOpenRemove: (product: MembersProduct) => void;
  onSelectProduct: (product: MembersProduct) => void;
};

export function ProductsTab({
  rows,
  isLoading,
  hasProducts,
  openMenuId,
  setOpenMenuId,
  onOpenLayout,
  onOpenRemove,
  onSelectProduct,
}: ProductsTabProps) {
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
            <article
              role="button"
              tabIndex={0}
              aria-label={`Abrir produto ${product.name}`}
              onClick={() => onSelectProduct(product)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectProduct(product);
                }
              }}
              className="relative flex min-h-[190px] cursor-pointer flex-col rounded-[4px] border border-border bg-card transition hover:border-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
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

                <div
                  className="relative"
                  data-members-menu="true"
                  onClick={(event) => event.stopPropagation()}
                >
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
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenLayout(product);
                        }}
                        className="flex w-full items-center gap-2 rounded-[4px] px-2 py-2 text-left text-[12px] text-muted-foreground transition hover:bg-muted/20 hover:text-foreground"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" />
                        Layout
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          onOpenRemove(product);
                        }}
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
    [onOpenLayout, onOpenRemove, onSelectProduct, openMenuId, setOpenMenuId]
  );

  return (
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
  );
}
