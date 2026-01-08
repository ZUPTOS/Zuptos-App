'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { FilterDrawer } from "@/components/FilterDrawer";
import { ProductType, productApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  X
} from "lucide-react";

type ProductStatus = "ativo" | "pausado" | "em_breve" | "inativo" | "incompleto" | "recusado";
type ProductMode = "producao" | "coproducao";

interface Product {
  id: string;
  name: string;
  type: string;
  image_url?: string;
  total_invoiced?: number;
  total_sold?: number;
  status?: ProductStatus;
  mode?: ProductMode;
  category?: string;
  description?: string;
}

type TabId = "todos" | "producao" | "coproducao";

const tabs: { id: TabId; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "producao", label: "Produção" },
  { id: "coproducao", label: "Coprodução" }
];

const DEFAULT_THUMBNAIL = "/images/produto.png";

const statusConfig: Record<ProductStatus, { label: string; badgeClass: string }> = {
  ativo: {
    label: "Ativo",
    badgeClass: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40"
  },
  inativo: {
    label: "Inativo",
    badgeClass: "bg-muted/40 text-muted-foreground border border-muted/50"
  },
  pausado: {
    label: "Pausado",
    badgeClass: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/40"
  },
  incompleto: {
    label: "Incompleto",
    badgeClass: "bg-orange-500/15 text-orange-400 border border-orange-500/40"
  },
  recusado: {
    label: "Recusado",
    badgeClass: "bg-rose-500/15 text-rose-400 border border-rose-500/40"
  },
  em_breve: {
    label: "Em breve",
    badgeClass: "bg-sky-500/15 text-sky-400 border border-sky-500/40"
  }
};

const normalizeProductStatus = (value?: string): ProductStatus => {
  const normalized = (value ?? "").trim().toLowerCase();
  if (!normalized) return "ativo";
  if (["ativo", "active"].includes(normalized)) return "ativo";
  if (["inativo", "inactive"].includes(normalized)) return "inativo";
  if (["pausado", "paused"].includes(normalized)) return "pausado";
  if (["em_breve", "em breve", "coming_soon", "coming soon"].includes(normalized)) return "em_breve";
  if (["incompleto", "incomplete", "incompleted"].includes(normalized)) return "incompleto";
  if (["recusado", "rejected", "refused", "declined"].includes(normalized)) return "recusado";
  return "ativo";
};

const filterTypeOptions = [
  { label: "Curso", value: ProductType.COURSE },
  { label: "E-BOOK ou arquivo", value: ProductType.BOOK },
  { label: "Serviço", value: ProductType.SERVICE }
];

const filterStatusOptions = [
  { label: "Ativo", value: "ativo" },
  { label: "Incompleto", value: "incompleto" },
  { label: "Recusado", value: "recusado" },
  { label: "Inativo", value: "inativo" }
];

const productCategoryOptions = [
  "Animais e Plantas",
  "Apps & Software",
  "Casa e Construção",
  "Culinária e Gastronomia",
  "Desenvolvimento Pessoal",
  "Direito",
  "Ecologia e Meio Ambiente",
  "Educacional",
  "Empreendedorismo Digital",
  "Entretenimento",
  "Espiritualidade",
  "Finanças e Investimentos",
  "Hobbies",
  "Idiomas",
  "Internet",
  "Literatura",
  "Moda e Beleza",
  "Música e Artes",
  "Negócios e Carreira",
  "Relacionamentos",
  "Saúde e Esportes",
  "Sexualidade",
  "Tecnologia da Informação",
  "Outros"
];

const formInputClasses =
  "w-full rounded-[7px] border border-foreground/25 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0";

const typeLabelMap: Record<string, string> = {
  [ProductType.COURSE]: "Curso",
  [ProductType.BOOK]: "E-BOOK ou arquivo",
  [ProductType.SERVICE]: "Serviço",
};

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
  const { user, token } = useAuth();
  const router = useRouter();
  const displayName = user?.username || user?.fullName || user?.email || "Zuptos";
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProductType, setNewProductType] = useState<ProductType>(ProductType.COURSE);
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [internalComplement, setInternalComplement] = useState("");
  const [salesPageUrl, setSalesPageUrl] = useState("");
  const [hasLoginAccess, setHasLoginAccess] = useState(false);
  const [productLogin, setProductLogin] = useState("");
  const [productPassword, setProductPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const resolveUserId = useCallback(() => {
    if (user?.id) return user.id;
    const stored = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
    if (!stored) return undefined;
    try {
      const parsed = JSON.parse(stored) as { id?: string };
      return parsed.id;
    } catch {
      return undefined;
    }
  }, [user?.id]);

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
      const normalizedType = product.type?.toLowerCase() ?? "";
      const matchesTab =
        activeTab === "todos" ? true : product.mode === activeTab;
      const matchesSearch = normalizedSearch
        ? [
            product.name,
            typeLabelMap[normalizedType] ?? product.type,
            product.category ?? "",
            product.description ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch)
        : true;
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(normalizedType);
      const statusValue = product.status ?? "ativo";
      const matchesStatus =
        selectedStatuses.length === 0
          ? statusValue !== "inativo"
          : selectedStatuses.includes(statusValue);
      return matchesTab && matchesSearch && matchesType && matchesStatus;
    });
  }, [activeTab, normalizedSearch, products, selectedTypes, selectedStatuses]);

  useEffect(() => {
    setCurrentPage(1);
  }, [normalizedSearch, activeTab]);

  useEffect(() => {
    const updateItems = () => {
      if (typeof window === "undefined") return;
      const width = window.innerWidth;
      if (width < 640) setItemsPerPage(6);
      else if (width < 900) setItemsPerPage(8);
      else setItemsPerPage(12);
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

  const resetNewProductForm = () => {
    setNewProductType(ProductType.COURSE);
    setNewProductName("");
    setNewProductDescription("");
    setNewProductCategory("");
    setInternalComplement("");
    setSalesPageUrl("");
    setHasLoginAccess(false);
    setProductLogin("");
    setProductPassword("");
  };

  const handleAddProductClick = () => {
    setIsAddProductOpen(true);
  };

  const closeNewProductModal = () => {
    setIsAddProductOpen(false);
    resetNewProductForm();
  };

  const handleProductSubmit = async () => {
    const saleUrl = salesPageUrl.trim();
    const description = newProductDescription.trim();
    const internalDescription = internalComplement.trim();
    const authToken = token ?? undefined;
    if (!authToken) {
      setLoadError("Sua sessão expirou. Faça login novamente para criar produtos.");
      return;
    }
    const payload = {
      name: newProductName.trim() || "Novo produto",
      type: newProductType || ProductType.COURSE,
      description: description || undefined,
      category: newProductCategory || "Outros",
      internal_description: internalDescription || undefined,
      sale_url: saleUrl || undefined,
      login_username:
        hasLoginAccess && productLogin.trim() ? productLogin.trim() : undefined,
      login_password: hasLoginAccess && productPassword ? productPassword : undefined
    };
    try {
      console.log("🔄 [Products] Payload para criar produto:", payload);
      await productApi.createProduct(payload, authToken);
      closeNewProductModal();
      await loadProducts();
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      setLoadError("Não foi possível criar o produto. Verifique os dados e tente novamente.");
      closeNewProductModal();
    }
  };

  useEffect(() => {
    adjustTextareaHeight(descriptionRef.current);
  }, [newProductDescription]);


  const loadProducts = async () => {
    if (!token) {
      setLoadError("Sua sessão expirou. Faça login novamente.");
      setProducts([]);
      return;
    }
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await productApi.listProducts(
        {
          page: Math.max(currentPage, 1),
          limit: Math.min(Math.max(itemsPerPage, 1), 10),
        },
        token ?? undefined
      );
      const normalized: Product[] = data.map((item, index) => ({
        ...item,
        category: item.type,
        description: (item as Product & { description?: string }).description ?? "",
        status: normalizeProductStatus((item as Product & { status?: string }).status),
        mode: index % 2 === 0 ? "producao" : "coproducao"
      }));
      console.log("[Products] Produtos carregados:", normalized);
      setProducts(normalized);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      setLoadError("Não foi possível carregar os produtos.");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolveUserId, token, user, currentPage, itemsPerPage]);

  return (
    <>
      <DashboardLayout userName={displayName} userLocation="RJ" pageTitle="Produtos">
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
                placeholder="Buscar produto"
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
              onClick={handleAddProductClick}
              className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-primary px-6 text-sm font-semibold text-white transition-transform disabled:cursor-not-allowed disabled:opacity-60"
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

            {loadError && (
              <div className="rounded-[10px] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {loadError}
              </div>
            )}
            {isLoading ? (
              <div className="flex h-56 items-center justify-center rounded-[12px] border border-dashed border-muted/60 bg-card/30 text-muted-foreground">
                Carregando produtos...
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center rounded-[12px] border border-dashed border-muted/60 bg-card/30 text-center text-muted-foreground">
                <p className="text-lg font-semibold">Nenhum produto encontrado</p>
                <p className="text-sm">Ajuste os filtros ou adicione um novo produto.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedProducts.map(product => {
                  const status = statusConfig[product.status ?? "ativo"];
                  const thumbnailSrc = product.image_url || DEFAULT_THUMBNAIL;
                  const typeLabel =
                    typeLabelMap[product.type ? product.type.toLowerCase() : ""] ??
                    product.category ??
                    product.type ??
                    "—";
                  const handleOpenProduct = () => {
                    if (product.id) {
                      // Persist id localmente para telas subsequentes, se necessário
                      localStorage.setItem("lastProductId", product.id);
                      router.push(`/editar-produto/${encodeURIComponent(product.id)}/entregaveis`);
                    }
                  };

                  return (
                    <article
                      key={product.id}
                      onClick={handleOpenProduct}
                      className="flex min-h-[140px] w-full cursor-pointer items-center gap-4 rounded-[16px] border border-muted bg-card/60 p-4 transition hover:border-primary/50 hover:bg-card/80"
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
                          {typeLabel}
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
    <FilterDrawer open={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filtrar">
      <div className="space-y-6 text-sm">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Tipo</p>
          <div className="space-y-3">
            {filterTypeOptions.map(option => (
              <label
                key={option.value}
                className="flex items-center gap-3 text-foreground"
                style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(12px, 1.2vw, 15px)" }}
              >
                <span className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(option.value)}
                    onChange={() => toggleType(option.value)}
                    className="peer sr-only"
                  />
                  <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[7px] border border-foreground/20 bg-transparent transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:opacity-100">
                    <Check className="h-4 w-4 text-white opacity-0 transition-opacity" aria-hidden />
                  </span>
                </span>
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-3 border-t border-foreground/10 pt-4">
          <p className="text-sm font-semibold text-muted-foreground">Status</p>
          <div className="space-y-3">
            {filterStatusOptions.map(option => (
              <label
                key={option.value}
                className="flex items-center gap-3 text-foreground"
                style={{ fontFamily: "Sora, sans-serif", fontSize: "clamp(12px, 1.2vw, 15px)" }}
              >
                <span className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(option.value)}
                    onChange={() => toggleStatus(option.value)}
                    className="peer sr-only"
                  />
                  <span className="flex h-[24px] w-[24px] items-center justify-center rounded-[7px] border border-foreground/20 bg-transparent transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:opacity-100">
                    <Check className="h-4 w-4 text-white opacity-0 transition-opacity" aria-hidden />
                  </span>
                </span>
                {option.label}
              </label>
            ))}
          </div>
        </div>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsFilterOpen(false)}
            className="h-[46px] w-full rounded-[7px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-3 text-sm font-semibold text-white"
          >
            Adicionar filtro
          </button>
        </div>
      </div>
    </FilterDrawer>
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
        <div className="flex-1 space-y-6 overflow-y-auto py-6 pr-1 custom-scrollbar">
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
                      type="radio"
                      name="product-type"
                      checked={newProductType === option.value}
                      onChange={() => setNewProductType(option.value)}
                      className="peer sr-only"
                    />
                    <span className="flex h-[26px] w-[26px] items-center justify-center rounded border border-foreground/10 bg-card transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-checked:border-primary peer-checked:bg-primary peer-checked:[&>svg]:opacity-100">
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
                  className="group relative inline-flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span
                    className={`flex h-[31px] w-[80px] items-center justify-between gap-1 rounded-full border px-2 text-[11px] font-semibold transition-colors ${
                      hasLoginAccess
                        ? "bg-gradient-to-r from-[#6c27d7] to-[#421E8B] text-white border-primary/60 shadow-sm"
                        : "bg-card text-foreground border-foreground/20 shadow-sm"
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
                        hasLoginAccess ? "order-2 translate-x-[5px]" : "order-1 -translate-x-[5px]"
                      }`}
                    />
                  </span>
                </button>
              </div>
              {hasLoginAccess && (
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
              )}
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
              className="flex-1 rounded-[7px] bg-gradient-to-r from-[#6C27D7] to-[#421E8B] px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
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
