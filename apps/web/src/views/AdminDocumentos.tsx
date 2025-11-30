'use client';

import { Filter, Search, Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import PaginatedTable, { type Column } from "@/components/PaginatedTable";
import { useRouter } from "next/navigation";

type DocumentRow = {
  id: string;
  name: string;
  accountType: string;
  document: string;
  status: "Pendente" | "Aprovado" | "Reprovado";
  faturamento: string;
  createdAt: string;
  createdTime: string;
};

const rows: DocumentRow[] = [
  {
    id: "doc-1",
    name: "Nome",
    accountType: "Pessoa física",
    document: "XX-XXX-XXX.XX",
    status: "Pendente",
    faturamento: "R$600,00",
    createdAt: "05/06/2025",
    createdTime: "às 18:45"
  },
  {
    id: "doc-2",
    name: "Nome",
    accountType: "Pessoa jurídica",
    document: "XX-XXX-XXX.XX",
    status: "Aprovado",
    faturamento: "R$600,00",
    createdAt: "05/06/2025",
    createdTime: "às 18:45"
  },
  {
    id: "doc-3",
    name: "Nome",
    accountType: "Pessoa jurídica",
    document: "XX-XXX-XXX.XX",
    status: "Reprovado",
    faturamento: "R$600,00",
    createdAt: "05/06/2025",
    createdTime: "às 18:45"
  }
] as const;

const statusBadge = {
  Pendente: "bg-yellow-500/15 text-yellow-400",
  Aprovado: "bg-emerald-500/15 text-emerald-400",
  Reprovado: "bg-rose-500/15 text-rose-400"
} as const;

const columns: Column<DocumentRow>[] = [
  {
    id: "info",
    header: "Informações",
    render: row => (
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-semibold text-foreground uppercase">{row.name}</span>
          <span className="rounded-full border border-foreground/20 bg-foreground/10 px-2 py-1 text-[11px] font-semibold text-emerald-300">
            {row.accountType}
          </span>
        </div>
        <span className="text-sm text-muted-foreground tracking-wide">{row.document}</span>
      </div>
    )
  },
  {
    id: "status",
    header: "Status",
    headerClassName: "text-center",
    cellClassName: "text-center",
    render: row => (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
          statusBadge[row.status] ?? "bg-muted/30 text-muted-foreground"
        }`}
      >
        {row.status}
      </span>
    )
  },
  {
    id: "faturamento",
    header: "Faturamento médio",
    headerClassName: "text-center",
    cellClassName: "text-center",
    render: row => <span className="text-foreground">{row.faturamento}</span>
  },
  {
    id: "created",
    header: "Criado em",
    headerClassName: "text-center",
    cellClassName: "text-center",
    render: row => (
      <div className="flex flex-col items-center text-sm text-foreground">
        <span>{row.createdAt}</span>
        <span className="text-xs text-muted-foreground">{row.createdTime}</span>
      </div>
    )
  }
];

export default function AdminDocumentos() {
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";
  const router = useRouter();

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Documentos (Admin)">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6 px-4 py-6 lg:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-[22px] font-semibold text-foreground">Documentos</p>
              <span className="text-sm text-muted-foreground">Veja todas as documentações dos usuários</span>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex h-[46px] w-full min-w-[240px] max-w-[320px] items-center gap-2 rounded-[10px] border border-foreground/15 bg-card/40 px-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4" aria-hidden />
                <input
                  type="text"
                  placeholder="Filtrar por usuário"
                  className="w-full bg-transparent text-sm uppercase text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <button type="button" className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-foreground/15 bg-card/50 hover:bg-card/80 transition" aria-label="Filtrar">
                <Filter className="h-5 w-5" aria-hidden />
              </button>
              <button type="button" className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-foreground/15 bg-card/50 hover:bg-card/80 transition" aria-label="Exportar">
                <Upload className="h-5 w-5" aria-hidden />
              </button>
            </div>
          </div>

          <PaginatedTable
            data={rows}
            columns={columns}
            rowKey={row => row.id}
            rowsPerPage={6}
            initialPage={1}
            emptyMessage="Nenhum documento encontrado"
            tableContainerClassName={`${cardSurface} overflow-hidden`}
            paginationContainerClassName="px-2"
            headerRowClassName="text-[12px] uppercase tracking-[0.02em]"
            tableClassName="text-left"
            getRowClassName={() => "text-[14px]"}
            onRowClick={() => router.push("/admin/documentos/detalhes")}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
