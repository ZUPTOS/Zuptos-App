'use client';

import { X } from 'lucide-react';
import type { Transaction } from '@/lib/api-types';
import { formatCurrency } from '@/lib/utils/currency';

// Extended transaction type with optional properties
type ExtendedTransaction = Transaction & {
  offer_name?: string;
  order_bump_name?: string;
  fee?: number;
  commission?: number;
  my_commission?: number;
};

interface TransactionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function TransactionDetailsDrawer({ isOpen, onClose, transaction }: TransactionDetailsDrawerProps) {
  if (!isOpen || !transaction) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Category mapping
  const categoryMap: Record<string, { label: string; color: string }> = {
    SALE: { label: 'Venda', color: 'bg-emerald-500/10 text-emerald-500' },
    COMMISSION: { label: 'Comissão', color: 'bg-blue-500/10 text-blue-500' },
    MED: { label: 'MED', color: 'bg-purple-500/10 text-purple-500' },
    REVERSAL: { label: 'Estorno', color: 'bg-orange-500/10 text-orange-500' },
    CHARGEBACK: { label: 'Chargeback', color: 'bg-red-500/10 text-red-500' },
    WITHDRAWAL: { label: 'Saque', color: 'bg-yellow-500/10 text-yellow-500' },
  };

  const typeKey = transaction.type?.toUpperCase() || 'DEFAULT';
  const category = categoryMap[typeKey] || { label: transaction.type, color: 'bg-foreground/10 text-foreground' };

  // Determine if it's an income or expense
  const isIncome = ['SALE', 'COMMISSION'].includes(typeKey);
  const typeLabel = isIncome ? 'Entrada' : 'Saída';
  const typeColor = isIncome ? 'text-emerald-500' : 'text-red-500';

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full sm:max-w-md bg-[#0b0b0b] shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0b0b0b] p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Detalhes</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-white touch-manipulation"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Product/Order Info */}
          {transaction.product_name && (
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📦</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm sm:text-base truncate">{transaction.product_name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {(transaction as ExtendedTransaction).offer_name || 'Oferta'}
                </p>
              </div>
            </div>
          )}

          {/* Order Bump Info (if applicable) */}
          {(transaction as ExtendedTransaction).order_bump_name && (
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎁</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white text-sm sm:text-base truncate">{(transaction as ExtendedTransaction).order_bump_name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Order bump(s)</p>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs sm:text-sm text-muted-foreground">Categoria</span>
              <span className={`inline-flex items-center justify-center rounded-[4px] px-2 sm:px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${category.color}`}>
                {category.label}
              </span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-xs sm:text-sm text-muted-foreground">Código da venda</span>
              <span className="font-mono text-xs sm:text-sm text-white text-right break-all">
                #{(transaction.id || transaction.transaction_id || '').toUpperCase()}
              </span>
            </div>

            {transaction.description && (
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-muted-foreground">Descrição</span>
                <span className="text-xs sm:text-sm text-white text-right max-w-[60%]">
                  {transaction.description}
                </span>
              </div>
            )}

            <div className="flex justify-between items-start">
              <span className="text-xs sm:text-sm text-muted-foreground">Data da venda</span>
              <span className="text-xs sm:text-sm text-white text-right">
                {formatDate(transaction.created_at || transaction.date || '')}
              </span>
            </div>

            <div className="border-t border-white/10 pt-3 sm:pt-4">
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-muted-foreground">Tipo</span>
                <span className={`text-xs sm:text-sm font-semibold ${typeColor}`}>
                  {typeLabel}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-xs sm:text-sm text-muted-foreground">Valor</span>
              <span className="text-base sm:text-lg font-semibold text-white">
                {formatCurrency(Number(transaction.amount))}
              </span>
            </div>

            {(transaction as ExtendedTransaction).fee !== undefined && (transaction as ExtendedTransaction).fee !== null && (
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-muted-foreground">Taxas (4,9% + R$ 0,75)</span>
                <span className="text-xs sm:text-sm text-white">
                  -{formatCurrency(Number((transaction as ExtendedTransaction).fee))}
                </span>
              </div>
            )}

            {(transaction as ExtendedTransaction).commission !== undefined && (transaction as ExtendedTransaction).commission !== null && (
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-muted-foreground">Comissão do coprodutor</span>
                <span className="text-xs sm:text-sm text-white">
                  -{formatCurrency(Number((transaction as ExtendedTransaction).commission))}
                </span>
              </div>
            )}

            {(transaction as ExtendedTransaction).my_commission !== undefined && (transaction as ExtendedTransaction).my_commission !== null && (
              <div className="flex justify-between items-start">
                <span className="text-xs sm:text-sm text-muted-foreground">Minha comissão</span>
                <span className="text-xs sm:text-sm text-emerald-500 font-semibold">
                  {formatCurrency(Number((transaction as ExtendedTransaction).my_commission))}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
