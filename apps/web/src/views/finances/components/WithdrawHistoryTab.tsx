
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useWithdrawHistory } from '../hooks/useWithdrawHistory';
import PaginatedTable, { type Column } from '@/components/PaginatedTable';
import type { Transaction } from '@/lib/api-types';
import { Search, Filter, Eye, EyeOff, Upload, X } from 'lucide-react';
import TransactionsFilter from './TransactionsFilter';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [hideValues, setHideValues] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  useEffect(() => {
    fetchWithdrawHistory();
  }, [fetchWithdrawHistory]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ' às');
  };

  // Client-side filtering
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(item => {
      // Search filter
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        const matchesId = (item.id || item.transaction_id || '').toLowerCase().includes(lowerTerm);
        const matchesDesc = (item.description || item.product_name || '').toLowerCase().includes(lowerTerm);
        if (!matchesId && !matchesDesc) return false;
      }

      // Date filter
      if (dateRange.start && dateRange.end) {
        const itemDate = new Date(item.created_at || item.date || '');
        if (itemDate < dateRange.start || itemDate > new Date(dateRange.end.getTime() + 86400000)) {
          return false;
        }
      }

      return true;
    });
  }, [withdrawals, searchTerm, dateRange]);

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
      render: (item) => {
        if (hideValues) return <span className="text-muted-foreground text-sm">••••••</span>;
        return (
          <span className="font-medium text-white">
            {formatCurrency(Number(item.amount))}
          </span>
        );
      },
    },
    {
      id: 'destination',
      header: 'Destino',
      render: (item) => {
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
    <div className="mx-auto w-full flex flex-col gap-4 sm:gap-6 px-2 sm:px-0" style={{ maxWidth: 'var(--fin-table-width)' }}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        {/* Search Input */}
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por código"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-[8px] bg-[#0b0b0b] pl-10 pr-4 text-sm text-foreground border border-white/5 focus:outline-none focus:ring-1 focus:ring-primary sm:w-[240px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex h-10 flex-1 sm:flex-none sm:w-10 items-center justify-center gap-2 rounded-[8px] bg-[#0b0b0b] border border-white/5 text-muted-foreground hover:bg-[#1a1a1a] hover:text-white transition-colors touch-manipulation px-4 sm:px-0"
            title="Filtrar"
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm sm:hidden">Filtrar</span>
          </button>

          <button
            onClick={() => setHideValues(prev => !prev)}
            className="flex h-10 flex-1 sm:flex-none sm:w-10 items-center justify-center gap-2 rounded-[8px] bg-[#0b0b0b] border border-white/5 text-muted-foreground hover:bg-[#1a1a1a] hover:text-white transition-colors touch-manipulation px-4 sm:px-0"
            title={hideValues ? "Mostrar valores" : "Ocultar valores"}
          >
            {hideValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span className="text-sm sm:hidden">{hideValues ? "Mostrar" : "Ocultar"}</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex h-10 flex-1 sm:flex-none sm:w-10 items-center justify-center gap-2 rounded-[8px] bg-[#0b0b0b] border border-white/5 text-muted-foreground hover:bg-[#1a1a1a] hover:text-white transition-colors touch-manipulation px-4 sm:px-0"
            title="Exportar relatório"
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm sm:hidden">Exportar</span>
          </button>
        </div>
      </div>

      {/* Table with horizontal scroll on mobile */}
      <div className="-mx-2 sm:mx-0">
        <div className="overflow-x-auto">
          <PaginatedTable
            data={filteredWithdrawals}
            columns={columns}
            rowKey={(row) => row.id || row.transaction_id || Math.random().toString()}
            isLoading={isLoading}
            rowsPerPage={10}
            emptyMessage="Nenhum saque encontrado"
            tableClassName="border-none min-w-[800px]"
            headerRowClassName="border-b border-white/5 bg-[#0b0b0b] text-xs uppercase tracking-wider font-semibold text-muted-foreground"
            tableContainerClassName="border border-white/5 bg-[#0b0b0b] rounded-[8px] overflow-hidden"
          />
        </div>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <aside className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[calc(100%-2rem)] max-w-[320px] rounded-[16px] bg-[#0b0b0b] px-4 sm:px-6 py-6 text-white shadow-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-base sm:text-lg font-semibold">Exportar relatório</p>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground hover:text-white touch-manipulation"
                onClick={() => setIsExportModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
              Ao clicar em Confirmar, enviaremos o relatório para o e-mail associado à conta. Esse processo pode levar alguns minutos.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-[10px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-2.5 sm:py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110 touch-manipulation min-h-[44px]"
              onClick={() => setIsExportModalOpen(false)}
            >
              Confirmar
            </button>
          </div>
        </aside>
      )}

      {/* Filter Drawer */}
      <TransactionsFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={{ categories: [], types: [] }}
        onDateChange={(start, end) => {
          setDateRange({ start, end });
        }}
        onFilterChange={() => { }}
      />
    </div>
  );
}
