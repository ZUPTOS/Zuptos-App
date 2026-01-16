
'use client';

import { useEffect } from 'react';
import { useWithdrawHistory } from '../hooks/useWithdrawHistory';
import PaginatedTable, { type Column } from '@/components/PaginatedTable';
import type { Transaction } from '@/lib/api-types';

// Visual configuration for withdraw status
const statusMap: Record<string, { label: string; color: string }> = {
  active: { label: 'Aprovado', color: 'bg-emerald-500/10 text-emerald-500' },
  approved: { label: 'Aprovado', color: 'bg-emerald-500/10 text-emerald-500' },
  processed: { label: 'Processado', color: 'bg-blue-500/10 text-blue-500' },
  pending: { label: 'Pendente', color: 'bg-yellow-500/10 text-yellow-500' },
  rejected: { label: 'Rejeitado', color: 'bg-red-500/10 text-red-500' },
  cancelled: { label: 'Cancelado', color: 'bg-stone-500/10 text-stone-500' },
};

export default function WithdrawHistoryTab() {
  const { withdrawals, isLoading, error, fetchWithdrawHistory } = useWithdrawHistory();

  useEffect(() => {
    fetchWithdrawHistory();
  }, [fetchWithdrawHistory]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Format: 05/06/2025 às 18:45
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ' às');
  };

  const columns: Column<Transaction>[] = [
    {
      id: 'id',
      header: 'ID',
      width: '120px',
      render: (item) => {
        const fullId = item.id || item.transaction_id || '------';
        const displayId = fullId.length > 8 ? `#${fullId.slice(0, 8)}...` : `#${fullId}`;
        return <span className="text-muted-foreground font-mono text-xs" title={fullId}>{displayId.toUpperCase()}</span>;
      },
    },
    {
      id: 'date',
      header: 'Data',
      width: '180px',
      render: (item) => (
        <span className="text-muted-foreground text-xs whitespace-pre-line text-center block">
          {formatDate(item.created_at || item.date || '').split(' às ').join('\nàs ')}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Valor',
      width: '150px',
      render: (item) => (
        <span className="font-medium text-white">
          {formatCurrency(Number(item.amount))}
        </span>
      ),
    },
    {
      id: 'destination',
      header: 'Destino',
      render: (item) => {
        // For withdrawals, we might have bank info or pix key in description or other fields
        const description = item.description || item.product_name || 'Conta Bancária';
        const paymentMethod = item.payment_method || 'Pix';
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-white text-sm">{description}</span>
            <span className="text-xs text-muted-foreground">{paymentMethod}</span>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      width: '140px',
      headerClassName: 'text-right',
      cellClassName: 'justify-end',
      render: (item) => {
        const statusKey = item.status?.toLowerCase() || 'pending';
        const st = statusMap[statusKey] || { label: item.status, color: 'bg-foreground/10 text-foreground' };
        return (
          <span className={`inline-flex items-center justify-center rounded-[4px] px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${st.color} w-[90px]`}>
            {st.label}
          </span>
        );
      },
    }
  ];

  if (error) {
    return (
      <div className="flex h-40 w-full items-center justify-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full flex flex-col gap-6" style={{ maxWidth: 'var(--fin-table-width)' }}>
      <PaginatedTable
        data={withdrawals}
        columns={columns}
        rowKey={(row) => row.id || row.transaction_id || Math.random().toString()}
        isLoading={isLoading}
        rowsPerPage={10}
        emptyMessage="Nenhum saque encontrado"
        tableClassName="border-none"
        headerRowClassName="border-b border-white/5 bg-[#0b0b0b] text-xs uppercase tracking-wider font-semibold text-muted-foreground"
        tableContainerClassName="border border-white/5 bg-[#0b0b0b] rounded-xl overflow-hidden"
      />
    </div>
  );
}
