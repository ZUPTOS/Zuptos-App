"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageIndicators } from "@/lib/pagination";

type MembersPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function MembersPagination({
  currentPage,
  totalPages,
  onPageChange,
}: MembersPaginationProps) {
  const pageIndicators = useMemo(
    () => buildPageIndicators(totalPages, currentPage),
    [totalPages, currentPage]
  );
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div className="flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="flex items-center gap-2 rounded-[4px] border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span>Anterior</span>
      </button>

      <div className="flex flex-wrap items-center justify-center gap-1 text-[12px]">
        {pageIndicators.map((item, index) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-muted-foreground/70"
              >
                ...
              </span>
            );
          }

          const isActive = currentPage === item;
          return (
            <button
              key={`page-${item}`}
              type="button"
              onClick={() => onPageChange(item)}
              className={`h-9 w-9 rounded-[4px] text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="flex items-center gap-2 rounded-[4px] border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>Próximo</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
