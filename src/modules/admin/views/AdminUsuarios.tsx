'use client';

import { Filter, Search, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import PaginatedTable, { type Column } from "@/shared/components/PaginatedTable";
import { useRouter } from "next/navigation";
import { FilterDrawer } from "@/shared/components/FilterDrawer";
import DateFilter from "@/shared/components/DateFilter";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { useAdminUsers, type AdminUserRow } from "@/modules/admin/hooks";

type UserRow = AdminUserRow;

const statusBadge = {
  Aprovado: "bg-emerald-500/15 text-emerald-400",
  Pendente: "bg-yellow-500/15 text-yellow-400",
  Reprovado: "bg-rose-500/15 text-rose-400",
  "Não encontrado": "bg-orange-500/15 text-orange-400",
  Suspenso: "bg-purple-500/15 text-purple-300"
} as const;

const columns: Column<UserRow>[] = [
  { id: "name", header: "Nome", headerClassName: "text-center", cellClassName: "font-semibold text-center", render: row => row.name },
  { id: "email", header: "E-mail", headerClassName: "text-center", cellClassName: "text-center text-muted-foreground uppercase", render: row => row.email },
  { id: "document", header: "Documento", headerClassName: "text-center", cellClassName: "text-center", render: row => row.document },
  {
    id: "status",
    header: "Status do documento",
    headerClassName: "text-center",
    cellClassName: "text-center",
    render: row => (
      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[row.statusLabel as keyof typeof statusBadge] ?? "bg-muted/30 text-muted-foreground"}`}>
        {row.statusLabel}
      </span>
    )
  },
  { id: "total", header: "Total faturado", headerClassName: "text-center", cellClassName: "text-center", render: row => row.totalLabel },
  {
    id: "tax",
    header: "Taxa",
    headerClassName: "text-center",
    cellClassName: "text-center",
    render: row => <span className="inline-flex items-center justify-center rounded-[8px] border border-foreground/10 px-3 py-1 text-xs text-muted-foreground">{row.taxLabel}</span>
  }
];

export default function AdminUsuarios() {
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { users, isLoading, summary } = useAdminUsers({ pageSize: 60 });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width < 1024) {
        setRowsPerPage(5);
      } else {
        setRowsPerPage(6);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const checkboxClass = "ui-checkbox h-[22px] w-[22px]";

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => (prev.includes(status) ? prev.filter(item => item !== status) : [...prev, status]));
  };

  const filteredUsers = useMemo(() => {
    const byStatus = selectedStatuses.length
      ? users.filter(user => selectedStatuses.includes(user.statusLabel))
      : users;
    if (!searchTerm.trim()) return byStatus;
    const term = searchTerm.toLowerCase();
    return byStatus.filter(user => {
      return (
        (user.name ?? "").toLowerCase().includes(term) ||
        (user.email ?? "").toLowerCase().includes(term) ||
        (user.document ?? "").toLowerCase().includes(term)
      );
    });
  }, [users, selectedStatuses, searchTerm]);

  const metricCards = [
    { id: "ativos", title: "Número de usuários ativos", value: String(summary.active ?? summary.total ?? 0) },
    { id: "pendentes", title: "Número de usuários pendentes", value: String(summary.pending ?? 0) },
    { id: "suspensos", title: "Número de usuários suspensos", value: String(summary.suspended ?? 0) }
  ] as const;

  return (
    <>
      <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[26px] font-semibold text-foreground">Usuários</p>
              <span className="text-sm text-muted-foreground">Visão geral dos usuários da plataforma</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex h-[46px] w-full min-w-[240px] max-w-[340px] items-center gap-2 rounded-[10px] border border-foreground/15 bg-card/40 px-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4" aria-hidden />
                <input
                  type="text"
                  placeholder="Buscar usuário"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <button
                type="button"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-foreground/15 bg-card/50 hover:bg-card/80 transition"
                aria-label="Filtrar"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-foreground/15 bg-card/50 hover:bg-card/80 transition"
                aria-label="Exportar"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Upload className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {metricCards.map(card => (
              <div key={card.id} className={`${cardSurface} h-[120px] w-full rounded-[8px] border-border/20 bg-card/60 p-4 flex flex-col justify-between`}>
                <p className="text-[16px] text-muted-foreground">{card.title}</p>
                <span className="text-[28px] font-semibold text-foreground">{card.value}</span>
              </div>
            ))}
          </div>

          <PaginatedTable
            data={filteredUsers}
            columns={columns}
            rowKey={row => row.id}
            rowsPerPage={rowsPerPage}
            initialPage={1}
            emptyMessage="Nenhum usuário encontrado"
            tableContainerClassName="rounded-[8px] border border-foreground/10 bg-card/40"
            paginationContainerClassName="px-2"
            headerRowClassName="uppercase text-xs tracking-[0.02em]"
            tableClassName="text-left"
            getRowClassName={() => "uppercase text-[13px] sm:text-[14px]"}
            onRowClick={row => router.push(`/admin/usuarios/detalhes?id=${row.id}`)}
            isLoading={isLoading}
            loadingRows={rowsPerPage}
          />
        </div>
      </div>
      </DashboardLayout>
      <FilterDrawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtrar">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Data</p>
          <DateFilter />
        </div>

        <div className="space-y-3 border-t border-foreground/10 pt-4">
          <p className="text-sm font-semibold text-foreground">Status</p>
          <div className="grid grid-cols-2 gap-4 text-foreground">
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
          Ao clicar em Confirmar, enviaremos o relatório para <span className="text-foreground">con****@gmail.com</span>. O envio pode levar
          alguns minutos.
        </span>
      }
    />
    </>
  );
}
