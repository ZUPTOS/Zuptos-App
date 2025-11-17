'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import productsData from "@/data/productsData.json";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search
} from "lucide-react";

type ProductStatus = "ativo" | "pausado" | "em_breve";
type ProductMode = "producao" | "coproducao";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  status: ProductStatus;
  mode: ProductMode;
  thumbnail: string;
}

type TabId = "todos" | "producao" | "coproducao";

const PRODUCTS_PER_PAGE = 12;

const tabs: { id: TabId; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "producao", label: "Produção" },
  { id: "coproducao", label: "Coprodução" }
];

const statusConfig: Record<
  ProductStatus,
  { label: string; badgeClass: string }
> = {
  ativo: {
    label: "Ativo",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
  },
  pausado: {
    label: "Pausado",
    badgeClass: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/40"
  },
  em_breve: {
    label: "Em breve",
    badgeClass: "bg-sky-500/15 text-sky-400 border border-sky-500/40"
  }
};

const { products } = productsData as { products: Product[] };

const buildPaginationItems = (totalPages: number): (number | string)[] => {
  if (totalPages <= 6) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | string)[] = [];

  for (let page = 1; page <= 3; page += 1) {
    pages.push(page);
  }

  pages.push("...");

  for (let page = totalPages - 2; page <= totalPages; page += 1) {
    pages.push(page);
  }

  return pages;
};

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("todos");
  const [currentPage, setCurrentPage] = useState(1);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesTab =
        activeTab === "todos" ? true : product.mode === activeTab;
      const matchesSearch = normalizedSearch
        ? [product.name, product.category, product.description]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      return matchesTab && matchesSearch;
    });
  }, [activeTab, normalizedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch, activeTab]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  );

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages),
    [totalPages]
  );

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Produtos">
      <div className="min-h-full py-6">
        <div className="mx-auto flex w-full max-w-[1420px] flex-col gap-6 px-4 md:px-6">
          <section className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex h-12 flex-1 items-center gap-3 rounded-[10px] border border-muted bg-background px-4 text-sm text-muted-foreground focus-within:border-primary/60 focus-within:text-primary">
              <Search className="h-4 w-4" aria-hidden />
              <input
                type="text"
                placeholder="Buscar produto, curso ou assinatura"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-muted bg-card/40 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Abrir filtros de produtos"
              >
                <Filter className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-6 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(110,46,220,0.35)] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <Plus className="h-4 w-4" aria-hidden />
                Adicionar produto
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-6 border-b border-muted/30 pb-1 text-base font-semibold">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative pb-2 transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-card-foreground"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute -bottom-[1px] left-0 h-[3px] w-full rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>

            {paginatedProducts.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-[12px] border border-dashed border-muted/60 bg-card/30 text-center text-muted-foreground">
                <p className="text-lg font-semibold">Nenhum produto encontrado</p>
                <p className="text-sm">Ajuste os filtros ou adicione um novo produto.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map(product => {
                  const status = statusConfig[product.status];
                  return (
                    <article
                      key={product.id}
                      className="flex h-[148px] flex-col justify-between rounded-[16px] border border-muted bg-card/60 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[12px] bg-background/60">
                          <Image
                            src={product.thumbnail}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-contain"
                          />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-lg font-semibold text-foreground">
                                {product.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {product.category}
                              </p>
                            </div>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${status.badgeClass}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {product.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-card-foreground">
                          {product.mode === "producao" ? "Produção" : "Coprodução"}
                        </span>
                        <span>#{product.id}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-muted/60 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 rounded-[10px] border border-muted px-4 py-2 font-semibold text-card-foreground transition-colors disabled:opacity-40 ${
                currentPage === 1
                  ? ""
                  : "hover:border-primary/60 hover:text-primary"
              }`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Anterior
            </button>

            <div className="flex flex-wrap items-center justify-center gap-1">
              {paginationItems.map((item, index) => {
                if (typeof item === "string") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-muted-foreground/70"
                    >
                      {item}
                    </span>
                  );
                }

                const isActive = currentPage === item;
                return (
                  <button
                    key={`page-${item}`}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`h-9 w-9 rounded-[10px] text-sm font-semibold transition-colors ${
                      isActive
                        ? "border border-primary bg-primary/10 text-primary"
                        : "border border-transparent text-card-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                setCurrentPage(prev => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 rounded-[10px] border border-muted px-4 py-2 font-semibold text-card-foreground transition-colors disabled:opacity-40 ${
                currentPage === totalPages
                  ? ""
                  : "hover:border-primary/60 hover:text-primary"
              }`}
            >
              Próximo
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
