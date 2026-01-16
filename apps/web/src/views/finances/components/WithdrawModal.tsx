
'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { formatCurrency } from "@/lib/utils/currency";
import { financesApi } from "@/lib/api";
import ConfirmModal from "@/shared/components/ConfirmModal";
import { Loader2 } from "lucide-react";

interface BankInfo {
  pixKey?: string;
  account_key?: string;
  // Add other fields as needed based on useBankData
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  bankInfo: BankInfo | null;
  onSuccess?: () => void;
}

export function WithdrawModal({ isOpen, onClose, availableBalance, bankInfo, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amount.replace(/\./g, "").replace(",", ".")) || 0;
  const pixKey = bankInfo?.pixKey || bankInfo?.account_key || "N/A";

  // Fee calculation (placeholder logic - replace if real API exists for fee preview)
  const fee = 0; // Assuming 0 for now as per screenshots/mock
  const netAmount = Math.max(0, numericAmount - fee);

  const handleSolicitarClick = () => {
    setError(null);
    if (numericAmount <= 0) {
      setError("O valor deve ser maior que zero.");
      return;
    }
    if (numericAmount > availableBalance) {
      setError("Saldo insuficiente.");
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      await financesApi.createWithdraw({ amount: numericAmount });

      setAmount("");
      setIsConfirmOpen(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Erro ao solicitar saque:", err);
      setError(err instanceof Error ? err.message : "Erro ao processar saque.");
      setIsConfirmOpen(false); // Close confirm modal to show error in main modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Basic currency mask logic could go here, for now simple text input
    let value = e.target.value;

    // Allow only numbers and one comma/dot
    value = value.replace(/[^0-9,.]/g, "");
    setAmount(value);
  };

  const handleCancelConfirm = () => {
    setIsConfirmOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen && !isConfirmOpen} onOpenChange={(open) => {
        // Only trigger onClose if we are closing (open=false) and it's NOT because we opened the confirm modal
        // But since we control 'open' with (isOpen && !isConfirmOpen), if the user manually closes the Dialog (e.g. ESC),
        // we should call onClose.
        if (!open) onClose();
      }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[425px] border-none bg-[#0b0b0b] text-white shadow-2xl p-4 sm:p-6">
          <DialogHeader className="flex flex-row items-center justify-between pb-3 sm:pb-4">
            <DialogTitle className="text-base sm:text-lg font-semibold text-white">Solicitar saque</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label className="text-base sm:text-lg font-medium text-white">Quanto você quer sacar?</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="R$ 0,00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full rounded-[8px] bg-[#141414] border border-white/10 px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#6C27D7]"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className={`flex items-center justify-between rounded-[8px] p-3 ${numericAmount > availableBalance ? 'bg-red-500/10' : 'bg-[#141414]'}`}>
              <span className="text-sm font-medium text-zinc-400">Saldo disponível:</span>
              <span className={`text-sm font-bold ${numericAmount > availableBalance ? 'text-red-500' : 'text-white'}`}>
                {formatCurrency(availableBalance)}
              </span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Chave pix:</span>
                <span className="text-white font-medium">{pixKey}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Valor a sacar:</span>
                <span className="text-white font-medium">{formatCurrency(numericAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Taxas</span>
                <span className="text-white font-medium">{formatCurrency(fee)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-zinc-400">Valor a receber:</span>
                <span className="text-white font-bold">{formatCurrency(netAmount)}</span>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 font-medium text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleSolicitarClick}
              disabled={isSubmitting || numericAmount <= 0}
              className="w-full rounded-[8px] bg-[#6C27D7] py-3 text-sm font-bold text-white transition hover:bg-[#5b21b6] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Solicitar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={isConfirmOpen}
        title="Confirmar Saque"
        description={
          <div className="space-y-2 text-zinc-400">
            <p>Você tem certeza que deseja realizar este saque?</p>
            <p className="font-semibold text-white">Valor: {formatCurrency(netAmount)}</p>
            <p className="text-xs">O valor será enviado para a chave PIX: {pixKey}</p>
          </div>
        }
        onClose={handleCancelConfirm}
        onConfirm={handleConfirmWithdraw}
        confirmLabel="Confirmar Saque"
        cancelLabel="Voltar"
        showCancelButton
      />
    </>
  );
}
