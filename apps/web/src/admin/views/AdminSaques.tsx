'use client';

import { useMemo, useState } from "react";
import { Filter, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PaginatedTable, { type Column } from "@/components/PaginatedTable";
import { FilterDrawer } from "@/components/FilterDrawer";
import DateFilter from "@/components/DateFilter";
import ConfirmModal from "@/components/ConfirmModal";
import withdrawalsData from "@/data/admin-saques.json";
import type { Withdrawal } from "@/types/withdrawal";

const metricCards = [
  { id: "approved", title: "Saques aprovados", value: "00" },
  { id: "pending", title: "Saques pendentes", value: "00" },
  { id: "rejected", title: "Saques rejeitados", value: "00" }
] as const;

const statusStyles: Record<Withdrawal["status"], string> = {
  Pendente: "bg-yellow-500/15 text-yellow-400",
  Aprovado: "bg-emerald-500/15 text-emerald-400",
  Rejeitado: "bg-rose-500/15 text-rose-400"
};

const columns: Column<Withdrawal>[] = [
  {
    id: "id",
    header: "ID",
    cellClassName: "font-semibold",
    render: row => row.id
  },
  {
    id: "email",
    header: "E-mail",
    cellClassName: "text-muted-foreground uppercase",
    render: row => row.email
  },
  {
    id: "date",
    header: "Data da solicitação",
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
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[row.status]}`}>
        {row.status}
      </span>
    )
  }
];

export default function AdminSaques() {
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const checkboxClass =
    "relative h-[22px] w-[22px] appearance-none rounded-[7px] border border-foreground/25 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary [&::before]:absolute [&::before]:left-[6px] [&::before]:top-[2px] [&::before]:hidden [&::before]:text-[12px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white";

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  const filteredWithdrawals = useMemo(() => {
    return withdrawalsData.withdrawals.filter(tx => {
      const txDate = parseDate(tx.date);
      if (dateRange.start && dateRange.end && txDate) {
        if (txDate < dateRange.start || txDate > dateRange.end) return false;
      }
      if (selectedStatuses.length && !selectedStatuses.includes(tx.status)) {
        return false;
      }
      return true;
    });
  }, [dateRange.end, dateRange.start, selectedStatuses]);

  const toggleStatus = (value: string) => {
    setSelectedStatuses(prev => (prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]));
  };

  const handleRowClick = (row: Withdrawal) => {
    router.push(`/admin/saques/detalhes?id=${encodeURIComponent(row.id)}`);
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1241px] flex-col gap-3 px-4 py-6 lg:px-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-2">
              <p className="text-[26px] font-semibold text-foreground">Saques</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex h-[48px] max-w-[260px] items-center gap-2 rounded-[8px] border border-foreground/10 bg-card px-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar usuário"
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
                aria-label="Exportar"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Upload className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {metricCards.map(card => (
              <div key={card.id} className={`${cardSurface} h-[128px] w-full p-5 flex flex-col justify-between`}>
                <p className="text-[18px] text-muted-foreground">{card.title}</p>
                <span className="text-[32px] font-semibold text-foreground">{card.value}</span>
              </div>
            ))}
          </div>

          <PaginatedTable
            data={filteredWithdrawals}
            columns={columns}
            rowKey={row => row.id}
            rowsPerPage={5}
            initialPage={3}
            emptyMessage="Nenhum saque encontrado"
            tableContainerClassName={`${cardSurface} rounded-[12px]`}
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
            <p className="text-sm font-semibold text-foreground">Status</p>
            <div className="grid grid-cols-2 gap-3 text-foreground">
              {["Aprovado", "Reprovado", "Pendente", "Falha", "Processando"].map(option => (
                <label key={option} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(option)}
                    onChange={() => toggleStatus(option)}
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
      <ConfirmModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Exportar relatório"
        description={
          <span>
            Ao clicar em Confirmar, enviaremos o relatório para <span className="text-foreground">con****@gmail.com</span>. O envio pode
            levar alguns minutos.
          </span>
        }
      />
    </DashboardLayout>
  );
}
