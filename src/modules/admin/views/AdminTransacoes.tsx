'use client';

import { useRouter } from "next/navigation";
import { Filter, Search, Upload } from "lucide-react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import PaginatedTable, { type Column } from "@/shared/components/PaginatedTable";
import { FilterDrawer } from "@/shared/components/FilterDrawer";
import DateFilter from "@/shared/components/DateFilter";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useMemo, useState } from "react";
import { useAdminFinanceList } from "@/modules/admin/hooks/useAdminFinanceList";
import type { AdminFinanceRecord } from "@/modules/admin/types";
import { formatCurrency } from "@/lib/utils/currency";

const statusVariants: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-400",
  pending: "bg-yellow-500/15 text-yellow-400",
  refunded: "bg-sky-500/15 text-sky-400",
  chargeback: "bg-rose-500/15 text-rose-400",
  disputed: "bg-orange-500/15 text-orange-400",
  approved: "bg-emerald-500/15 text-emerald-400",
  failed: "bg-red-500/15 text-red-400",
};

const statusLabels: Record<string, string> = {
  completed: "Aprovado",
  pending: "Pendente",
  refunded: "Reembolsado",
  chargeback: "Chargeback",
  disputed: "Em disputa",
  approved: "Aprovado",
  failed: "Falhou",
};

const columns: Column<AdminFinanceRecord>[] = [
  {
    id: "id",
    header: "ID",
    cellClassName: "font-semibold font-mono text-xs",
    render: row => `#${row.id.slice(0, 8).toUpperCase()}`
  },
  {
    id: "userName",
    header: "Usuário",
    cellClassName: "text-foreground",
    render: row => (
      <div className="flex flex-col">
        <span className="font-medium">{row.userName}</span>
        {row.userEmail && (
          <span className="text-xs text-muted-foreground">{row.userEmail}</span>
        )}
      </div>
    )
  },
  {
    id: "type",
    header: "Tipo",
    cellClassName: "text-muted-foreground capitalize",
    render: row => row.type === 'transaction' ? 'Transação' : 'Saque'
  },
  {
    id: "date",
    header: "Data",
    cellClassName: "text-muted-foreground",
    render: row => {
      const date = new Date(row.created_at);
      return (
        <div className="flex flex-col">
          <span>{date.toLocaleDateString('pt-BR')}</span>
          <span className="text-xs text-muted-foreground/80">
            {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      );
    }
  },
  {
    id: "amount",
    header: "Valor",
    cellClassName: "font-semibold",
    render: row => formatCurrency(row.amount)
  },
  {
    id: "netAmount",
    header: "Valor Líquido",
    cellClassName: "font-semibold text-emerald-500",
    render: row => formatCurrency(row.netAmount)
  },
  {
    id: "status",
    header: "Status",
    render: row => {
      const statusKey = row.status.toLowerCase();
      const variant = statusVariants[statusKey] || "bg-gray-500/15 text-gray-400";
      const label = statusLabels[statusKey] || row.status;
      return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variant}`}>
          {label}
        </span>
      );
    }
  }
];

export default function AdminTransacoes() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchUserId, setSearchUserId] = useState("");
  const [searchId, setSearchId] = useState("");

  const cardSurface = "rounded-[7px] border border-foreground/10 bg-card/80";

  // Fetch finances with filters
  const { finances, isLoading } = useAdminFinanceList({
    page: 1,
    limit: 50,
    userId: searchUserId || undefined,
    startDate: dateRange.start?.toISOString(),
    endDate: dateRange.end?.toISOString(),
    type: selectedTypes.length === 1 ? (selectedTypes[0] === 'transaction' ? 'transaction' : 'withdrawal') : undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses[0]?.toLowerCase() : undefined,
  });

  // Client-side filtering for search by ID
  const filteredFinances = useMemo(() => {
    if (!searchId) return finances;
    return finances.filter(f => f.id.toLowerCase().includes(searchId.toLowerCase()));
  }, [finances, searchId]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalTransactions = finances.length;
    const completed = finances.filter(f => f.status.toLowerCase() === 'completed' || f.status.toLowerCase() === 'approved').length;
    const pending = finances.filter(f => f.status.toLowerCase() === 'pending').length;
    const refunded = finances.filter(f => f.status.toLowerCase() === 'refunded').length;
    const chargebacks = finances.filter(f => f.status.toLowerCase() === 'chargeback').length;
    const disputed = finances.filter(f => f.status.toLowerCase() === 'disputed').length;
    const approvalRate = totalTransactions > 0 ? ((completed / totalTransactions) * 100).toFixed(1) : '0';
    const chargebackRate = totalTransactions > 0 ? ((chargebacks / totalTransactions) * 100).toFixed(1) : '0';

    return [
      { id: "total", title: "Transações totais", value: totalTransactions.toString() },
      { id: "concluidas", title: "Transações concluídas", value: completed.toString() },
      { id: "pendentes", title: "Transações pendentes", value: pending.toString() },
      { id: "reembolsadas", title: "Transações reembolsadas", value: refunded.toString() },
      { id: "chargebacks", title: "Chargebacks", value: chargebacks.toString() },
      { id: "disputa", title: "Transações em disputa", value: disputed.toString() },
      { id: "aprovacao", title: "Taxa de aprovação", value: `${approvalRate}%` },
      { id: "chargebackRate", title: "Taxa de chargeback", value: `${chargebackRate}%` }
    ];
  }, [finances]);

  const handleRowClick = (row: AdminFinanceRecord) => {
    router.push(`/admin/transacoes/detalhes?id=${encodeURIComponent(row.id)}`);
  };

  const checkboxClass =
    "relative h-[22px] w-[22px] appearance-none rounded-[7px] border border-foreground/25 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary [&::before]:absolute [&::before]:left-[6px] [&::before]:top-[2px] [&::before]:hidden [&::before]:text-[12px] [&::before]:leading-none checked:[&::before]:block checked:[&::before]:content-['✓'] checked:[&::before]:text-white";

  const toggleSelection = (value: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-2 py-2 lg:px-6">
          <div className="flex items-center justify-between gap-2 py-3">
            <h1 className="text-[22px] font-sora text-foreground">Transações</h1>
            <div className="flex items-center gap-2">
              <label className="flex h-[48px] max-w-[260px] items-center gap-2 rounded-[8px] border border-foreground/10 bg-card px-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4" />
                <input
                  type="text"
                  placeholder="Filtrar por usuário"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
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
            {metrics.map(card => (
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
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>
          </div>

          {isLoading ? (
            <div className={`${cardSurface} flex items-center justify-center h-[400px]`}>
              <p className="text-muted-foreground">Carregando transações...</p>
            </div>
          ) : (
              <PaginatedTable
                data={filteredFinances}
                columns={columns}
                rowKey={row => row.id}
                rowsPerPage={10}
                initialPage={1}
                emptyMessage="Nenhuma transação encontrada"
                tableContainerClassName={`${cardSurface} rounded-[7px]`}
                paginationContainerClassName="px-2"
                onRowClick={handleRowClick}
              />
          )}
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
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Tipo de transação</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-foreground">
              {[
                { label: "Transação", value: "transaction" },
                { label: "Saque", value: "withdrawal" }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(option.value)}
                    onChange={() => toggleSelection(option.value, selectedTypes, setSelectedTypes)}
                    className={checkboxClass}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-foreground/10 pt-4">
            <p className="text-sm font-semibold text-foreground">Status</p>
            <div className="grid grid-cols-2 gap-3 text-foreground">
              {[
                { label: "Aprovado", value: "approved" },
                { label: "Pendente", value: "pending" },
                { label: "Reembolsado", value: "refunded" },
                { label: "Chargeback", value: "chargeback" }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(option.value)}
                    onChange={() => toggleSelection(option.value, selectedStatuses, setSelectedStatuses)}
                    className={checkboxClass}
                  />
                  <span>{option.label}</span>
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
