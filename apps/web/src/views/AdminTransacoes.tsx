'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft, Filter, Search, Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PaginatedTable, { type Column } from "@/components/PaginatedTable";
import transactionsData from "@/data/admin-transacoes.json";
import type { Transaction } from "@/types/transaction";

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
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";
  const handleRowClick = (row: Transaction) => {
    router.push(`/admin/transacoes/detalhes?id=${encodeURIComponent(row.id)}`);
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Transações (Admin)">
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
              >
                <Filter className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] border border-foreground/10 bg-card hover:bg-card/80 transition"
                aria-label="Upload"
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
            data={transactionsData.transactions}
            columns={columns}
            rowKey={row => row.id}
            rowsPerPage={5}
            initialPage={3}
            emptyMessage="Nenhuma transação encontrada"
            tableContainerClassName={`${cardSurface} rounded-[8px]`}
            paginationContainerClassName="px-2"
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
