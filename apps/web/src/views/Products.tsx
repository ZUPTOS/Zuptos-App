'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import productsData from "@/data/productsData.json";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  X
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

const tabs: { id: TabId; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "producao", label: "Produção" },
  { id: "coproducao", label: "Coprodução" }
];

const DEFAULT_THUMBNAIL = "/images/produto.png";

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

const filterTypeOptions = [
  { label: "Curso", value: "curso" },
  { label: "E-BOOK ou arquivo", value: "ebook" },
  { label: "Serviço", value: "servico" }
];

const filterStatusOptions = [
  { label: "Ativo", value: "ativo" },
  { label: "Incompleto", value: "incompleto" },
  { label: "Recusado", value: "recusado" },
  { label: "Inativo", value: "inativo" }
];

const productCategoryOptions = ["Tecnologia", "Marketing", "Finanças"];

const formInputClasses =
  "w-full rounded-[10px] border border-muted bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

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
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductTypes, setNewProductTypes] = useState<string[]>([]);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [internalComplement, setInternalComplement] = useState("");
  const [salesPageUrl, setSalesPageUrl] = useState("");
  const [hasLoginAccess, setHasLoginAccess] = useState(false);
  const [productLogin, setProductLogin] = useState("");
  const [productPassword, setProductPassword] = useState("");
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const handleOverlayKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    action: () => void
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

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

  useEffect(() => {
    const updateItems = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width >= 1900) setItemsPerPage(12);
      else if (width >= 1600) setItemsPerPage(10);
      else setItemsPerPage(8);
    };
    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage)
  );

  useEffect(() => {
    setCurrentPage(prev => Math.min(prev, totalPages));
  }, [totalPages, itemsPerPage, filteredProducts.length]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const paginationItems = useMemo(
    () => buildPaginationItems(totalPages),
    [totalPages]
  );

  const toggleType = (value: string) => {
    setSelectedTypes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const toggleStatus = (value: string) => {
    setSelectedStatuses(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const adjustTextareaHeight = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  const toggleNewProductType = (value: string) => {
    setNewProductTypes(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const resetNewProductForm = () => {
    setNewProductTypes([]);
    setNewProductName("");
    setNewProductDescription("");
    setNewProductCategory("");
    setInternalComplement("");
    setSalesPageUrl("");
    setHasLoginAccess(false);
    setProductLogin("");
    setProductPassword("");
  };

  const closeNewProductModal = () => {
    setIsAddProductOpen(false);
    resetNewProductForm();
  };

  const handleProductSubmit = () => {
    closeNewProductModal();
  };

  useEffect(() => {
    adjustTextareaHeight(descriptionRef.current);
  }, [newProductDescription]);

  return (
    <>
      <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="Produtos">
        <div className="min-h-full py-6">
          <div
            className="mx-auto flex w-full flex-col gap-6 px-4 md:px-6"
            style={{ maxWidth: "var(--dash-layout-width)" }}
          >
          <section className="flex flex-wrap items-center gap-3">
            <label
              className="flex h-[49px] items-center gap-3 rounded-[8px] border border-muted bg-background px-3 text-fs-body text-muted-foreground focus-within:border-primary/60 focus-within:text-primary"
              style={{ width: "clamp(280px, 32vw, 440px)" }}
            >
              <Search className="h-5 w-5" aria-hidden />
              <input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="w-full bg-transparent text-fs-body text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </label>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-muted bg-card/40 text-muted-foreground transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Abrir filtros de produtos"
              onClick={() => setIsFilterOpen(true)}
            >
              <Filter className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setIsAddProductOpen(true)}
              className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-primary px-6 text-sm font-semibold text-white transition-transform"
            >
              <Plus className="h-5 w-5" aria-hidden />
              Adicionar produto
            </button>
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
                  const status = statusConfig["ativo"];
                  const thumbnailSrc = DEFAULT_THUMBNAIL;
                  return (
                    <article
                      key={product.id}
                      className="flex min-h-[140px] w-full items-center gap-4 rounded-[16px] border border-muted bg-card/60 p-4"
                    >
                      <div
                        className="flex flex-shrink-0 items-center justify-center rounded-[16px] bg-background/60"
                        style={{ width: "clamp(86px, 11vw, 110px)", height: "clamp(86px, 11vw, 110px)" }}
                      >
                          <Image
                            src={thumbnailSrc}
                          alt={product.name}
                          width={110}
                          height={110}
                          className="h-full w-full rounded-[12px] object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-center gap-2">
                        <p className="text-fs-title font-semibold text-foreground leading-tight">
                          {product.name}
                        </p>
                        <p className="text-fs-body text-muted-foreground">
                          {product.category}
                        </p>
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-[6px] text-[11px] font-semibold leading-tight ${status.badgeClass}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
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
                        ? "bg-card text-foreground"
                        : "text-foreground hover:border-card hover:text-foreground"
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
    {isFilterOpen && (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/60"
          role="button"
          tabIndex={0}
          aria-label="Fechar filtros de produtos"
          onClick={() => setIsFilterOpen(false)}
          onKeyDown={event => handleOverlayKeyDown(event, () => setIsFilterOpen(false))}
        />
        <aside
          className="fixed right-0 top-0 z-50 flex h-screen flex-col border-l border-muted bg-card p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
          style={{
            width: "clamp(360px, 28vw, 500px)"
          }}
        >
          <div className="flex items-center justify-between border-b border-muted pb-4">
            <div>
              <p
                className="font-semibold text-foreground"
                style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(20px, 2vw, 28px)" }}
              >
                Filtrar
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Fechar filtros"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto mt-10 py-6">
            <div className="space-y-4 border-b border-muted pb-4">
              <p
                className="font-semibold text-muted-foreground"
                style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(13px, 1.4vw, 17px)" }}
              >
                Tipo
              </p>
              <div className="space-y-4">
                {filterTypeOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 text-foreground/30"
                    style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(12px, 1.2vw, 15px)" }}
                  >
                    <span className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(option.value)}
                        onChange={() => toggleType(option.value)}
                        className="peer sr-only"
                      />
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded border border-card bg-background transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:opacity-100">
                        <Check className="h-4 w-4 text-white opacity-0 transition-opacity" aria-hidden />
                      </span>
                    </span>
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-4 border-b border-muted pb-4">
              <p
                className="font-semibold text-muted-foreground"
                style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(13px, 1.4vw, 17px)" }}
              >
                Status
              </p>
              <div className="space-y-4">
                {filterStatusOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 text-foreground/30"
                    style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(12px, 1.2vw, 15px)" }}
                  >
                    <span className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(option.value)}
                        onChange={() => toggleStatus(option.value)}
                        className="peer sr-only"
                      />
                      <span className="flex h-[30px] w-[30px] items-center justify-center rounded border border-card bg-background transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:opacity-100">
                        <Check className="h-4 w-4 text-white opacity-0 transition-opacity" aria-hidden />
                      </span>
                    </span>
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="h-[49px] w-[197px] rounded-[10px] bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(110,46,220,0.35)]"
              >
                Adicionar filtro
              </button>
            </div>
          </div>
        </aside>
      </>
    )}
    {isAddProductOpen && (
      <>
        <div
          className="fixed inset-0 z-[55] bg-black/60"
          role="button"
          tabIndex={0}
          aria-label="Fechar modal de novo produto"
          onClick={closeNewProductModal}
          onKeyDown={event => handleOverlayKeyDown(event, closeNewProductModal)}
        />
        <aside
          className="fixed right-0 top-0 z-[60] flex h-full w-full flex-col border-l border-muted bg-card p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)]"
          style={{ maxWidth: "clamp(360px, 30vw, 500px)" }}
        >
          <div className="flex items-start justify-between border-b border-muted pb-4">
          <div>
            <p
              className="font-semibold text-foreground"
              style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(20px, 2vw, 28px)" }}
            >
              Novo produto
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontSize: "clamp(12px, 1.2vw, 14px)" }}
            >
              Configure e dê um nome para o novo produto
            </p>
          </div>
          <button
            type="button"
            onClick={closeNewProductModal}
            className="text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label="Fechar modal de novo produto"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto py-6 custom-scrollbar">
          <div className="space-y-3">
            <p
              className="font-semibold text-foreground"
              style={{ fontSize: "clamp(13px, 1.3vw, 16px)" }}
            >
              Tipo
            </p>
            <div className="flex items-center gap-3 overflow-x-auto whitespace-nowrap custom-scrollbar">
              {filterTypeOptions.map(option => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 whitespace-nowrap text-foreground/80"
                  style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(12px, 1.2vw, 14px)" }}
                >
                  <span className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={newProductTypes.includes(option.value)}
                      onChange={() => toggleNewProductType(option.value)}
                      className="peer sr-only"
                    />
                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded border border-card bg-background transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:opacity-100">
                      <Check
                        className="h-4 w-4 text-white opacity-0 transition-opacity"
                        aria-hidden
                      />
                    </span>
                  </span>
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-muted pt-4">
            <div className="space-y-1">
              <p className="text-[16px] font-semibold text-foreground">
                Informações externas
              </p>
              <p className="text-[14px] text-muted-foreground">
                Serão disponibilizadas para os compradores
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[16px] font-semibold text-foreground">
                  Nome do produto
                </p>
                <input
                  type="text"
                  value={newProductName}
                  onChange={event => setNewProductName(event.target.value)}
                  maxLength={60}
                  placeholder="Insira o nome"
                  className={formInputClasses}
                />
                <span className="text-xs text-muted-foreground">{`${newProductName.length}/60 caracteres`}</span>
              </div>
              <div className="space-y-2">
                <p className="text-[16px] font-semibold text-foreground">
                  Descrição breve
                </p>
                <textarea
                  ref={descriptionRef}
                  rows={1}
                  value={newProductDescription}
                  onChange={event => setNewProductDescription(event.target.value)}
                  maxLength={200}
                  placeholder="Insira o nome"
                  className={`${formInputClasses} resize-none`}
                />
                <span className="text-xs text-muted-foreground">{`${newProductDescription.length}/200 caracteres`}</span>
              </div>
              <div className="space-y-2">
                <p className="text-[16px] font-semibold text-foreground">Categoria</p>
                <select
                  value={newProductCategory}
                  onChange={event => setNewProductCategory(event.target.value)}
                  className={`${formInputClasses} appearance-none`}
                >
                  <option value="" disabled hidden>
                    Selecione a categoria
                  </option>
                  {productCategoryOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4 rounded-[16px] border border-muted bg-card/60 p-5">
            <div className="space-y-1">
              <p className="text-[16px] font-semibold text-foreground">
                Informações internas
              </p>
              <p className="text-[14px] text-muted-foreground">
                Serão usadas pela nossa equipe para avaliar o seu produto
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-[16px] font-semibold text-foreground">
                  Informações complementares
                </p>
                <textarea
                  value={internalComplement}
                  onChange={event => setInternalComplement(event.target.value)}
                  className={`${formInputClasses} min-h-[120px] resize-none`}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[16px] font-semibold text-foreground">
                  Página de vendas (onde está sua oferta)
                </p>
                <input
                  type="text"
                  value={salesPageUrl}
                  onChange={event => setSalesPageUrl(event.target.value)}
                  className={formInputClasses}
                />
              </div>
              <div className="space-y-2">
                <p className="text-[16px] font-semibold text-foreground">
                  O seu produto entregue possui login e senha?
                </p>
                <button
                  type="button"
                  onClick={() => setHasLoginAccess(prev => !prev)}
                  aria-pressed={hasLoginAccess}
                  className="group relative inline-flex items-center"
                >
                  <span
                    className={`flex h-[31px] w-[75px] items-center justify-between gap-1 rounded-full border border-card px-2 text-[11px] font-semibold transition-colors ${
                      hasLoginAccess
                        ? "bg-gradient-to-r from-[#a855f7] to-[#7c3aed] text-white border-primary/60"
                        : "bg-card text-muted-foreground"
                    }`}
                  >
                    <span
                      className={`flex-1 select-none tracking-tight ${
                        hasLoginAccess ? "order-1 text-left" : "order-2 text-right"
                      }`}
                    >
                      {hasLoginAccess ? "SIM" : "NÃO"}
                    </span>
                    <span
                      className={`h-[25px] w-[25px] rounded-full bg-white shadow-sm transition-all ${
                        hasLoginAccess ? "order-2 translate-x-[2px]" : "order-1 -translate-x-[2px]"
                      }`}
                    />
                  </span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-[16px] font-semibold text-foreground">Login</p>
                  <input
                    type="text"
                    value={productLogin}
                    onChange={event => setProductLogin(event.target.value)}
                    className={formInputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[16px] font-semibold text-foreground">Senha</p>
                  <input
                    type="text"
                    value={productPassword}
                    onChange={event => setProductPassword(event.target.value)}
                    className={formInputClasses}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
          <div className="flex gap-3 border-t border-muted pt-4">
            <button
              type="button"
              onClick={closeNewProductModal}
              className="flex-1 rounded-[10px] border border-muted bg-card px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleProductSubmit}
              className="flex-1 rounded-[10px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(110,46,220,0.35)] transition-transform hover:scale-[1.01]"
            >
              Cadastrar produto
            </button>
          </div>
        </aside>
      </>
    )}
  </>
);
}
