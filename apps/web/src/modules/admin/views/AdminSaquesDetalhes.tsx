'use client';

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DashboardLayout from "@/shared/components/layout/DashboardLayout";
import ConfirmModal from "@/shared/components/ConfirmModal";
import withdrawalsData from "@/data/admin-saques.json";
import type { Withdrawal } from "@/types/withdrawal";
import WithdrawalDetailPanel from "@/views/components/WithdrawalDetailPanel";

const statusStyles: Record<Withdrawal["status"], string> = {
  Pendente: "bg-yellow-500/15 text-yellow-400",
  Aprovado: "bg-emerald-500/15 text-emerald-400",
  Rejeitado: "bg-rose-500/15 text-rose-400"
};

type AdminSaquesDetalhesProps = {
  withdrawalId?: string;
};

export default function AdminSaquesDetalhes({ withdrawalId }: AdminSaquesDetalhesProps) {
  const router = useRouter();
  const cardSurface = "rounded-[8px] border border-foreground/10 bg-card/80";
  const selectedWithdrawal = withdrawalsData.withdrawals.find(withdrawal => withdrawal.id === withdrawalId) ?? withdrawalsData.withdrawals[0] ?? null;
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

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
            <p className="text-[26px] font-semibold text-foreground">Detalhes do saque</p>
            <span className="text-sm text-muted-foreground">Resumo completo da solicitação selecionada</span>
          </div>

          <WithdrawalDetailPanel withdrawal={selectedWithdrawal} statusStyles={statusStyles} cardSurfaceClassName={cardSurface} />

          {selectedWithdrawal?.status === "Pendente" && (
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="h-[40px] rounded-[7px] border border-foreground/20 bg-card px-5 text-sm font-semibold text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                onClick={() => setIsRejectModalOpen(true)}
              >
                Reprovar
              </button>
              <button
                type="button"
                className="h-[40px] rounded-[7px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-5 text-sm font-semibold text-white transition hover:brightness-110"
                onClick={() => setIsApproveModalOpen(true)}
              >
                Aprovar
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={() => setIsApproveModalOpen(false)}
        title="Tem certeza que deseja aprovar o saque?"
        showCancelButton
      />
      <ConfirmModal
        open={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={() => setRejectReason("")}
        title="Motivo da recusa"
        showCancelButton
        description={
          <div className="mt-4 border-t border-foreground/10 pt-4">
            <textarea
              className="w-full rounded-[7px] border border-foreground/15 bg-card/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none"
              rows={4}
              placeholder="Informar motivo"
              value={rejectReason}
              onChange={event => setRejectReason(event.target.value)}
            />
          </div>
        }
      />
    </DashboardLayout>
  );
}
