'use client';

import { Filter, Search, Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PaginatedTable, { type Column } from "@/components/PaginatedTable";
import usersData from "@/data/admin-usuarios.json";

const metricCards = [
  { id: "ativos", title: "Número de usuários ativos", value: "00" },
  { id: "pendentes", title: "Número de usuários pendentes", value: "00" },
  { id: "suspensos", title: "Número de usuários suspensos", value: "00" }
] as const;

type UserRow = (typeof usersData.users)[number];

const statusBadge = {
  Aprovado: "bg-emerald-500/15 text-emerald-400",
  Pendente: "bg-yellow-500/15 text-yellow-400",
  Reprovado: "bg-rose-500/15 text-rose-400",
  "Não encontrado": "bg-orange-500/15 text-orange-400",
  Suspenso: "bg-purple-500/15 text-purple-300"
} as const;

const columns: Column<UserRow>[] = [
  { id: "name", header: "Nome", cellClassName: "font-semibold", render: row => row.name },
  { id: "email", header: "E-mail", cellClassName: "text-muted-foreground uppercase", render: row => row.email },
  { id: "document", header: "Documento", render: row => row.document },
  {
    id: "status",
    header: "Status do documento",
    render: row => (
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge[row.status as keyof typeof statusBadge] ?? "bg-muted/30 text-muted-foreground"}`}>
        {row.status}
      </span>
    )
  },
  { id: "total", header: "Total faturado", render: row => row.total },
  {
    id: "tax",
    header: "Taxa",
    render: row => <span className="rounded-[8px] border border-foreground/10 px-3 py-1 text-xs text-muted-foreground">{row.tax}</span>
  }
];

export default function AdminUsuarios() {
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Usuários (Admin)">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1241px] flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-[26px] font-semibold text-foreground">Usuários</p>
              <span className="text-sm text-muted-foreground">Visão geral dos usuários da plataforma</span>
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
              <button type="button" className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] border border-foreground/10 bg-card hover:bg-card/80 transition" aria-label="Filtrar">
                <Filter className="h-5 w-5" />
              </button>
              <button type="button" className="flex h-[48px] w-[48px] items-center justify-center rounded-[8px] border border-foreground/10 bg-card hover:bg-card/80 transition" aria-label="Exportar">
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
            data={usersData.users}
            columns={columns}
            rowKey={row => row.id}
            rowsPerPage={5}
            initialPage={3}
            emptyMessage="Nenhum usuário encontrado"
            tableContainerClassName={`${cardSurface} rounded-[12px]`}
            paginationContainerClassName="px-2"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
