'use client';

import { X, Image as ImageIcon, Phone } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import { cn } from "@/lib/utils";
import { useState } from "react";

const userData = {
  nome: "Nome",
  documento: "XX-XXX-XXX.XX",
  status: "Reprovado",
  statusDesc: "Erro na documentação",
  tipoConta: "Pessoa jurídica",
  razao: "XXXXXXXXXXXX",
  dataCriacao: "05/06/2025",
  horaCriacao: "às 18:45",
  cpf: "XX-XXX-XXX.XX",
  telefone: "XXXXXXXXXXX",
  email: "teste@gmail.com",
  faturamento: "R$00,00",
  ticket: "R$00,00",
  site: "www.site.com"
};

const docs = [
  "Documento (verso)",
  "Documento (frente)",
  "Selfie",
  "Comprovante de endereço",
  "Contrato social",
  "Cartão CNPJ"
] as const;

function DocCard({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[8px] border border-foreground/12 bg-card/60 px-4 py-6 text-center text-sm font-semibold text-foreground">
      <div className="flex h-11 w-11 items-center justify-center rounded-[8px] border border-foreground/10 bg-card/50">
        <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <span className="max-w-[160px] leading-tight">{label}</span>
    </div>
  );
}

export default function AdminDocumentoDetalhes() {
  const surface = "rounded-[10px] border border-foreground/10 bg-card/80";
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const currentStatus = (statusParam ?? userData.status) as typeof userData.status;
  const actionType = currentStatus === "Pendente" ? "aprovar" : currentStatus === "Reprovado" ? "responder" : null;

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6 px-4 py-6 lg:px-6">
          <Link href="/admin/documentos" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <span className="text-lg">&larr;</span> Voltar
          </Link>

          <div className={cn(surface, "p-5 sm:p-6")}>
            <p className="text-lg font-semibold text-muted-foreground">Dados do usuário</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Nome do usuário</span>
                <p className="text-xl font-semibold text-foreground">{userData.nome}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Documento</span>
                <p className="text-xl font-semibold text-foreground">{userData.documento}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Status</span>
                <p className="text-sm font-semibold text-foreground">
                  {currentStatus}: <span className="text-muted-foreground font-normal">{userData.statusDesc}</span>
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Tipo de conta</span>
                <p className="text-xl font-semibold text-foreground">{userData.tipoConta}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Razão social</span>
                <p className="text-xl font-semibold text-foreground">{userData.razao}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Data de criação</span>
                <p className="text-xl font-semibold text-foreground">
                  {userData.dataCriacao} <span className="text-xs text-muted-foreground">{userData.horaCriacao}</span>
                </p>
              </div>
            </div>
          </div>

          <div className={cn(surface, "p-5 sm:p-6")}>
            <p className="text-lg font-semibold text-foreground">Documentos</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {docs.map(doc => (
                <DocCard key={doc} label={doc} />
              ))}
            </div>
          </div>

          <div className={cn(surface, "p-0")}>
            <div className="border-b border-foreground/10 px-5 py-3 text-sm font-semibold text-muted-foreground">Representante legal</div>
            <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Nome do usuário</span>
                <p className="text-base font-semibold text-foreground">{userData.nome}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">CPF</span>
                <p className="text-base font-semibold text-foreground">{userData.cpf}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Telefone</span>
                <div className="flex items-center gap-2 text-base font-semibold text-foreground">
                  {userData.telefone}
                  <Phone className="h-4 w-4 text-muted-foreground" aria-hidden />
                </div>
              </div>
              <div className="space-y-1 md:col-span-3">
                <span className="text-sm text-muted-foreground">E-mail</span>
                <p className="text-base font-semibold text-foreground">{userData.email}</p>
              </div>
            </div>
          </div>

          <div className={cn(surface, "p-0")}>
            <div className="border-b border-foreground/10 px-5 py-3 text-sm font-semibold text-muted-foreground">Outras informações</div>
            <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Faturamento médio</span>
                <p className="text-base font-semibold text-foreground">{userData.faturamento}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Ticket médio</span>
                <p className="text-base font-semibold text-foreground">{userData.ticket}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Página de vendas</span>
                <p className="text-base font-semibold text-foreground underline decoration-foreground/50">{userData.site}</p>
              </div>
            </div>

            <div className="flex justify-end px-5 pb-5">
              {actionType && (
                <button
                  type="button"
                  onClick={() => {
                    if (actionType === "aprovar") {
                      setApprovalModalOpen(true);
                    }
                  }}
                  className="rounded-[8px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-5 py-3 text-sm font-semibold text-white shadow"
                >
                  {actionType === "aprovar" ? "Aprovar" : "Responder solicitação"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {approvalModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70"
            role="button"
            tabIndex={-1}
            aria-label="Fechar modal de aprovação"
            onClick={() => setApprovalModalOpen(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] border border-foreground/15 bg-card px-6 py-6 text-foreground shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-foreground">Tem certeza que deseja aprovar a documentação?</p>
              <button
                type="button"
                onClick={() => setApprovalModalOpen(false)}
                className="text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setApprovalModalOpen(false)}
                className="flex-1 rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              >
                Cancelar
              </button>
              <button
                type="button"
                className="flex-1 rounded-[8px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                onClick={() => setApprovalModalOpen(false)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
