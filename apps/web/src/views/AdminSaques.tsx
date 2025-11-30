'use client';

import { Filter, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import PaginatedTable, { type Column } from "@/components/PaginatedTable";
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

  const handleRowClick = (row: Withdrawal) => {
    router.push(`/admin/saques/detalhes?id=${encodeURIComponent(row.id)}`);
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1241px] flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[26px] font-semibold text-foreground">Saques</p>
              <p className="text-sm text-muted-foreground">Visão geral das solicitações de saque</p>
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
              >
                <Filter className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] border border-foreground/10 bg-card hover:bg-card/80 transition"
                aria-label="Exportar"
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
            data={withdrawalsData.withdrawals}
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
    </DashboardLayout>
  );
}
