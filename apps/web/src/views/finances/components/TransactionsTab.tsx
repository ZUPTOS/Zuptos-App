
'use client';

import { useState, useMemo } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import PaginatedTable, { type Column } from '@/components/PaginatedTable';
import TransactionsFilter from './TransactionsFilter';
import {
  Search, Filter, Eye, EyeOff, Upload, X
} from 'lucide-react';
import type { Transaction } from '@/lib/api-types';

// Visual configuration for categories
const categoryMap: Record<string, { label: string; color: string }> = {
  SALE: { label: 'Venda', color: 'bg-emerald-500/10 text-emerald-500' },
  REVERSAL: { label: 'Estorno', color: 'bg-red-500/10 text-red-500' },
  CHARGEBACK: { label: 'Chargeback', color: 'bg-orange-500/10 text-orange-500' },
  WITHDRAWAL: { label: 'Saque', color: 'bg-stone-500/10 text-stone-500' },
  COMMISSION: { label: 'Comissão', color: 'bg-blue-500/10 text-blue-500' },
  MED: { label: 'Mediação', color: 'bg-purple-500/10 text-purple-500' },
  // Backward compatibility or fallback
  sale: { label: 'Venda', color: 'bg-emerald-500/10 text-emerald-500' },
  refund: { label: 'Estorno', color: 'bg-red-500/10 text-red-500' },
  chargeback: { label: 'Chargeback', color: 'bg-orange-500/10 text-orange-500' },
  withdraw: { label: 'Saque', color: 'bg-stone-500/10 text-stone-500' },
};

export default function TransactionsTab() {
  const { transactions, isLoading, error, page } = useTransactions(10);
  const [activeTab, setActiveTab] = useState<'all' | 'in' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New State for Features
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [filters, setFilters] = useState<{ categories: string[]; types: string[] }>({ categories: [], types: [] });

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Tab Filter
      if (activeTab === 'in' && tx.type?.toUpperCase() !== 'SALE') return false;
      if (activeTab === 'out' && tx.type?.toUpperCase() === 'SALE') return false;

      // 2. Search Filter (by ID or Description)
      if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        const matchesId = (tx.id || tx.transaction_id || '').toLowerCase().includes(lowerTerm);
        const matchesDesc = (tx.description || tx.product_name || '').toLowerCase().includes(lowerTerm);
        if (!matchesId && !matchesDesc) return false;
      }

      // 3. Date Filter
      if (dateRange.start && dateRange.end) {
        const txDate = new Date(tx.created_at || tx.date || '');
        if (txDate < dateRange.start || txDate > new Date(dateRange.end.getTime() + 86400000)) {
          return false;
        }
      }

      // 4. Advanced Filters (Drawer)
      if (filters && filters.categories && filters.categories.length > 0) {
        const type = tx.type?.toLowerCase();
        const status = tx.status?.toLowerCase();
        let categoryMatch = false;

        if (filters.categories.includes('sale') && type === 'sale') categoryMatch = true;
        if (filters.categories.includes('commission') && type === 'commission') categoryMatch = true;
        if (filters.categories.includes('withdraw') && type === 'withdraw') categoryMatch = true;
        if (filters.categories.includes('chargeback') && (type === 'chargeback' || status === 'chargeback')) categoryMatch = true;

        if (!categoryMatch) return false;
      }

      if (filters && filters.types && filters.types.length > 0) {
        const isEntry = tx.type?.toLowerCase() === 'sale' && tx.status !== 'refunded';
        const isExit = tx.type?.toLowerCase() !== 'sale' || tx.status === 'refunded';

        if (filters.types.includes('in') && !filters.types.includes('out') && !isEntry) return false;
        if (filters.types.includes('out') && !filters.types.includes('in') && !isExit) return false;
      }

      return true;
    });
  }, [transactions, activeTab, searchTerm, dateRange, filters]);

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
      render: (tx) => {
        const fullId = tx.id || tx.transaction_id || '------';
        const displayId = fullId.length > 8 ? `#${fullId.slice(0, 8)}...` : `#${fullId}`;
        return <span className="text-muted-foreground font-mono text-xs" title={fullId}>{displayId.toUpperCase()}</span>;
      },
    },
    {
      id: 'description',
      header: 'Descrição',
      render: (tx) => {
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-white text-sm">{tx.product_name || tx.description || 'Transação'}</span>
            <span className="text-xs text-muted-foreground">{tx.payment_method || 'Cartão'}</span>
          </div>
        );
      },
    },
    {
      id: 'amount',
      header: 'Valor',
      width: '150px',
      render: (tx) => {
        if (hideValues) return <span className="text-muted-foreground text-sm">••••••</span>;

        const isPositive = tx.type?.toUpperCase() === 'SALE' && tx.status?.toUpperCase() !== 'REFUNDED';
        return (
          <span className={`font-medium ${isPositive ? 'text-white' : 'text-foreground'}`}>
            {formatCurrency(Number(tx.amount))}
          </span>
        );
      },
    },
    {
      id: 'date',
      header: 'Data',
      width: '180px',
      render: (tx) => (
        <span className="text-muted-foreground text-xs whitespace-pre-line text-center block">
          {formatDate(tx.created_at || tx.date || '').split(' às ').join('\nàs ')}
        </span>
      ),
    },
    {
      id: 'balance_after',
      header: 'Saldo após lançamento',
      width: '180px',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      render: (tx) => {
        if (hideValues) return <span className="text-muted-foreground text-sm">••••••</span>;

        // Mocked logic for "Balance After"
        const isPositive = tx.type?.toUpperCase() === 'SALE' && tx.type?.toUpperCase() !== 'REVERSAL';
        return (
          <div className="flex items-center justify-center gap-2">
            <span className="text-white text-sm">{formatCurrency(Number(tx.amount))}</span>
            <span className={`text-[10px] ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
              {isPositive ? '↑' : '↓'}
            </span>
          </div>
        );
      },
    },
    {
      id: 'category',
      header: 'Categoria',
      width: '140px',
      headerClassName: 'text-right',
      cellClassName: 'justify-end',
      render: (tx) => {
        const typeKey = tx.type?.toUpperCase() || 'DEFAULT';
        const category = categoryMap[typeKey] || { label: tx.type, color: 'bg-foreground/10 text-foreground' };
        return (
          <span className={`inline-flex items-center justify-center rounded-[4px] px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${category.color} w-[80px]`}>
            {category.label}
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
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left: Segmented Control */}
        <div className="flex items-center rounded-lg bg-[#0b0b0b] p-1 border border-white/5">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === 'all'
              ? 'bg-[#1a1a1a] text-white shadow-sm ring-1 ring-white/10'
              : 'text-muted-foreground hover:text-white'
              }`}
          >
            Todas
          </button>
          <button
            onClick={() => setActiveTab('in')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === 'in'
              ? 'bg-[#1a1a1a] text-white shadow-sm ring-1 ring-white/10'
              : 'text-muted-foreground hover:text-white'
              }`}
          >
            Entradas
          </button>
          <button
            onClick={() => setActiveTab('out')}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === 'out'
              ? 'bg-[#1a1a1a] text-white shadow-sm ring-1 ring-white/10'
              : 'text-muted-foreground hover:text-white'
              }`}
          >
            Saídas
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por código"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg bg-[#0b0b0b] pl-9 pr-4 text-sm text-foreground border border-white/5 focus:outline-none focus:ring-1 focus:ring-primary md:w-[240px]"
            />
          </div>

          {/* Action Buttons */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b0b0b] border border-white/5 text-muted-foreground hover:bg-[#1a1a1a] hover:text-white transition-colors"
            title="Filtrar"
          >
            <Filter className="h-4 w-4" />
          </button>

          <button
            onClick={() => setHideValues(prev => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b0b0b] border border-white/5 text-muted-foreground hover:bg-[#1a1a1a] hover:text-white transition-colors"
            title={hideValues ? "Mostrar valores" : "Ocultar valores"}
          >
            {hideValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b0b0b] border border-white/5 text-muted-foreground hover:bg-[#1a1a1a] hover:text-white transition-colors"
            title="Exportar relatório"
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
      </div>

      <PaginatedTable
        data={filteredTransactions} // Use filtered data
        columns={columns}
        rowKey={(row) => row.id || row.transaction_id || Math.random().toString()}
        isLoading={isLoading}
        rowsPerPage={10}
        initialPage={page}
        emptyMessage="Nenhuma transação encontrada"
        tableClassName="border-none"
        headerRowClassName="border-b border-white/5 bg-[#0b0b0b] text-xs uppercase tracking-wider font-semibold text-muted-foreground"
        tableContainerClassName="border border-white/5 bg-[#0b0b0b] rounded-xl overflow-hidden"
      />

      {/* Feature Modals */}
      <TransactionsFilter
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialFilters={filters}
        onDateChange={(start, end) => {
          setDateRange({ start, end });
        }}
        onFilterChange={(newFilters) => setFilters(newFilters)}
      />

      {isExportModalOpen && (
        <aside className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-[320px] rounded-[16px] bg-[#0b0b0b] px-6 py-6 text-white shadow-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold">Exportar relatório</p>
              <button
                type="button"
                className="rounded-full p-1 text-muted-foreground hover:text-white"
                onClick={() => setIsExportModalOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Ao clicar em Confirmar, enviaremos o relatório para o e-mail associado à conta. Esse processo pode levar alguns minutos.
            </p>
            <button
              type="button"
              className="mt-6 w-full rounded-[10px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110"
              onClick={() => setIsExportModalOpen(false)}
            >
              Confirmar
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}
