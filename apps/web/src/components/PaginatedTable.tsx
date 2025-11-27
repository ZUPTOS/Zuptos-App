'use client';

import { useMemo, useState, useEffect, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { buildPageIndicators } from "@/lib/pagination";

export type Column<T> = {
  id: string;
  header: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, index: number) => ReactNode;
};

interface PaginatedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (row: T, index: number) => string;
  rowsPerPage?: number;
  initialPage?: number;
  emptyMessage?: string;
  tableContainerClassName?: string;
  paginationContainerClassName?: string;
  wrapperClassName?: string;
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
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  tableContainerClassName = "",
  paginationContainerClassName = "",
  wrapperClassName = "",
  onRowClick,
  getRowClassName
}: PaginatedTableProps<T>) {
  const safeColumns = useMemo(() => columns ?? [], [columns]);
  const safeData = useMemo(() => data ?? [], [data]);
  const totalPages = Math.max(1, Math.ceil(safeData.length / rowsPerPage));
  const [currentPage, setCurrentPage] = useState(Math.min(initialPage, totalPages));

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return safeData.slice(start, start + rowsPerPage);
  }, [currentPage, rowsPerPage, safeData]);

  const pageIndicators = useMemo(() => buildPageIndicators(totalPages, currentPage), [totalPages, currentPage]);

  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName}`}>
      <div className={tableContainerClassName}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-center text-[14px]">
            <thead>
              <tr className="text-muted-foreground">
                {safeColumns.map(column => (
                  <th key={column.id} className={`px-6 py-4 font-medium ${column.headerClassName ?? ""}`}>
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length ? (
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
                        <td key={column.id} className={`px-6 py-4 align-center ${column.cellClassName ?? ""}`}>
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
          className="flex items-center gap-2 rounded-[8px] border border-foreground/10 px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-4 w-4" />
          Anterior
        </button>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {pageIndicators.map((page, index) => (
            <button
              key={`${page}-${index}`}
              type="button"
              onClick={() => typeof page === "number" && setCurrentPage(page)}
              disabled={page === "..."}
              className={`min-w-[40px] rounded-[8px] px-3 py-2 text-sm font-medium transition ${
                page === currentPage
                  ? "bg-purple-600 text-white"
                  : "border border-foreground/10 text-muted-foreground hover:bg-muted/30"
              } ${page === "..." ? "cursor-default" : ""}`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 rounded-[8px] border border-foreground/10 px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Próximo
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
