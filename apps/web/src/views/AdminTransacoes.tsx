'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, Filter, Search, Upload, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PaginatedTable, { type Column } from "@/components/PaginatedTable";
import { FilterDrawer } from "@/components/FilterDrawer";
import DateFilter from "@/components/DateFilter";
import transactionsData from "@/data/admin-transacoes.json";
import type { Transaction } from "@/types/transaction";
import { useMemo, useState } from "react";

const metricCards = [
  { id: "total", title: "Transações totais", value: "00" },
  { id: "concluidas", title: "Transações concluídas", value: "00" },
  { id: "pendentes", title: "Transações pendentes", value: "00" },
  { id: "reembolsadas", title: "Transações reembolsadas", value: "00" },
  { id: "chargebacks", title: "Chargebacks", value: "00" },
  { id: "disputa", title: "Transações em disputa", value: "00" },
  { id: "aprovacao", title: "Taxa de aprovação", value: "00%" },
  { id: "chargebackRate", title: "Taxa de chargeback", value: "00%" }
] as const;

const statusVariants: Record<Transaction["status"], string> = {
  Aprovado: "bg-emerald-500/15 text-emerald-400",
  Pendente: "bg-yellow-500/15 text-yellow-400",
  Reembolsado: "bg-sky-500/15 text-sky-400",
  Chargeback: "bg-rose-500/15 text-rose-400",
  "Em disputa": "bg-orange-500/15 text-orange-400"
};

const columns: Column<Transaction>[] = [
  {
    id: "id",
    header: "ID",
    cellClassName: "font-semibold",
    render: row => row.id
  },
  {
    id: "type",
    header: "Tipo",
    cellClassName: "text-muted-foreground",
    render: row => row.type
  },
  {
    id: "date",
    header: "Data",
    cellClassName: "text-muted-foreground",
    render: row => (
      <div className="flex flex-col">
        <span>{row.date}</span>
        <span className="text-xs text-muted-foreground/80">{row.time}</span>
      </div>
    )
  },
  {
    id: "value",
    header: "Valor",
    render: row => row.value
  },
  {
    id: "status",
    header: "Status",
    render: row => (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusVariants[row.status]}`}>
        {row.status}
      </span>
    )
  }
];

export default function AdminTransacoes() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const cardSurface = "rounded-[7px] border border-foreground/10 bg-card/80";
  const handleRowClick = (row: Transaction) => {
    router.push(`/admin/transacoes/detalhes?id=${encodeURIComponent(row.id)}`);
  };

  const checkboxClass =
    "relative h-[22px] w-[22px] appearance-none rounded-[7px] border border-foreground/25 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary [&::before]:absolute [&::before]:left-[6px] [&::before]:top-[2px] [&::before]:hidden [&::before]:text-[12px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white";

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  const transactionDirection = (tx: Transaction) => (["Reembolsado", "Chargeback"].includes(tx.status) ? "Saída" : "Entrada");

  const matchesCategory = (tx: Transaction, category: string) => {
    switch (category) {
      case "Venda":
        return tx.type.toLowerCase().includes("venda");
      case "Chargeback":
        return tx.status === "Chargeback";
      case "Reembolso":
        return tx.status === "Reembolsado";
      default:
        return true;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactionsData.transactions.filter(tx => {
      const txDate = parseDate(tx.date);
      if (dateRange.start && dateRange.end && txDate) {
        if (txDate < dateRange.start || txDate > dateRange.end) return false;
      }

      if (selectedCategories.length && !selectedCategories.some(cat => matchesCategory(tx, cat))) {
        return false;
      }

      if (selectedTypes.length && !selectedTypes.includes(transactionDirection(tx))) {
        return false;
      }

      if (selectedStatuses.length && !selectedStatuses.includes(tx.status)) {
        return false;
      }

      return true;
    });
  }, [dateRange.end, dateRange.start, selectedCategories, selectedStatuses, selectedTypes]);

  const toggleSelection = (value: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 py-2 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Voltar"
                onClick={() => router.back()}
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <p className="text-[24px] font-semibold text-foreground">Transações</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex h-[48px] max-w-[260px] items-center gap-2 rounded-[8px] border border-foreground/10 bg-card px-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  placeholder="Filtrar por usuário"
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] border border-foreground/10 bg-card hover:bg-card/80 transition"
                aria-label="Filtrar"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] border border-foreground/10 bg-card hover:bg-card/80 transition"
                aria-label="Exportar relatório"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Upload className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map(card => (
              <div
                key={card.id}
                className={`${cardSurface} h-[128px] w-full p-5 flex flex-col items-start justify-between`}
              >
                <p className="text-[18px] text-muted-foreground">{card.title}</p>
                <span className="text-[32px] font-semibold text-foreground">{card.value}</span>
              </div>
            ))}
          </div>

          <div className="flex w-full justify-end">
            <label className="flex h-[48px] w-full max-w-[260px] items-center gap-2 rounded-[8px] border border-foreground/10 bg-card px-3 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar id"
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>
          </div>

          <PaginatedTable
            data={filteredTransactions}
            columns={columns}
            rowKey={row => row.id}
            rowsPerPage={5}
            initialPage={1}
            emptyMessage="Nenhuma transação encontrada"
            tableContainerClassName={`${cardSurface} rounded-[7px]`}
            paginationContainerClassName="px-2"
            onRowClick={handleRowClick}
          />
        </div>
      </div>
      <FilterDrawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtrar">
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Data</p>
            <DateFilter
              onDateChange={(start, end) => {
                setDateRange({ start, end });
              }}
            />
          </div>

          <div className="space-y-3 border-t border-foreground/10 pt-4">
            <p className="text-sm font-semibold text-foreground">Categoria</p>
            <div className="grid grid-cols-2 gap-3 text-foreground">
              {["Venda", "Chargeback", "Reembolso"].map(option => (
                <label key={option} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(option)}
                    onChange={() => toggleSelection(option, selectedCategories, setSelectedCategories)}
                    className={checkboxClass}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-foreground/10 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Tipo de transação</p>
              <span className="text-xs text-muted-foreground">▼</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-foreground">
              {["Entrada", "Saída"].map(option => (
                <label key={option} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(option)}
                    onChange={() => toggleSelection(option, selectedTypes, setSelectedTypes)}
                    className={checkboxClass}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-foreground/10 pt-4">
            <p className="text-sm font-semibold text-foreground">Status</p>
            <div className="grid grid-cols-2 gap-3 text-foreground">
              {["Aprovado", "Pendente", "Reembolsado", "Chargeback"].map(option => (
                <label key={option} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(option)}
                    onChange={() => toggleSelection(option, selectedStatuses, setSelectedStatuses)}
                    className={checkboxClass}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="inline-flex h-[46px] w-full items-center justify-center rounded-[7px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] text-sm font-semibold text-white transition hover:brightness-110"
              onClick={() => setIsFilterOpen(false)}
            >
              Adicionar filtro
            </button>
          </div>
        </div>
      </FilterDrawer>
      {isExportModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            role="button"
            tabIndex={-1}
            aria-label="Fechar modal de exportação"
            onClick={() => setIsExportModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[10px] border border-foreground/15 bg-card px-6 py-6 text-sm text-muted-foreground shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <p className="text-lg font-semibold text-foreground">Exportar relatório</p>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar modal de exportação"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Ao clicar em Confirmar, enviaremos o relatório para <span className="text-foreground">con****@gmail.com</span>. O envio
              pode levar alguns minutos.
            </p>
            <button
              type="button"
              onClick={() => setIsExportModalOpen(false)}
              className="mt-6 w-full rounded-[8px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Confirmar
            </button>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
