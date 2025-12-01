'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Filter, LifeBuoy, Mail, Phone, Search, Upload, User } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

type ProductStatus = 'Aprovado' | 'Em produção' | 'Reprovado' | 'Pendente' | 'Em atualização';

type Product = {
  id: string;
  name: string;
  type: 'Curso' | 'E-book' | 'Serviço';
  produtor: string;
  email: string;
  telefone: string;
  suporte: string;
  status: ProductStatus;
};

const statusStyles: Record<ProductStatus, string> = {
  Aprovado: 'bg-emerald-500/15 text-emerald-400',
  'Em produção': 'bg-sky-500/15 text-sky-300',
  Reprovado: 'bg-rose-500/15 text-rose-400',
  Pendente: 'bg-lime-500/15 text-lime-300',
  'Em atualização': 'bg-teal-500/15 text-teal-300'
};

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Produto 01',
    type: 'Curso',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Aprovado'
  },
  {
    id: '2',
    name: 'Produto 01',
    type: 'E-book',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Em produção'
  },
  {
    id: '3',
    name: 'Produto 01',
    type: 'Serviço',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Reprovado'
  },
  {
    id: '4',
    name: 'Produto 01',
    type: 'Curso',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Pendente'
  },
  {
    id: '5',
    name: 'Produto 01',
    type: 'E-book',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Em produção'
  },
  {
    id: '6',
    name: 'Produto 01',
    type: 'Serviço',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Em atualização'
  }
];

const infoIconClass = 'h-4 w-4 text-muted-foreground';

function ProductCard({
  product,
  onSelect,
  menuOpen,
  onToggleMenu,
  onMenuAction
}: {
  product: Product;
  onSelect: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onMenuAction: (action: 'visualizar' | 'editar' | 'deletar') => void;
}) {
  return (
    <div className="w-full text-left rounded-[12px] border border-foreground/10 bg-card shadow-[0_16px_44px_rgba(0,0,0,0.55)] dark:border-white/5 dark:bg-[#0b0b0b] p-6 transition hover:-translate-y-0.5 hover:border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60">
      <div className="flex items-start gap-4">
        <div className="flex h-[70px] w-[70px] items-center justify-center rounded-[14px] border border-foreground/10 bg-foreground/70" />
        <div className="flex flex-col gap-1">
          <h3 className="text-[20px] font-semibold text-foreground">{product.name}</h3>
          <span className="text-sm text-muted-foreground">{product.type}</span>
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

      <div className="mt-6 flex items-center justify-between border-t border-foreground/10 pt-4">
        <span className="text-sm font-semibold text-muted-foreground">Status</span>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[product.status] ?? 'bg-muted/30 text-muted-foreground'}`}
        >
          {product.status}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          aria-label="Abrir menu do produto"
          onClick={e => {
            e.stopPropagation();
            onToggleMenu();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-card text-foreground/70 transition hover:border-foreground/30 hover:text-foreground"
        >
          ···
        </button>
        {menuOpen && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onMenuAction('visualizar');
              }}
              className="rounded-[8px] border border-foreground/10 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/30"
            >
              Visualizar
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onMenuAction('editar');
              }}
              className="rounded-[8px] border border-foreground/10 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/30"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onMenuAction('deletar');
              }}
              className="rounded-[8px] border border-foreground/10 px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/30"
            >
              Deletar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminProdutos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [currentPage, setCurrentPage] = useState(3);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === '') {
      setFilteredProducts(mockProducts);
      return;
    }

    setFilteredProducts(
      mockProducts.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.type.toLowerCase().includes(query) ||
          product.email.toLowerCase().includes(query)
      )
    );
  };

  const handlePageChange = (page: number | string) => {
    if (typeof page === 'number') {
      setCurrentPage(page);
    }
  };

  const pages = [1, 2, 3, '...', 99, 100, 101] as const;

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-8 px-4 py-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[24px] font-semibold text-foreground">Produtos</p>
              <span className="text-sm text-muted-foreground">Catálogo de produtos cadastrados</span>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
              <label className="flex h-[46px] w-full min-w-[240px] max-w-[340px] items-center gap-2 rounded-[12px] border border-foreground/10 bg-card px-3 text-sm text-muted-foreground shadow-[0_12px_40px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#0f0f0f]">
                <Search className="h-4 w-4" aria-hidden />
                <input
                  type="text"
                  placeholder="Buscar produto"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-transparent text-sm uppercase text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </label>
              <button
                type="button"
                className="flex h-[46px] items-center justify-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(127,90,240,0.25)] transition hover:bg-primary/90"
              >
                Novo Produto
              </button>
              <button
                type="button"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-foreground/10 bg-card transition hover:border-white/20 hover:bg-card/70 dark:border-white/10 dark:bg-[#0f0f0f]"
                aria-label="Filtrar"
              >
                <Filter className="h-5 w-5 text-foreground" aria-hidden />
              </button>
              <button
                type="button"
                className="flex h-[46px] w-[46px] items-center justify-center rounded-[10px] border border-foreground/10 bg-card transition hover:border-white/20 hover:bg-card/70 dark:border-white/10 dark:bg-[#0f0f0f]"
                aria-label="Exportar"
              >
                <Upload className="h-5 w-5 text-foreground" aria-hidden />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => router.push('/admin/produtos/detalhes')}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push('/admin/produtos/detalhes');
                    }
                  }}
                >
                  <ProductCard
                    product={product}
                    onSelect={() => router.push('/admin/produtos/detalhes')}
                    menuOpen={openMenuId === product.id}
                    onToggleMenu={() => setOpenMenuId(product.id)}
                    onMenuAction={action => {
                      setOpenMenuId(product.id);
                      console.log(`Product ID: ${product.id} - ${action}`);
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center rounded-[12px] border border-dashed border-foreground/15 bg-card/40 py-12 text-center text-muted-foreground">
                Nenhum produto encontrado
              </div>
            )}
          </div>

          {filteredProducts.length > 0 && (
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-4 py-3 text-sm text-muted-foreground transition hover:border-white/20 hover:bg-card/70 dark:border-white/10 dark:bg-[#0f0f0f]"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                Anterior
              </button>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {pages.map((page, idx) => (
                  <button
                    key={`${page}-${idx}`}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`h-10 min-w-[40px] rounded-[10px] px-3 text-sm font-medium transition ${
                      page === currentPage
                        ? 'bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)]'
                        : 'border border-foreground/10 bg-card text-muted-foreground hover:border-white/20 hover:bg-card/70 dark:border-white/10 dark:bg-[#0f0f0f]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-4 py-3 text-sm text-muted-foreground transition hover:border-white/20 hover:bg-card/70 dark:border-white/10 dark:bg-[#0f0f0f]"
              >
                Próximo
                <ChevronRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
