'use client';

import { useState } from 'react';
import { Search, Plus, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

type Product = {
  id: string;
  name: string;
  type: 'Curso' | 'E-book' | 'Serviço';
  produtor: string;
  email: string;
  telefone: string;
  suporte: string;
  status: 'Ativo' | 'Inativo' | 'Pausado' | 'Em análise';
  statusColor: 'bg-emerald-500/20 text-emerald-400' | 'bg-rose-500/20 text-rose-400' | 'bg-yellow-500/20 text-yellow-400' | 'bg-blue-500/20 text-blue-400';
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
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400'
  },
  {
    id: '2',
    name: 'Produto 01',
    type: 'E-book',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Inativo',
    statusColor: 'bg-blue-500/20 text-blue-400'
  },
  {
    id: '3',
    name: 'Produto 01',
    type: 'Serviço',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Pausado',
    statusColor: 'bg-rose-500/20 text-rose-400'
  },
  {
    id: '4',
    name: 'Produto 01',
    type: 'Curso',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Ativo',
    statusColor: 'bg-emerald-500/20 text-emerald-400'
  },
  {
    id: '5',
    name: 'Produto 01',
    type: 'E-book',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Em análise',
    statusColor: 'bg-yellow-500/20 text-yellow-400'
  },
  {
    id: '6',
    name: 'Produto 01',
    type: 'Serviço',
    produtor: 'Produtor:',
    email: 'teste@gmail.com',
    telefone: '+55 99999 9999',
    suporte: 'Suporte: +55 99999 9999',
    status: 'Em análise',
    statusColor: 'bg-yellow-500/20 text-yellow-400'
  }
];

type ProductCardActionType = 'view' | 'edit' | 'delete';

function ProductCard({ product, onAction }: { product: Product; onAction: (action: ProductCardActionType, id: string) => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Curso':
        return 'bg-purple-500/10 text-purple-400';
      case 'E-book':
        return 'bg-blue-500/10 text-blue-400';
      case 'Serviço':
        return 'bg-cyan-500/10 text-cyan-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  return (
    <div className="rounded-[12px] border border-foreground/10 bg-card p-6 relative">
      {/* Menu Button */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          aria-label={`Abrir menu do produto ${product.name}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 hover:bg-muted/30 rounded-[8px] transition"
        >
          <MoreVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 top-10 z-40 w-[140px] rounded-[8px] border border-muted/70 bg-card shadow-xl overflow-hidden">
            <button
              type="button"
              onClick={() => {
                onAction('view', product.id);
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground flex items-center gap-2 transition"
            >
              <Eye className="h-4 w-4" />
              Visualizar
            </button>
            <button
              type="button"
              onClick={() => {
                onAction('edit', product.id);
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground flex items-center gap-2 transition"
            >
              <Edit className="h-4 w-4" />
              Editar
            </button>
            <button
              type="button"
              onClick={() => {
                onAction('delete', product.id);
                setIsMenuOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition border-t border-muted/50"
            >
              <Trash2 className="h-4 w-4" />
              Deletar
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pr-10">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(product.type)}`}>
              {product.type}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-foreground font-medium">👤</span>
            <span>{product.produtor}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-foreground font-medium">📧</span>
            <span>{product.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-foreground font-medium">📱</span>
            <span>{product.telefone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-foreground font-medium">🆘</span>
            <span>{product.suporte}</span>
          </div>
        </div>

        {/* Status */}
        <div className="pt-4 border-t border-foreground/10">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.statusColor}`}>
              {product.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminProdutos() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query === '') {
      setFilteredProducts(mockProducts);
    } else {
      setFilteredProducts(
        mockProducts.filter(
          product =>
            product.name.toLowerCase().includes(query) ||
            product.type.toLowerCase().includes(query) ||
            product.email.toLowerCase().includes(query)
        )
      );
    }
  };

  const handleProductAction = (action: ProductCardActionType, productId: string) => {
    console.log(`Action: ${action}, Product ID: ${productId}`);
    // TODO: Implementar ações de visualizar, editar e deletar
  };

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Gerenciar Produtos">
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-6">
          {/* Header com Search e New Button */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 rounded-[8px] border border-foreground/10 bg-card/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500/50 focus:bg-card transition"
              />
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
            >
              <Plus className="h-5 w-5" />
              Novo Produto
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAction={handleProductAction}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-lg">Nenhum produto encontrado</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredProducts.length > 0 && (
            <div className="flex items-center justify-center gap-2 py-6">
              <button
                type="button"
                className="px-3 py-2 rounded-[8px] border border-foreground/10 text-muted-foreground hover:bg-muted/30 transition text-sm"
              >
                ← Anterior
              </button>

              <div className="flex gap-1">
                {[1, 2, 3, '...', 99, 100, 101].map((page, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`px-3 py-2 rounded-[8px] text-sm font-medium transition ${
                      page === 1
                        ? 'bg-purple-600 text-white'
                        : 'border border-foreground/10 text-muted-foreground hover:bg-muted/30'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="px-3 py-2 rounded-[8px] border border-foreground/10 text-muted-foreground hover:bg-muted/30 transition text-sm"
              >
                Próximo →
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
