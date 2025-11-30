'use client';

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import transactionsData from "@/data/admin-transacoes.json";
import type { Transaction } from "@/types/transaction";
import TransactionDetailPanel from "@/views/components/TransactionDetailPanel";

const statusVariants: Record<Transaction["status"], string> = {
  Aprovado: "bg-emerald-500/15 text-emerald-400",
  Pendente: "bg-yellow-500/15 text-yellow-400",
  Reembolsado: "bg-sky-500/15 text-sky-400",
  Chargeback: "bg-rose-500/15 text-rose-400",
  "Em disputa": "bg-orange-500/15 text-orange-400"
};

type AdminTransacoesDetalhesProps = {
  transactionId?: string;
};

export default function AdminTransacoesDetalhes({ transactionId }: AdminTransacoesDetalhesProps) {
  const router = useRouter();
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";
  const selectedTransaction =
    transactionsData.transactions.find(transaction => transaction.id === transactionId) ??
    transactionsData.transactions[0] ??
    null;

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
          <div className="mx-auto flex w-full max-w-[1241px] flex-col gap-6 px-4 py-6 lg:px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

            <div className="flex flex-col gap-1">
              <p className="text-[26px] font-semibold text-foreground">Detalhes da transação</p>
              <span className="text-sm text-muted-foreground">Resumo completo da transação selecionada</span>
            </div>

            <TransactionDetailPanel
              transaction={selectedTransaction}
              statusVariants={statusVariants}
              cardSurfaceClassName={cardSurface}
            />
          </div>
      </div>
    </DashboardLayout>
  );
}
