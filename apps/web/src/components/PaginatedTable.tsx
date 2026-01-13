'use client';

import { useMemo, useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageIndicators } from "@/lib/pagination";
import { Skeleton } from "@/components/ui/skeleton";

export type Column<T> = {
  id: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  width?: string;
  render: (row: T, index: number) => ReactNode;
};

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string;
  rowsPerPage?: number;
  initialPage?: number;
  isLoading?: boolean;
  loadingRows?: number;
  emptyMessage?: string;
  tableContainerClassName?: string;
  paginationContainerClassName?: string;
  wrapperClassName?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  minWidth?: string;
  onRowClick?: (row: T, index: number) => void;
  getRowClassName?: (row: T, index: number) => string;
}

const DEFAULT_EMPTY_MESSAGE = "Nenhum registro encontrado";

export default function PaginatedTable<T>({
  data = [],
  columns,
  rowKey,
  rowsPerPage = 5,
  initialPage = 1,
  isLoading = false,
  loadingRows,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  tableContainerClassName = "",
  paginationContainerClassName = "",
  wrapperClassName = "",
  tableClassName = "",
  headerRowClassName = "",
  minWidth,
  onRowClick,
  getRowClassName
}: PaginatedTableProps<T>) {
  const safeColumns = useMemo(() => columns ?? [], [columns]);
  const safeData = useMemo(() => data ?? [], [data]);
  const showSkeleton = isLoading;
  const displayData = useMemo(() => (showSkeleton ? [] : safeData), [showSkeleton, safeData]);
  const totalPages = Math.max(1, Math.ceil(displayData.length / rowsPerPage));
  const [currentPage, setCurrentPage] = useState(Math.min(initialPage, totalPages));

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [displayData, rowsPerPage, initialPage]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return displayData.slice(start, start + rowsPerPage);
  }, [currentPage, rowsPerPage, displayData]);

  const pageIndicators = useMemo(() => buildPageIndicators(totalPages, currentPage), [totalPages, currentPage]);

  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName}`}>
      <div className={`${tableContainerClassName} rounded-[10px] border border-foreground/10 bg-card`}>
        <div className="overflow-x-auto">
          <table
            className={`w-full text-center text-[14px] ${tableClassName} ${safeColumns.some(col => col.width) ? "table-fixed" : ""}`}
            style={minWidth ? { minWidth } : undefined}
          >
            <thead>
              <tr className={`text-muted-foreground ${headerRowClassName}`}>
                {safeColumns.map(column => (
                  <th
                    key={column.id}
                    className={`px-6 py-4 font-medium ${column.headerClassName ?? ""}`}
                    style={column.width ? { width: column.width } : undefined}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {showSkeleton ? (
                Array.from({ length: loadingRows ?? rowsPerPage }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-t border-foreground/5">
                    {safeColumns.map(column => {
                      const cellAlignment =
                        column.cellClassName?.includes("text-right") ||
                        column.headerClassName?.includes("text-right")
                          ? "justify-end"
                          : column.cellClassName?.includes("text-center") ||
                              column.headerClassName?.includes("text-center")
                            ? "justify-center"
                            : "justify-start";
                      return (
                        <td
                          key={`${column.id}-${index}`}
                          className={`px-6 py-4 align-center ${column.cellClassName ?? ""}`}
                          style={column.width ? { width: column.width } : undefined}
                        >
                          <div className={`flex ${cellAlignment}`}>
                            <Skeleton className="h-4 w-28" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : paginatedData.length ? (
                paginatedData.map((row, index) => {
                  const rowClassName = getRowClassName?.(row, index) ?? "";
                  const isClickable = typeof onRowClick === "function";
                  return (
                    <tr
                      key={rowKey(row, index)}
                      className={`border-t border-foreground/5 text-[14px] ${rowClassName} ${isClickable ? "cursor-pointer transition hover:bg-muted/20" : ""}`}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {safeColumns.map(column => (
                        <td
                          key={column.id}
                          className={`px-6 py-4 align-center ${column.cellClassName ?? ""}`}
                          style={column.width ? { width: column.width } : undefined}
                        >
                          {column.render(row, index)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={safeColumns.length} className="px-6 py-8 text-center text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`flex flex-col items-center gap-3 py-4 sm:flex-row sm:justify-between ${paginationContainerClassName}`}>
        <button
          type="button"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="flex items-center gap-2 rounded-[8px] border border-foreground/10 bg-card px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span>Anterior</span>
      </button>

        <div className="flex flex-wrap items-center justify-center">
          {pageIndicators.map((page, index) => (
            <button
              key={`${page}-${index}`}
              type="button"
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              disabled={page === "..."}
              className={`min-w-[40px] rounded-[8px] px-3 py-2 text-sm font-medium transition ${
                page === currentPage
                  ? "bg-card text-foreground"
                  : "text-muted-foreground"
              } ${page === "..." ? "cursor-default" : "hover:text-foreground"}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 rounded-[8px] border border-foreground/10 bg-card px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span>Próximo</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
      </div>
    </div>
  );
}
