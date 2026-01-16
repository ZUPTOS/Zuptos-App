'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Filter, LifeBuoy, Mail, Phone, Search, Upload, User } from 'lucide-react';
import DashboardLayout from '@/shared/components/layout/DashboardLayout';
import { FilterDrawer } from '@/shared/components/FilterDrawer';
import DateFilter from '@/shared/components/DateFilter';
import ConfirmModal from '@/shared/components/ConfirmModal';
import { buildPageIndicators } from '@/lib/pagination';
import { useAdminProducts, type AdminProductRow } from '@/modules/admin/hooks';

const statusStyles: Record<string, string> = {
  Aprovado: 'bg-emerald-500/15 text-emerald-400',
  'Em produção': 'bg-sky-500/15 text-sky-300',
  Reprovado: 'bg-rose-500/15 text-rose-400',
  Pendente: 'bg-lime-500/15 text-lime-300',
  'Em atualização': 'bg-teal-500/15 text-teal-300',
  Inativo: 'bg-orange-500/15 text-orange-400'
};

const infoIconClass = 'h-4 w-4 text-muted-foreground';

function ProductCard({ product }: { product: AdminProductRow }) {
  return (
    <div className="w-full xl:max-w-[390px] 2xl:max-w-[417px] 2xl:max-h-[400px] xl:max-h-[350px] text-left rounded-[12px] border border-foreground/10 bg-card p-6 transition hover:-translate-y-0.5 hover:border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
      <div className="flex items-start gap-4">
        <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[14px] border border-foreground/10 bg-foreground/70" />
        <div className="flex flex-col gap-1">
          <h3 className="text-[20px] font-semibold text-foreground">{product.name}</h3>
          <span className="text-sm text-muted-foreground">{product.typeLabel}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className={infoIconClass} aria-hidden />
          <span>{product.produtor}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className={infoIconClass} aria-hidden />
          <span>{product.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className={infoIconClass} aria-hidden />
          <span>{product.telefone}</span>
        </div>
        <div className="flex items-center gap-2">
          <LifeBuoy className={infoIconClass} aria-hidden />
          <span>{product.suporte}</span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between pt-2">
        <span className="text-sm font-semibold text-muted-foreground">Status</span>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[product.statusLabel] ?? 'bg-muted/30 text-muted-foreground'}`}
        >
          {product.statusLabel}
        </span>
      </div>
    </div>
  );
}

export default function AdminProdutos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const router = useRouter();
  const { products, summary, isLoading } = useAdminProducts({ pageSize: 60 });

  const toggleSelection = (value: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(value) ? list.filter(item => item !== value) : [...list, value]);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  const handlePageChange = (page: number | string) => {
    if (typeof page === 'number') {
      setCurrentPage(page);
    }
  };

  const pageSize = 6;
  const filteredProducts = useMemo(() => {
    let list = products;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.typeLabel.toLowerCase().includes(query) ||
          product.email.toLowerCase().includes(query)
      );
    }
    if (selectedStatuses.length > 0) {
      list = list.filter(product => selectedStatuses.includes(product.statusLabel));
    }
    if (selectedServices.length > 0) {
      list = list.filter(product => selectedServices.includes(product.typeLabel));
    }
    return list;
  }, [products, searchQuery, selectedServices, selectedStatuses]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  // keep the same pagination pattern used across other tables (1 2 3 ... last-2 last-1 last)
  const pageIndicators = buildPageIndicators(totalPages, currentPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalProducts = summary.total ?? 0;
  const totalRevenue = summary.totalRevenue ?? summary.total_revenue ?? 0;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  return (
    <>
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full 2xl:max-w-[1320px] xl:max-w-[1050px] flex-col gap-6 px-2 py-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <p className="text-[24px] font-semibold text-foreground">Produtos</p>
              <span className="text-sm text-muted-foreground">Catálogo de produtos cadastrados</span>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
              <label className="flex xl:h-[36px] 2xl:h-[46px] w-full min-w-[240px] 2xl:max-w-[240px] items-center xl:max-w-[140px] gap-2 rounded-[12px] border border-foreground/10 bg-card px-3 text-sm text-muted-foreground">
                <Search className="h-4 w-4" aria-hidden />
                <input
                  type="text"
                  placeholder="Buscar produto"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <button
                type="button"
                className="flex xl:h-[36px] 2xl:h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-foreground/10 bg-card transition hover:border-white/20 hover:bg-card/70 dark:border-white/10 dark:bg-[#0f0f0f]"
                aria-label="Filtrar"
                onClick={() => setIsFilterOpen(true)}
              >
                <Filter className="h-5 w-5 text-foreground" aria-hidden />
              </button>
              <button
                type="button"
                className="flex xl:h-[36px] 2xl:h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-foreground/10 bg-card transition hover:border-white/20 hover:bg-card/70 dark:border-white/10 dark:bg-[#0f0f0f]"
                aria-label="Exportar"
                onClick={() => setIsExportModalOpen(true)}
              >
                <Upload className="h-5 w-5 text-foreground" aria-hidden />
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[8px] border border-foreground/10 bg-card/60 p-4">
              <p className="text-sm text-muted-foreground">Total de produtos</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{totalProducts}</p>
            </div>
            <div className="rounded-[8px] border border-foreground/10 bg-card/60 p-4">
              <p className="text-sm text-muted-foreground">Receita total</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(Number(totalRevenue) || 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.length > 0 ? (
              paginatedProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/admin/produtos/detalhes?id=${product.id}`)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/admin/produtos/detalhes?id=${product.id}`);
                    }
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : !isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[7px] border border-dashed border-foreground/15 bg-card/40 py-12 text-center text-muted-foreground">
                Nenhum produto encontrado
              </div>
            ) : null}
          </div>

          {filteredProducts.length > 0 && (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                <span>Anterior</span>
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {pageIndicators.map((page, idx) => (
                  <button
                    key={`${page}-${idx}`}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`h-10 min-w-[40px] rounded-[10px] px-3 text-sm font-medium transition ${
                      page === currentPage ? 'bg-card text-foreground' : 'text-muted-foreground'
                    } ${page === '...' ? 'cursor-default' : 'hover:text-foreground'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="inline-flex items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-40"
                disabled={currentPage === totalPages}
              >
                <span>Próximo</span>
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
    <FilterDrawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtrar">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Data</p>
          <DateFilter />
        </div>

        <div className="space-y-3 border-t border-foreground/10 pt-4">
          <p className="text-sm font-semibold text-foreground">Status</p>
          <div className="grid grid-cols-1 gap-3 text-foreground">
            {['Aprovado', 'Reprovado', 'Pendente', 'Em produção', 'Excluído', 'Em atualização'].map(option => (
              <label key={option} className="flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(option)}
                  onChange={() => toggleSelection(option, selectedStatuses, setSelectedStatuses)}
                  className="relative h-[22px] w-[22px] appearance-none rounded-[7px] border border-foreground/25 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 border-t border-foreground/10 pt-4">
          <p className="text-sm font-semibold text-foreground">Serviço</p>
          <div className="grid grid-cols-1 gap-3 text-foreground">
            {['Curso', 'Serviço', 'E-book'].map(option => (
              <label key={option} className="flex items-center gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(option)}
                  onChange={() => toggleSelection(option, selectedServices, setSelectedServices)}
                  className="relative h-[22px] w-[22px] appearance-none rounded-[7px] border border-foreground/25 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 checked:border-primary checked:bg-primary"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            className="h-[46px] w-full rounded-[7px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-3 text-sm font-semibold text-white"
            onClick={() => setIsFilterOpen(false)}
          >
            Adicionar filtro
          </button>
        </div>
      </div>
    </FilterDrawer>
    <ConfirmModal
      open={isExportModalOpen}
      onClose={() => setIsExportModalOpen(false)}
      title="Exportar relatório"
      description={
        <span>
          Ao clicar em Confirmar, enviaremos o relatório para <span className="text-foreground">con****@gmail.com</span>. O envio pode levar
          alguns minutos.
        </span>
      }
    />
    </>
  );
}
