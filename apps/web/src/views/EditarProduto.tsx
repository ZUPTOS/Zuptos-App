'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { productApi } from "@/lib/api";
import type {
  Product,
  ProductDeliverable,
  ProductOffer,
  Checkout,
  ProductSettings,
  UpdateProductSettingsRequest,
  ProductPlan,
  CreateProductPlanRequest,
  ProductStrategy,
  ProductCoupon,
  CreateProductCouponRequest,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingOverlay } from "@/contexts/LoadingOverlayContext";
import { Skeleton } from "@/components/ui/skeleton";

const tabs = [
  "Entregável",
  "Ofertas",
  "Checkouts",
  "Configurações",
  "Pixels de rastreamento",
  "Upsell, downsell e mais",
  "Cupons",
  "Coprodução",
] as const;

const coproductions = [
  { name: "BÁSICO", start: "dd/mm/aaaa", commission: "0%", duration: "Vitalícia", status: "Aprovado" },
] as const;

type TabLabel = (typeof tabs)[number];

const tabSlugMap: Record<string, TabLabel> = {
  entregaveis: "Entregável",
  ofertas: "Ofertas",
  checkouts: "Checkouts",
  configuracoes: "Configurações",
  pixels: "Pixels de rastreamento",
  upsell: "Upsell, downsell e mais",
  cupons: "Cupons",
  coproducao: "Coprodução",
};

const tabToSlug: Record<TabLabel, string> = {
  Entregável: "entregaveis",
  Ofertas: "ofertas",
  Checkouts: "checkouts",
  Configurações: "configuracoes",
  "Pixels de rastreamento": "pixels",
  "Upsell, downsell e mais": "upsell",
  Cupons: "cupons",
  Coprodução: "coproducao",
};

export default function EditarProdutoView({ initialTab }: { initialTab?: string } = {}) {
  const searchParams = useSearchParams();
  const params = useParams<{ id?: string }>();
  const productId = useMemo(() => {
    if (params?.id) return params.id;
    const fromQuery = searchParams?.get("id");
    if (fromQuery) return fromQuery;
    if (typeof window !== "undefined") {
      return localStorage.getItem("lastProductId") ?? undefined;
    }
    return undefined;
  }, [params, searchParams]);
  const { token } = useAuth();
  const { withLoading } = useLoadingOverlay();
  const [product, setProduct] = useState<Product | null>(null);
  const [productLoading, setProductLoading] = useState(false);
  const initialTabLabel = (initialTab && tabSlugMap[initialTab]) || "Entregável";
  const [activeTab, setActiveTab] = useState<TabLabel>(initialTabLabel);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showPixelModal, setShowPixelModal] = useState(false);
  const [showPixelFormModal, setShowPixelFormModal] = useState(false);
  const [selectedPixelPlatform, setSelectedPixelPlatform] = useState<string | null>(null);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCoproductionModal, setShowCoproductionModal] = useState(false);
  const [showCoproductionDetailModal, setShowCoproductionDetailModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [deliverableTab, setDeliverableTab] = useState<"arquivo" | "link">("arquivo");
  const [deliverables, setDeliverables] = useState<ProductDeliverable[]>([]);
  const [deliverablesLoading, setDeliverablesLoading] = useState(false);
  const [deliverablesError, setDeliverablesError] = useState<string | null>(null);
  const [deliverableName, setDeliverableName] = useState("");
  const [deliverableContent, setDeliverableContent] = useState("");
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableFormError, setDeliverableFormError] = useState<string | null>(null);
  const [savingDeliverable, setSavingDeliverable] = useState(false);
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [offerName, setOfferName] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerBackRedirect, setOfferBackRedirect] = useState("");
  const [offerNextRedirect, setOfferNextRedirect] = useState("");
  const [offerStatus, setOfferStatus] = useState<"active" | "inactive">("active");
  const [offerFree, setOfferFree] = useState(false);
  const [savingOffer, setSavingOffer] = useState(false);
  const [couponUnit, setCouponUnit] = useState<"valor" | "percent">("valor");
  const [offerType, setOfferType] = useState<"preco_unico" | "assinatura">("preco_unico");
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutsLoading, setCheckoutsLoading] = useState(false);
  const [checkoutsError, setCheckoutsError] = useState<string | null>(null);
  const [settings, setSettings] = useState<ProductSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [, setSettingsError] = useState<string | null>(null);
  const [plans, setPlans] = useState<ProductPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: "",
    type: "monthly",
    status: "active",
    plan_price: "",
    normal_price: "",
    discount_price: "",
    cycles: "",
    price_first_cycle: "",
    default: false,
  });
  const [strategies, setStrategies] = useState<ProductStrategy[]>([]);
  const [strategiesLoading, setStrategiesLoading] = useState(false);
  const [strategiesError, setStrategiesError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<ProductCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState<string | null>(null);
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponForm, setCouponForm] = useState({
    coupon_code: "",
    discount_amount: "",
    is_percentage: false,
    internal_name: "",
    expires_at: "",
    minimum_purchase_amount: "",
    limit_usage: "",
    status: "active" as "active" | "inactive",
  });
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !token) return;
      setProductLoading(true);
      try {
        const data = await withLoading(
          () => productApi.getProductById(productId, token),
          "Carregando produto"
        );
        setProduct(data);
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setProductLoading(false);
      }
    };
    void fetchProduct();
  }, [productId, token, withLoading]);

  const loadDeliverables = useCallback(async () => {
    if (!productId || !token || activeTab !== "Entregável") return;
    setDeliverablesLoading(true);
    setDeliverablesError(null);
    try {
      const data = await withLoading(
        () => productApi.getDeliverablesByProductId(productId, token),
        "Carregando entregáveis"
      );
      console.log("[productApi] Entregáveis recebidos:", data);
      setDeliverables(data);
    } catch (error) {
      console.error("Erro ao carregar entregáveis:", error);
      setDeliverablesError("Não foi possível carregar os entregáveis agora.");
    } finally {
      setDeliverablesLoading(false);
    }
  }, [activeTab, productId, token, withLoading]);

  useEffect(() => {
    void loadDeliverables();
  }, [loadDeliverables]);

  const loadOffers = useCallback(async () => {
    if (!productId || !token || activeTab !== "Ofertas") return;
    setOffersLoading(true);
    setOffersError(null);
    try {
      const data = await withLoading(
        () => productApi.getOffersByProductId(productId, token),
        "Carregando ofertas"
      );
      console.log("[productApi] Ofertas recebidas:", data);
      setOffers(data);
    } catch (error) {
      console.error("Erro ao carregar ofertas:", error);
      setOffersError("Não foi possível carregar as ofertas agora.");
    } finally {
      setOffersLoading(false);
    }
  }, [activeTab, productId, token, withLoading]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const loadCheckouts = useCallback(async () => {
    if (!productId || !token || activeTab !== "Checkouts") return;
    setCheckoutsLoading(true);
    setCheckoutsError(null);
    try {
      const data = await withLoading(
        () => productApi.getCheckoutsByProductId(productId, token),
        "Carregando checkouts"
      );
      console.log("[productApi] Checkouts recebidos:", data);
      setCheckouts(data);
    } catch (error) {
      console.error("Erro ao carregar checkouts:", error);
      setCheckoutsError("Não foi possível carregar os checkouts agora.");
    } finally {
      setCheckoutsLoading(false);
    }
  }, [activeTab, productId, token, withLoading]);

  useEffect(() => {
    void loadCheckouts();
  }, [loadCheckouts]);

  const loadPlans = useCallback(async () => {
    if (!productId || !token || activeTab !== "Pixels de rastreamento") return;
    setPlansLoading(true);
    setPlansError(null);
    try {
      const data = await withLoading(
        () => productApi.getPlansByProductId(productId, token),
        "Carregando pixels"
      );
      setPlans(data);
    } catch (error) {
      console.error("Erro ao carregar pixels:", error);
      setPlansError("Não foi possível carregar os pixels agora.");
    } finally {
      setPlansLoading(false);
    }
  }, [activeTab, productId, token, withLoading]);

  useEffect(() => {
    void loadPlans();
  }, [loadPlans]);

  const loadStrategies = useCallback(async () => {
    if (!productId || !token || activeTab !== "Upsell, downsell e mais") return;
    setStrategiesLoading(true);
    setStrategiesError(null);
    try {
      const data = await withLoading(
        () => productApi.getProductStrategy(productId, token),
        "Carregando upsells"
      );
      setStrategies(data);
    } catch (error) {
      console.error("Erro ao carregar upsells:", error);
      setStrategiesError("Não foi possível carregar as estratégias agora.");
    } finally {
      setStrategiesLoading(false);
    }
  }, [activeTab, productId, token, withLoading]);

  useEffect(() => {
    void loadStrategies();
  }, [loadStrategies]);

  const loadCoupons = useCallback(async () => {
    if (!productId || !token || activeTab !== "Cupons") return;
    setCouponsLoading(true);
    setCouponsError(null);
    try {
      const data = await withLoading(
        () => productApi.getProductCoupons(productId, token),
        "Carregando cupons"
      );
      setCoupons(data);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
      setCouponsError("Não foi possível carregar os cupons agora.");
    } finally {
      setCouponsLoading(false);
    }
  }, [activeTab, productId, token, withLoading]);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const loadSettings = useCallback(async () => {
    if (!productId || !token || activeTab !== "Configurações") return;
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const data = await withLoading(
        () => productApi.getProductSettings(productId, token),
        "Carregando configurações"
      );
      setSettings(data);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setSettingsError("Não foi possível carregar as configurações agora.");
    } finally {
      setSettingsLoading(false);
    }
  }, [activeTab, productId, token, withLoading]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const formatSize = (size?: number) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleCreateCoupon = useCallback(async () => {
    if (!productId || !token) {
      console.warn("[coupon] missing productId or token", { productId, tokenPresent: Boolean(token) });
      setCouponsError("Sessão expirada. Faça login novamente.");
      return;
    }

    const discountValue = Number(couponForm.discount_amount);
    if (Number.isNaN(discountValue)) {
      setCouponsError("Informe um valor de desconto válido.");
      return;
    }

    const minimumPurchase = couponForm.minimum_purchase_amount
      ? Number(couponForm.minimum_purchase_amount)
      : undefined;
    if (minimumPurchase !== undefined && Number.isNaN(minimumPurchase)) {
      setCouponsError("Informe um valor mínimo de compra válido.");
      return;
    }

    const limitUsage = couponForm.limit_usage ? Number(couponForm.limit_usage) : undefined;
    if (limitUsage !== undefined && Number.isNaN(limitUsage)) {
      setCouponsError("Informe um limite de uso válido.");
      return;
    }

    const payload: CreateProductCouponRequest = {
      coupon_code: couponForm.coupon_code.trim(),
      discount_amount: discountValue,
      status: couponForm.status,
      is_percentage: couponUnit === "percent",
      internal_name: couponForm.internal_name || undefined,
      expires_at: couponForm.expires_at || undefined,
      minimum_purchase_amount: minimumPurchase,
      limit_usage: limitUsage,
    };

    setCouponsError(null);
    setCouponSaving(true);
    try {
      console.log("[coupon] Enviando criação de cupom:", payload);
      const response = await withLoading(
        () => productApi.createProductCoupon(productId, payload, token),
        "Criando cupom"
      );
      console.log("[coupon] Resposta do servidor:", response);
      await loadCoupons();
      setShowCouponModal(false);
    } catch (error) {
      console.error("Erro ao criar cupom:", error);
      setCouponsError("Não foi possível criar o cupom.");
    } finally {
      setCouponSaving(false);
    }
  }, [productId, token, couponForm, couponUnit, withLoading, loadCoupons]);

  const handleCreateDeliverable = async () => {
    if (!productId || !token) return;
    const trimmedName = deliverableName.trim() || "Entregável";
    const trimmedContent = deliverableContent.trim();

    if (deliverableTab === "link" && !trimmedContent) {
      setDeliverableFormError("Preencha o link do entregável.");
      return;
    }

    if (deliverableTab === "arquivo" && !deliverableFile) {
      setDeliverableFormError("Selecione um arquivo para enviar.");
      return;
    }

    const payload =
      deliverableTab === "link"
        ? {
            name: trimmedName,
            type: "link",
            status: "active",
            content: trimmedContent,
          }
        : {
            name: trimmedName,
            type: "File",
            status: "active",
            size: deliverableFile?.size,
          };

    setSavingDeliverable(true);
    setDeliverableFormError(null);
    try {
      console.log("[productApi] Enviando criação de entregável:", payload);
      const response = await productApi.createDeliverable(productId, payload, token);
      console.log("[productApi] Resposta do servidor (entregável):", response);
      await loadDeliverables();
      setShowDeliverableModal(false);
      setDeliverableName("");
      setDeliverableContent("");
      setDeliverableFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro ao criar entregável:", error);
      setDeliverableFormError("Não foi possível salvar o entregável.");
    } finally {
      setSavingDeliverable(false);
    }
  };

  const handleCreateOffer = async () => {
    if (!productId || !token) return;
    const payload: ProductOffer = {
      name: offerName.trim() || "Oferta",
      type: offerType === "assinatura" ? "subscription" : "single",
      status: offerStatus === "inactive" ? "inactive" : "active",
      offer_price: offerPrice ? Number(offerPrice) : undefined,
      free: offerFree,
      back_redirect_url: offerBackRedirect || undefined,
      next_redirect_url: offerNextRedirect || undefined,
    };

    setSavingOffer(true);
    try {
      console.log("[productApi] Enviando criação de oferta:", payload);
      const response = await productApi.createOffer(productId, payload, token);
      console.log("[productApi] Resposta do servidor (oferta):", response);
      await loadOffers();
      setShowOfferModal(false);
      setOfferName("");
      setOfferPrice("");
      setOfferBackRedirect("");
      setOfferNextRedirect("");
      setOfferFree(false);
      setOfferStatus("active");
    } catch (error) {
      console.error("Erro ao criar oferta:", error);
      setOffersError("Não foi possível salvar a oferta.");
    } finally {
      setSavingOffer(false);
    }
  };

  useEffect(() => {
    setActiveTab((initialTab && tabSlugMap[initialTab]) || "Entregável");
  }, [initialTab]);

  const navigateToTab = (tab: TabLabel) => {
    setActiveTab(tab);
    const slug = tabToSlug[tab] ?? tab.toLowerCase();
    if (productId) {
      router.push(`/editar-produto/${encodeURIComponent(productId)}/${slug}`);
    }
  };

  const headerCard = useMemo(() => {
    if (productLoading || !product) {
      return (
        <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-[72px] w-[72px] rounded-[10px]" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="ml-auto h-4 w-28" />
            <Skeleton className="ml-auto h-3 w-20" />
          </div>
        </div>
      );
    }

    const thumb = product.image_url || "/images/produto.png";
    const name = product.name ?? "Produto";
    const rawStatus = (product as Product & { status?: string })?.status;
    const displayStatus = rawStatus && rawStatus.trim() ? rawStatus : "Ativo";
    return (
      <div className="flex flex-col gap-4 rounded-[12px] border border-foreground/10 bg-card/80 p-5 shadow-[0_14px_36px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="overflow-hidden rounded-[10px] bg-foreground/10">
            <Image
              src={thumb}
              alt={name}
              width={72}
              height={72}
              className="h-[72px] w-[72px] object-cover"
            />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">{name}</p>
            <span className="text-xs font-semibold text-emerald-400">{displayStatus}</span>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">R$ 0,00 faturados</p>
          <p>0 vendas realizadas</p>
        </div>
      </div>
    );
  }, [product, productLoading]);

  return (
    <DashboardLayout userName="Zuptos" userLocation="RJ" pageTitle="">
      <div className="w-full px-4 py-8">
        <div className="mx-auto flex w-full max-w-6xl gap-6">
          <nav className="w-52 shrink-0">
            <ul className="space-y-2 text-sm">
              {tabs.map(tab => {
                const isActive = activeTab === tab;
                return (
                  <li key={tab}>
                    <button
                      type="button"
                      onClick={() => navigateToTab(tab)}
                      className={`w-full px-2 py-2 text-left transition ${
                        isActive
                          ? "text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.25)]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex-1 space-y-6">
            {headerCard}

            {activeTab === "Entregável" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Entregável</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar arquivo"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowDeliverableModal(true)}
                    >
                      Adicionar arquivo
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/70 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Entregável</span>
                    <span>Tamanho</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {deliverablesLoading && (
                      <>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-4 w-16" />
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-3 w-3 rounded-full" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {!deliverablesLoading && deliverablesError && (
                      <div className="px-4 py-4 text-sm text-rose-300">{deliverablesError}</div>
                    )}
                    {!deliverablesLoading && !deliverablesError && deliverables.length === 0 && (
                      <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum entregável cadastrado.</div>
                    )}
                    {!deliverablesLoading && !deliverablesError && deliverables.map(deliverable => {
                      const linkLabel = deliverable.content?.replace(/^https?:\/\//, "") ?? deliverable.content ?? "-";
                      const isActive = deliverable.status?.toLowerCase() === "active";
                      return (
                        <div key={deliverable.id} className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground">
                          <div className="space-y-1">
                            <p className="text-sm font-medium capitalize">{deliverable.name || deliverable.type || "Entregável"}</p>
                            <p className="text-xs text-muted-foreground break-all">ID: {deliverable.id}</p>
                          </div>
                          <div>
                            {deliverable.content ? (
                              <div className="flex items-center gap-2">
                                <a
                                  href={deliverable.content}
                                  className="rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs text-foreground transition hover:border-foreground/30"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {linkLabel}
                                </a>
                                <button
                                  type="button"
                                  className="h-8 w-8 rounded-[6px] border border-foreground/15 bg-card text-sm text-foreground transition hover:border-foreground/30"
                                  aria-label="Baixar"
                                >
                                  📎
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{formatSize(deliverable.size)}</div>
                          <div className="flex items-center gap-2 text-sm">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/50"}`}
                              aria-hidden
                            />
                            <span className="font-medium text-foreground">{deliverable.status ?? "-"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Ofertas" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Ofertas</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowOfferModal(true)}
                    >
                      Adicionar oferta
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-6 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Checkout</span>
                    <span>Tipo</span>
                    <span>Valor</span>
                    <span>Acesso</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {offersLoading && (
                      <>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="grid grid-cols-5 items-center gap-4 px-4 py-4">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-28" />
                              <Skeleton className="h-3 w-20" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-8 w-24 rounded-[10px]" />
                          </div>
                        ))}
                      </>
                    )}
                    {!offersLoading && offersError && (
                      <div className="px-4 py-4 text-sm text-rose-300">{offersError}</div>
                    )}
                    {!offersLoading && !offersError && offers.length === 0 && (
                      <div className="px-4 py-6 text-sm text-muted-foreground">Nenhuma oferta cadastrada.</div>
                    )}
                    {!offersLoading && !offersError && offers.map(offer => {
                      const isActive = offer.status?.toLowerCase() === "active";
                      return (
                        <div key={offer.id ?? offer.name} className="grid grid-cols-6 items-center gap-4 px-4 py-4 text-sm text-foreground">
                          <span className="font-semibold uppercase break-words">{offer.name}</span>
                          <span className="font-semibold text-muted-foreground">-</span>
                          <span className="text-muted-foreground">{offer.type}</span>
                          <span className="font-semibold">
                            {offer.free ? "Grátis" : offer.offer_price != null ? `R$ ${offer.offer_price}` : "-"}
                          </span>
                          <div className="flex items-center">
                            <button
                              type="button"
                              className="rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs text-foreground transition hover:border-foreground/30"
                            >
                              {offer.next_redirect_url?.replace(/^https?:\/\//, "") || "-"}
                            </button>
                          </div>
                          <div className="flex items-center justify-start">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${
                                isActive
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-muted/40 text-muted-foreground"
                              }`}
                            >
                              {offer.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Checkouts" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Checkouts</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => productId && router.push(`/editar-produto/${encodeURIComponent(productId)}/checkout`)}
                    >
                      Adicionar Checkout
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Pagamento</span>
                    <span>Ofertas</span>
                    <span className="text-right">Ação</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {checkoutsLoading && (
                      <>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-20" />
                            <div className="flex justify-end">
                              <Skeleton className="h-8 w-24 rounded-[8px]" />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {!checkoutsLoading && checkoutsError && (
                      <div className="px-4 py-4 text-sm text-rose-300">{checkoutsError}</div>
                    )}
                    {!checkoutsLoading && !checkoutsError && checkouts.length === 0 && (
                      <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum checkout cadastrado.</div>
                    )}
                    {!checkoutsLoading && !checkoutsError && checkouts.map(checkout => (
                      <div
                        key={checkout.id ?? checkout.name}
                        className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold">{checkout.name}</span>
                        <span className="text-muted-foreground">{checkout.theme ?? "-"}</span>
                        <span className="text-muted-foreground">{checkout.template ?? "-"}</span>
                        <div className="flex justify-end">
                          <button
                            className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
                            onClick={() => productId && router.push(`/editar-produto/${encodeURIComponent(productId)}/checkout`)}
                            type="button"
                          >
                            EDITAR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Configurações" && (
              <>
                <h2 className="text-lg font-semibold text-foreground">Configurações</h2>

                <div className="space-y-6 rounded-[12px] border border-foreground/10 bg-card/80 p-6 shadow-[0_14px_36px_rgba(0,0,0,0.35)]">
                  <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                    <div className="flex items-center justify-center rounded-[12px] border border-foreground/10 bg-card/70 p-3">
                      <Image
                        src="/images/produto.png"
                        alt="Produto"
                        width={160}
                        height={160}
                        className="h-[160px] w-[160px] object-cover rounded-[10px]"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="space-y-1 text-sm text-muted-foreground">
                        <span className="text-foreground">Nome do produto</span>
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Nome do produto"
                        />
                      </label>
                      <label className="space-y-1 text-sm text-muted-foreground">
                        <span className="text-foreground">Descrição breve</span>
                        <textarea
                          className="min-h-[80px] w-full rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Descrição do produto"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">E-mail de suporte</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="ex: suporte@empresa.com"
                        value={settings?.support_email ?? ""}
                        onChange={event =>
                          setSettings(current => ({
                            ...(current ?? { id: "", product_id: productId ?? "" }),
                            support_email: event.target.value,
                          }))
                        }
                        disabled={settingsLoading || settingsSaving}
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Telefone de suporte</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="ex: +55 11 99999-9999"
                        value={settings?.phone_support ?? ""}
                        onChange={event =>
                          setSettings(current => ({
                            ...(current ?? { id: "", product_id: productId ?? "" }),
                            phone_support: event.target.value,
                          }))
                        }
                        disabled={settingsLoading || settingsSaving}
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Idioma</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="pt-BR"
                        value={settings?.language ?? ""}
                        onChange={event =>
                          setSettings(current => ({
                            ...(current ?? { id: "", product_id: productId ?? "" }),
                            language: event.target.value,
                          }))
                        }
                        disabled={settingsLoading || settingsSaving}
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Moeda base</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="BRL"
                        value={settings?.currency ?? ""}
                        onChange={event =>
                          setSettings(current => ({
                            ...(current ?? { id: "", product_id: productId ?? "" }),
                            currency: event.target.value,
                          }))
                        }
                        disabled={settingsLoading || settingsSaving}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-[10px] border border-foreground/15 bg-card px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Status do produto</p>
                      <p className="text-xs text-muted-foreground">Gerencie se o produto estará ou não ativo para vendas</p>
                    </div>
                    <button
                      className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                        settings?.status === "active" ? "bg-primary/70" : "bg-muted"
                      }`}
                      onClick={() =>
                        setSettings(current => ({
                          ...(current ?? { id: "", product_id: productId ?? "" }),
                          status: current?.status === "active" ? "inactive" : "active",
                        }))
                      }
                      disabled={settingsLoading || settingsSaving}
                      type="button"
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white transition ${
                          settings?.status === "active" ? "left-[calc(100%-18px)]" : "left-[6px]"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="rounded-[10px] border border-foreground/15 bg-card px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Recuperação ativa</p>
                        <p className="text-xs text-muted-foreground">
                          Com esse recurso reconquiste o cliente que está prestes a cancelar a compra ou recupere uma venda não finalizada.
                        </p>
                      </div>
                      <button
                        className="rounded-[8px] border border-foreground/20 bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-foreground/40"
                        onClick={() => setShowRecoveryModal(true)}
                        type="button"
                      >
                        Configurar
                      </button>
                    </div>
                  </div>

                </div>

                <div className="flex items-center justify-between">
                  <button className="rounded-[8px] border border-rose-900/60 bg-rose-900/30 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/50">
                    Excluir produto
                  </button>
                  <button
                    className="rounded-[8px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90 disabled:opacity-60"
                    type="button"
                    onClick={async () => {
                      if (!productId || !token || !settings) return;
                      setSettingsSaving(true);
                      setSettingsError(null);
                      try {
                        const payload: UpdateProductSettingsRequest = {
                          support_email: settings.support_email || undefined,
                          phone_support: settings.phone_support || undefined,
                          language: settings.language || undefined,
                          currency: settings.currency || undefined,
                          status: settings.status || undefined,
                        };
                        await withLoading(
                          () => productApi.updateProductSettings(productId, payload, token),
                          "Salvando configurações"
                        );
                      } catch (error) {
                        console.error("Erro ao salvar configurações:", error);
                        setSettingsError("Não foi possível salvar as configurações.");
                      } finally {
                        setSettingsSaving(false);
                      }
                    }}
                    disabled={settingsSaving || settingsLoading}
                  >
                    {settingsSaving ? "Salvando..." : "Salvar alterações"}
                  </button>
                </div>
              </>
            )}

            {activeTab === "Pixels de rastreamento" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Pixel de rastreamento</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => {
                        setSelectedPixelPlatform(null);
                        setShowPixelModal(true);
                      }}
                    >
                      Adicionar Pixel
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>ID</span>
                    <span>Plataforma</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {plansLoading && (
                      <>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex justify-end">
                              <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {!plansLoading && plansError && (
                      <div className="px-4 py-4 text-sm text-rose-300">{plansError}</div>
                    )}
                    {!plansLoading && !plansError && plans.length === 0 && (
                      <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum pixel cadastrado.</div>
                    )}
                    {!plansLoading && !plansError && plans.map(pixel => (
                      <div
                        key={pixel.id}
                        className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold uppercase">{pixel.name || pixel.platform || "PIXEL"}</span>
                        <span className="text-muted-foreground">{pixel.id}</span>
                        <span className="flex items-center gap-2 text-muted-foreground">{pixel.platform ?? "-"}</span>
                        <div className="flex justify-end">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                            {pixel.status ?? "Ativo"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Upsell, downsell e mais" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Upsell, downsell e mais</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowUpsellModal(true)}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-5 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Tipo</span>
                    <span>Oferta</span>
                    <span>Valor</span>
                    <span className="text-right">Script</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {strategiesLoading && (
                      <>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="grid grid-cols-5 items-center gap-4 px-4 py-4">
                            <div className="space-y-2">
                              <div className="h-4 w-28 rounded bg-muted/50" />
                              <div className="h-3 w-20 rounded bg-muted/40" />
                            </div>
                            <div className="h-4 w-16 rounded bg-muted/50" />
                            <div className="h-4 w-24 rounded bg-muted/50" />
                            <div className="h-4 w-16 rounded bg-muted/50" />
                            <div className="flex justify-end">
                              <div className="h-6 w-24 rounded-full bg-muted/60" />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {!strategiesLoading && strategiesError && (
                      <div className="px-4 py-4 text-sm text-rose-300">{strategiesError}</div>
                    )}
                    {!strategiesLoading && !strategiesError && strategies.length === 0 && (
                      <div className="px-4 py-6 text-sm text-muted-foreground">Nenhuma estratégia cadastrada.</div>
                    )}
                    {!strategiesLoading &&
                      !strategiesError &&
                      strategies.map(item => (
                        <div
                          key={item.id}
                          className="grid grid-cols-5 items-center gap-4 px-4 py-4 text-sm text-foreground"
                        >
                          <span className="font-semibold uppercase">{item.name || item.type || "Estrategia"}</span>
                          <span className="text-muted-foreground">{item.type ?? "-"}</span>
                          <span className="text-muted-foreground">{item.offer ?? "-"}</span>
                          <span className="font-semibold">
                            {item.value !== undefined && item.value !== null ? item.value : "-"}
                          </span>
                          <div className="flex justify-end">
                            <span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-[6px] text-[11px] font-semibold text-muted-foreground">
                              {item.script ?? "-"}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Cupons" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Cupom</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => {
                        setCouponForm({
                          coupon_code: "",
                          discount_amount: "",
                          is_percentage: false,
                          internal_name: "",
                          expires_at: "",
                          minimum_purchase_amount: "",
                          limit_usage: "",
                          status: "active",
                        });
                        setShowCouponModal(true);
                      }}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-4 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Desconto</span>
                    <span>Código</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {couponsLoading && (
                      <>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="grid grid-cols-4 items-center gap-4 px-4 py-4">
                            <div className="space-y-2">
                              <div className="h-4 w-28 rounded bg-muted/50" />
                              <div className="h-3 w-24 rounded bg-muted/40" />
                            </div>
                            <div className="h-4 w-16 rounded bg-muted/50" />
                            <div className="h-4 w-24 rounded bg-muted/50" />
                            <div className="flex justify-end">
                              <div className="h-6 w-20 rounded-full bg-muted/60" />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {!couponsLoading && couponsError && (
                      <div className="px-4 py-4 text-sm text-rose-300">{couponsError}</div>
                    )}
                    {!couponsLoading && !couponsError && coupons.length === 0 && (
                      <div className="px-4 py-6 text-sm text-muted-foreground">Nenhum cupom cadastrado.</div>
                    )}
                    {!couponsLoading &&
                      !couponsError &&
                      coupons.map(coupon => (
                        <div
                          key={coupon.id}
                          className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
                        >
                          <div className="space-y-1">
                            <span className="font-semibold uppercase">{coupon.name ?? "Cupom"}</span>
                            <span className="text-xs text-muted-foreground break-all">{coupon.id}</span>
                          </div>
                          <span className="font-semibold">
                            {coupon.discount !== undefined && coupon.discount !== null ? coupon.discount : "-"}
                          </span>
                          <span className="text-muted-foreground">{coupon.code ?? "-"}</span>
                          <div className="flex justify-end">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${
                                coupon.status?.toLowerCase() === "active"
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-muted/60 text-muted-foreground"
                              }`}
                            >
                              {coupon.status ?? "-"}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "Coprodução" && (
              <>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Coprodução</h2>
                  <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:gap-3">
                    <div className="flex w-full max-w-md items-center gap-2 rounded-[10px] border border-foreground/10 bg-card px-3 py-2 text-sm text-muted-foreground">
                      <Search className="h-4 w-4" aria-hidden />
                      <input
                        type="text"
                        placeholder="Buscar por código"
                        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                      onClick={() => setShowCoproductionModal(true)}
                    >
                      Adicionar
                    </button>
                  </div>
                </div>

                <div className="rounded-[12px] border border-foreground/10 bg-card/80 shadow-[0_14px_36px_rgba(0,0,0,0.3)]">
                  <div className="grid grid-cols-5 gap-4 border-b border-foreground/10 px-4 py-3 text-sm font-semibold text-foreground">
                    <span>Nome</span>
                    <span>Início</span>
                    <span>Comissão</span>
                    <span>Duração</span>
                    <span className="text-right">Status</span>
                  </div>
                  <div className="divide-y divide-foreground/10">
                    {coproductions.map(item => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setShowCoproductionDetailModal(true)}
                        className="grid grid-cols-5 items-center gap-4 px-4 py-4 text-left text-sm text-foreground transition hover:bg-card/60"
                      >
                        <span className="font-semibold uppercase">{item.name}</span>
                        <div className="space-y-1 text-muted-foreground">
                          <p className="font-semibold text-foreground">{item.start}</p>
                          <p className="text-[11px] uppercase tracking-wide">00h00</p>
                        </div>
                        <div className="space-y-1 text-muted-foreground">
                          <p className="font-semibold text-foreground">{item.commission}</p>
                          <p className="text-[11px]">Vendas produtor</p>
                        </div>
                        <span className="font-semibold">{item.duration}</span>
                        <div className="flex justify-end">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                            {item.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowOfferModal(false)}
            aria-label="Fechar modal"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Criar oferta</h2>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-6 pb-10">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Selecione o tipo de oferta</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOfferType("preco_unico")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      offerType === "preco_unico"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    Preço único
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferType("assinatura")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      offerType === "assinatura"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    Assinatura
                  </button>
                </div>
              </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Status da oferta</span>
                    <button
                      type="button"
                      className={`relative inline-flex h-5 w-10 items-center rounded-full ${offerStatus === "active" ? "bg-primary/70" : "bg-muted"}`}
                      onClick={() => setOfferStatus(prev => (prev === "active" ? "inactive" : "active"))}
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white transition ${offerStatus === "active" ? "left-[calc(100%-18px)]" : "left-[6px]"}`}
                      />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="space-y-2 text-sm text-muted-foreground">
                      <span>Nome da oferta</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Digite um nome"
                        value={offerName}
                        onChange={event => setOfferName(event.target.value)}
                      />
                    </label>
                  </div>
                </div>

              {offerType === "preco_unico" && (
                <div className="space-y-2">
                  <label className="space-y-2 text-sm text-muted-foreground">
                    <span>Checkout</span>
                    <input
                      className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Selecione um checkout"
                    />
                  </label>
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Oferta gratuita</span>
                    <button
                      type="button"
                      className={`relative inline-flex h-5 w-10 items-center rounded-full ${offerFree ? "bg-primary/70" : "bg-muted"}`}
                      onClick={() => setOfferFree(prev => !prev)}
                    >
                      <span
                        className={`absolute h-4 w-4 rounded-full bg-white transition ${offerFree ? "left-[calc(100%-18px)]" : "left-[6px]"}`}
                      />
                    </button>
                  </div>
                  <input
                    className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="R$ 0,00"
                    value={offerPrice}
                    onChange={event => setOfferPrice(event.target.value)}
                  />
                </div>
              )}

              {offerType === "assinatura" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Planos de assinatura</p>
                    <p className="text-xs text-muted-foreground">
                      Você pode criar uma oferta com um ou mais planos. Essas opções estarão disponíveis para o comprador no Checkout.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Defina a frequência da assinatura que deseja adicionar</p>
                    <div className="flex items-center gap-2">
                      <input
                        className="h-11 flex-1 rounded-[10px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Anual"
                      />
                      <button className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-foreground/20 bg-card text-foreground">
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                    <p className="text-sm font-semibold text-foreground">Plano anual</p>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                      Definir como padrão
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Título"
                      />
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Tag em destaque"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Preço normal"
                        />
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Preço promocional"
                        />
                      </div>
                      <div className="rounded-[8px] border border-foreground/15 bg-card px-3 py-3 text-xs text-muted-foreground">
                        <p className="text-sm font-semibold text-foreground">Pré-visualização do seu comprador:</p>
                        <div className="mt-2 rounded-[6px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-foreground">
                          <p className="font-semibold">Plano Anual</p>
                          <p>Anual - R$ 0,00</p>
                        </div>
                      </div>
                      <p className="rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-center text-[11px] text-muted-foreground">
                        Por conta da frequência, o limite de parcelamento é de 12x.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>Preço diferente na primeira cobrança</span>
                        <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                          <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                        </button>
                      </div>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="R$ 0,00"
                      />

                      <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                        <span>Número fixo de cobranças</span>
                        <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                          <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          className="h-10 w-20 rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="00"
                        />
                        <span className="text-sm text-muted-foreground">cobranças</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button className="w-1/2 min-w-[140px] rounded-[8px] bg-rose-900/40 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/60">
                        Excluir plano
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-foreground">Order Bumps</p>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                    <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Complete as informações para adicionar produtos complementares ao seu plano de assinatura durante o processo de pagamento.
                </p>

                <div className="space-y-3 rounded-[10px] border border-foreground/15 bg-card/70 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Produto"
                    />
                    <input
                      className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Oferta"
                    />
                    <input
                      className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Título"
                    />
                    <input
                      className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Tag em destaque"
                    />
                  </div>
                  <label className="space-y-2 text-xs text-muted-foreground">
                    <span>Descrição do order bump (opcional)</span>
                    <textarea
                      className="min-h-[70px] rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="Digite um nome"
                    />
                  </label>
                  <button
                    type="button"
                    className="w-full rounded-[8px] bg-muted px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted/80"
                  >
                    Adicionar Order Bump
                  </button>
                </div>

                      <div className="space-y-3 rounded-[10px] border border-dashed border-primary/70 p-4">
                      {[1, 2].map(idx => (
                        <div key={idx} className="space-y-3 rounded-[10px] border border-foreground/15 bg-card p-4">
                          <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                            <span className="text-base">0{idx}</span>
                            <div className="flex items-center gap-2">
                              <button className="rounded-[6px] border border-foreground/20 bg-card px-2.5 py-1 text-xs font-semibold text-foreground transition hover:border-foreground/40">
                                Editar
                              </button>
                              <button className="rounded-[6px] border border-foreground/20 bg-card px-2.5 py-1 text-xs font-semibold text-rose-300 transition hover:border-rose-300/60">
                                Excluir
                              </button>
                            </div>
                          </div>
                          <div className="space-y-3 rounded-[10px] border border-foreground/10 bg-card/70 p-3">
                            <div className="flex items-start gap-4">
                              <div className="overflow-hidden rounded-[10px] bg-foreground/10">
                                <Image
                                  src="/images/produto.png"
                                  alt="Order bump"
                                  width={120}
                                  height={120}
                                  className="h-[120px] w-[120px] object-cover"
                                />
                              </div>
                              <div className="space-y-2 pt-2">
                                <p className="text-lg font-semibold text-foreground">Order Bump 0{idx}</p>
                                <p className="text-lg font-semibold text-foreground">R$ 97,00</p>
                              </div>
                            </div>
                            <div className="space-y-2 pt-2">
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-foreground">Título</p>
                                <div className="inline-flex rounded-full bg-emerald-700/25 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                                  NOVIDADE
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground leading-snug">
                                Lorem Ipsum é simplesmente uma simulação de texto da indústria tipográfica e de impressos, e vem sendo utilizado
                                desde o século XVI,
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
              </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Back Redirect</p>
                      <p className="text-xs text-muted-foreground">
                        Redirecione o comprador para URL cadastrada automaticamente ao sair do checkout.
                      </p>
                    </div>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                  <input
                    className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Insira o link"
                    value={offerBackRedirect}
                    onChange={event => setOfferBackRedirect(event.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Ir para outra página após aprovado</p>
                    <p className="text-xs text-muted-foreground">
                      Você pode redirecionar o comprador para uma página de upsell ou de obrigado personalizada.
                    </p>
                  </div>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                    <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                  </button>
                  </div>
                  <input
                    className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Insira o link"
                    value={offerNextRedirect}
                    onChange={event => setOfferNextRedirect(event.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    className="rounded-[10px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                    onClick={handleCreateOffer}
                    disabled={savingOffer}
                  >
                    {savingOffer ? "Salvando..." : "Adicionar oferta"}
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowRecoveryModal(false)}
            aria-label="Fechar modal de recuperação"
          />
          <div className="relative h-full w-full max-w-[500px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Configurar Recuperação Ativa</h2>
                <p className="text-sm text-muted-foreground">
                  Com esse recurso reconquiste o cliente que está prestes a cancelar a compra ou recupere uma venda não finalizada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecoveryModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-6 pb-10">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Preferências</p>

                <div className="space-y-2 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Ofertas de preço único</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione um produto para ser ofertado de forma gratuita para seu cliente no momento do cancelamento de um produto de preço
                    único.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="h-11 rounded-[8px] border border-foreground/15 bg-card px-3 text-left text-sm text-muted-foreground">
                      Produto
                    </button>
                    <button className="h-11 rounded-[8px] border border-foreground/15 bg-card px-3 text-left text-sm text-muted-foreground">
                      Oferta
                    </button>
                  </div>
                </div>

                <div className="space-y-2 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                    <span>Ofertas recorrentes</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selecione uma porcentagem que será aplicada como desconto no momento do cancelamento dos seus planos recorrentes.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="20"
                    />
                    <span className="rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground">%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 rounded-[8px] border border-foreground/20 bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowRecoveryModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-[8px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                >
                  Prosseguir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPixelModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPixelModal(false)}
            aria-label="Fechar modal pixel"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Cadastrar pixel</h2>
              <button
                type="button"
                onClick={() => setShowPixelModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-sm text-foreground">Selecione a plataforma que deseja cadastrar.</p>

              <div className="space-y-3">
                {[
                  { name: "Google Ads", icon: "/images/editar-produtos/pixel/googleAds.png" },
                  { name: "Facebook", icon: "/images/editar-produtos/pixel/facebook.png" },
                  { name: "TikTok", icon: "/images/editar-produtos/pixel/tiktok.png" },
                ].map(platform => {
                  const isActive = selectedPixelPlatform === platform.name;
                  return (
                    <label
                      key={platform.name}
                      className={`flex items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-sm text-muted-foreground transition ${
                        isActive
                          ? "border-primary/60 bg-primary/5"
                          : "border-foreground/15 bg-card/80 hover:border-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-foreground/10">
                          <Image src={platform.icon} alt={platform.name} width={32} height={32} className="object-contain" />
                        </div>
                        <span className="text-base text-foreground">{platform.name}</span>
                      </div>
                      <input
                        type="radio"
                        name="pixel-platform"
                        className="peer sr-only"
                        checked={isActive}
                        onChange={() => setSelectedPixelPlatform(platform.name)}
                      />
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          isActive ? "border-primary bg-primary" : "border-foreground/25"
                        }`}
                      >
                        {isActive && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowPixelModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => {
                    if (!selectedPixelPlatform) return;
                    setShowPixelModal(false);
                    setShowPixelFormModal(true);
                  }}
                  disabled={!selectedPixelPlatform}
                >
                  Prosseguir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPixelFormModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPixelFormModal(false)}
            aria-label="Fechar modal formulário pixel"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Cadastrar Pixel</h2>
                <p className="text-sm text-muted-foreground">Preencha as informações.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPixelFormModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Tipo</p>
                <select
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  value={planForm.type}
                  onChange={event => setPlanForm(prev => ({ ...prev, type: event.target.value }))}
                >
                  <option value="monthly">Mensal</option>
                  <option value="annual">Anual</option>
                  <option value="lifetime">Vitalício</option>
                </select>
              </div>

              <label className="space-y-2 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                  value={planForm.name}
                  onChange={event => setPlanForm(prev => ({ ...prev, name: event.target.value }))}
                />
              </label>

              <label className="space-y-2 text-sm text-muted-foreground">
                <span className="text-foreground">Preço do plano</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="ex: 19.99"
                  inputMode="decimal"
                  value={planForm.plan_price}
                  onChange={event => setPlanForm(prev => ({ ...prev, plan_price: event.target.value }))}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Preço normal</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="ex: 29.99"
                    inputMode="decimal"
                    value={planForm.normal_price}
                    onChange={event => setPlanForm(prev => ({ ...prev, normal_price: event.target.value }))}
                  />
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Preço com desconto</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="ex: 9.99"
                    inputMode="decimal"
                    value={planForm.discount_price}
                    onChange={event => setPlanForm(prev => ({ ...prev, discount_price: event.target.value }))}
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Ciclos</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="ex: 12"
                    inputMode="numeric"
                    value={planForm.cycles}
                    onChange={event => setPlanForm(prev => ({ ...prev, cycles: event.target.value }))}
                  />
                </label>
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Preço 1º ciclo</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="ex: 9.99"
                    inputMode="decimal"
                    value={planForm.price_first_cycle}
                    onChange={event => setPlanForm(prev => ({ ...prev, price_first_cycle: event.target.value }))}
                  />
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2 text-sm font-semibold text-foreground">
                <span>Status</span>
                <button
                  className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                    planForm.status === "active" ? "bg-primary/70" : "bg-muted"
                  }`}
                  type="button"
                  onClick={() =>
                    setPlanForm(prev => ({
                      ...prev,
                      status: prev.status === "active" ? "inactive" : "active",
                    }))
                  }
                >
                  <span
                    className={`absolute h-4 w-4 rounded-full bg-white transition ${
                      planForm.status === "active" ? "left-[calc(100%-18px)]" : "left-[6px]"
                    }`}
                  />
                </button>
                <span className="text-muted-foreground capitalize">{planForm.status}</span>
              </div>

              <div className="flex items-center gap-3 pt-2 text-sm font-semibold text-foreground">
                <span>Padrão</span>
                <button
                  className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                    planForm.default ? "bg-primary/70" : "bg-muted"
                  }`}
                  type="button"
                  onClick={() =>
                    setPlanForm(prev => ({
                      ...prev,
                      default: !prev.default,
                    }))
                  }
                >
                  <span
                    className={`absolute h-4 w-4 rounded-full bg-white transition ${
                      planForm.default ? "left-[calc(100%-18px)]" : "left-[6px]"
                    }`}
                  />
                </button>
              </div>

              {/* Configuração de eventos removida no momento */}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowPixelFormModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                    className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                    onClick={async () => {
                      if (!productId || !token) return;
                      if (!planForm.name.trim() || !planForm.plan_price) {
                        return;
                      }

                      const payload: CreateProductPlanRequest = {
                        name: planForm.name.trim(),
                        type: planForm.type,
                        status: planForm.status,
                        plan_price: Number(planForm.plan_price),
                        normal_price: planForm.normal_price ? Number(planForm.normal_price) : undefined,
                        discount_price: planForm.discount_price ? Number(planForm.discount_price) : undefined,
                        cycles: planForm.cycles ? Number(planForm.cycles) : undefined,
                        price_first_cycle: planForm.price_first_cycle ? Number(planForm.price_first_cycle) : undefined,
                        default: planForm.default,
                      };

                      setPlanSaving(true);
                      try {
                        await withLoading(
                          () => productApi.createPlan(productId, payload, token),
                          "Criando pixel"
                        );
                        await loadPlans();
                        setPlanForm({
                          name: "",
                          type: "monthly",
                          status: "active",
                          plan_price: "",
                          normal_price: "",
                          discount_price: "",
                          cycles: "",
                          price_first_cycle: "",
                          default: false,
                        });
                        setShowPixelFormModal(false);
                      } catch (error) {
                        console.error("Erro ao criar pixel:", error);
                      } finally {
                        setPlanSaving(false);
                      }
                    }}
                    disabled={planSaving || !planForm.name.trim() || !planForm.plan_price}
                  >
                    {planSaving ? "Salvando..." : "Adicionar"}
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}

      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowUpsellModal(false)}
            aria-label="Fechar modal estratégia"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Criar estratégia</h2>
                <p className="text-sm text-muted-foreground">Crie upsell, cross sell ou downsell para aumentar seu ticket médio.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowUpsellModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Nome</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Tipo de estratégia</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Upsell"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
              </div>

              <label className="space-y-1 text-sm text-muted-foreground">
                <span className="text-foreground">Selecione o produto</span>
                <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                  <input
                    className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder="Selecione um produto"
                  />
                  <span className="text-lg text-muted-foreground">▾</span>
                </div>
              </label>

              <div className="space-y-4 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Caso o cliente aceite a oferta</p>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Ação</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Nova oferta"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">URL</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
              </div>

              <div className="space-y-4 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Se recusar</p>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">Ação</span>
                  <div className="flex items-center justify-between rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground">
                    <input
                      className="h-11 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      placeholder="Nova oferta"
                    />
                    <span className="text-lg text-muted-foreground">▾</span>
                  </div>
                </label>
                <label className="space-y-1 text-sm text-muted-foreground">
                  <span className="text-foreground">URL</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowUpsellModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowUpsellModal(false)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCouponModal(false)}
            aria-label="Fechar modal cupom"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Novo Desconto</h2>
                <p className="text-sm text-muted-foreground">
                  Configure um cupom de desconto e aumente as conversões da sua loja, capte novos compradores e incentive a conclusão da compra.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                  value={couponForm.internal_name}
                  onChange={event => setCouponForm(prev => ({ ...prev, internal_name: event.target.value }))}
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Código de Cupom</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Selecione um produto"
                  value={couponForm.coupon_code}
                  onChange={event => setCouponForm(prev => ({ ...prev, coupon_code: event.target.value }))}
                />
              </label>

              <div className="space-y-3 rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                <p className="text-sm font-semibold text-foreground">Regras para aplicação de cupom</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    className={`h-11 rounded-[8px] border px-3 text-sm font-semibold ${
                      couponUnit === "valor"
                        ? "border-foreground/25 bg-foreground/10 text-foreground"
                        : "border-foreground/20 bg-card text-foreground"
                    }`}
                    onClick={() => setCouponUnit("valor")}
                  >
                    Valor em R$
                  </button>
                  <button
                    className={`h-11 rounded-[8px] border px-3 text-sm font-semibold ${
                      couponUnit === "percent"
                        ? "border-foreground/25 bg-foreground/10 text-foreground"
                        : "border-foreground/20 bg-card text-foreground"
                    }`}
                    onClick={() => setCouponUnit("percent")}
                  >
                    Porcentagem
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder={couponUnit === "percent" ? "% desconto" : "R$ desconto"}
                    value={couponForm.discount_amount}
                    onChange={event => setCouponForm(prev => ({ ...prev, discount_amount: event.target.value }))}
                  />
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Compra mínima"
                    value={couponForm.minimum_purchase_amount}
                    onChange={event => setCouponForm(prev => ({ ...prev, minimum_purchase_amount: event.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    value={couponForm.expires_at ? couponForm.expires_at.slice(0, 10) : ""}
                    onChange={event =>
                      setCouponForm(prev => ({
                        ...prev,
                        expires_at: event.target.value ? `${event.target.value}T00:00:00Z` : "",
                      }))
                    }
                  />
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Limite de uso"
                    value={couponForm.limit_usage}
                    onChange={event => setCouponForm(prev => ({ ...prev, limit_usage: event.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>Status</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground capitalize">{couponForm.status}</span>
                  <button
                    className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                      couponForm.status === "active" ? "bg-primary/70" : "bg-muted"
                    }`}
                    type="button"
                    onClick={() =>
                      setCouponForm(prev => ({
                        ...prev,
                        status: prev.status === "active" ? "inactive" : "active",
                      }))
                    }
                  >
                    <span
                      className={`absolute h-4 w-4 rounded-full bg-white transition ${
                        couponForm.status === "active" ? "left-[calc(100%-18px)]" : "left-[6px]"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowCouponModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => void handleCreateCoupon()}
                  disabled={
                    couponSaving ||
                    !couponForm.coupon_code.trim() ||
                    !couponForm.discount_amount ||
                    Number.isNaN(Number(couponForm.discount_amount))
                  }
                >
                  {couponSaving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCoproductionModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCoproductionModal(false)}
            aria-label="Fechar modal coprodução"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Convite de coprodução</h2>
              <button
                type="button"
                onClick={() => setShowCoproductionModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Nome"
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">E-mail</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="E-mail"
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Porcentagem de comissão</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="10%"
                />
              </label>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Duração do contrato</p>
                <div className="flex flex-col gap-2 text-sm text-foreground">
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                    Vitalício
                  </label>
                  <label className="flex items-center gap-2 text-muted-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                    Período determinado
                    <input
                      className="h-10 w-16 rounded-[8px] border border-foreground/15 bg-card px-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      placeholder="0"
                    />
                    <span>mês(es)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Preferências</p>
                {[
                  "Compartilhar os dados do comprador com o coprodutor",
                  "Estender comissões: Order Bumps, Upsells e downsell",
                  "Dividir responsabilidades de emissão de notas fiscais",
                ].map(label => (
                  <div key={label} className="flex items-center justify-between text-sm text-foreground">
                    <span className="text-[13px] text-muted-foreground">{label}</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowCoproductionModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowCoproductionModal(false)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCoproductionDetailModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCoproductionDetailModal(false)}
            aria-label="Fechar detalhes coprodução"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Coprodutor 1</h2>
              <button
                type="button"
                onClick={() => setShowCoproductionDetailModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-4 pb-10">
              <div className="space-y-2 text-sm text-muted-foreground">
                {[
                  { label: "Nome do convidado", value: "-" },
                  { label: "E-mail", value: "-" },
                  { label: "Porcentagem de comissão", value: "0%" },
                  { label: "Início", value: "dd/mm/aaaa" },
                  { label: "Duração do contrato", value: "vitalício" },
                ].map(field => (
                  <div key={field.label} className="flex items-center justify-between">
                    <span className="text-foreground">{field.label}</span>
                    <span className="text-muted-foreground">{field.value}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Preferências</p>
                {[
                  "Compartilhar os dados do comprador com o coprodutor",
                  "Estender comissões: Order Bumps, Upsells e downsell",
                  "Dividir responsabilidades de emissão de notas fiscais",
                ].map(label => (
                  <div key={label} className="flex items-center justify-between text-sm text-foreground">
                    <span className="text-[13px] text-muted-foreground">{label}</span>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Status:</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                    Aprovado
                  </span>
                  <button className="rounded-[8px] border border-rose-900/40 bg-rose-900/20 px-3 py-2 text-xs font-semibold text-rose-200">
                    Solicitar cancelamento
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end pt-4">
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowCoproductionDetailModal(false)}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeliverableModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeliverableModal(false)}
            aria-label="Fechar modal entregável"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">
                {deliverableTab === "arquivo" ? "Adicionar entregável" : "Link de acesso"}
              </h2>
              <button
                type="button"
                onClick={() => setShowDeliverableModal(false)}
                className="text-lg text-muted-foreground transition hover:text-foreground"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            <div className="mt-5 space-y-5 pb-10">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliverableTab("arquivo")}
                  className={`h-11 rounded-[10px] border px-3 text-sm font-semibold ${
                    deliverableTab === "arquivo"
                      ? "border-foreground/20 bg-[#d9d9d9] text-black"
                      : "border-foreground/10 bg-card text-muted-foreground"
                  }`}
                >
                  Arquivo
                </button>
                <button
                  type="button"
                  onClick={() => setDeliverableTab("link")}
                  className={`h-11 rounded-[10px] border px-3 text-sm font-semibold ${
                    deliverableTab === "link"
                      ? "border-foreground/20 bg-[#d9d9d9] text-black"
                      : "border-foreground/10 bg-card text-muted-foreground"
                  }`}
                >
                  Link
                </button>
              </div>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Nome de exibição</span>
                <input
                  className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                  value={deliverableName}
                  onChange={event => setDeliverableName(event.target.value)}
                />
              </label>

              {deliverableTab === "arquivo" && (
                <>
                  <div className="rounded-[12px] border border-foreground/15 bg-card/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-foreground/15 bg-foreground/10" />
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p className="text-sm text-foreground">Selecione um arquivo ou arraste e solte aqui</p>
                        <p>JPG, PNG, PDF ou ZIP, não superior a 50 MB</p>
                      </div>
                      <button
                        type="button"
                        className="ml-auto rounded-[8px] border border-foreground/20 px-3 py-2 text-xs font-semibold text-foreground"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Selecionar
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={event => {
                          const file = event.target.files?.[0];
                          setDeliverableFile(file ?? null);
                          if (file && !deliverableName.trim()) {
                            setDeliverableName(file.name);
                          }
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {deliverableTab === "link" && (
                <label className="space-y-3 text-sm text-muted-foreground">
                  <span className="text-foreground">Link de acesso</span>
                  <input
                    className="h-11 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Inserir link"
                    value={deliverableContent}
                    onChange={event => setDeliverableContent(event.target.value)}
                  />
                </label>
              )}

              {deliverableFormError && (
                <p className="text-sm text-rose-300">{deliverableFormError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="rounded-[8px] border border-foreground/20 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                  onClick={() => setShowDeliverableModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={handleCreateDeliverable}
                  disabled={savingDeliverable}
                >
                  {savingDeliverable ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
