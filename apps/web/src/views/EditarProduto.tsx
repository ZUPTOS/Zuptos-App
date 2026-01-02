'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { productApi } from "@/lib/api";
import type { Product, Checkout, ProductOffer, OrderBump, SubscriptionPlanPayload } from "@/lib/api";
import { ProductOfferType } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingOverlay } from "@/contexts/LoadingOverlayContext";
import { Skeleton } from "@/components/ui/skeleton";
import ToggleActive from "@/components/ToggleActive";
import { CoproducaoTab } from "./editar-produto/CoproducaoTab";
import { CuponsTab } from "./editar-produto/CuponsTab";
import { UpsellTab } from "./editar-produto/UpsellTab";
import { PixelsTab } from "./editar-produto/PixelsTab";
import { ConfiguracoesTab } from "./editar-produto/ConfiguracoesTab";
import { CheckoutsTab } from "./editar-produto/CheckoutsTab";
import { OfertasTab } from "./editar-produto/OfertasTab";
import { EntregavelTab } from "./editar-produto/EntregavelTab";

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
  const [pixelsRefreshKey, setPixelsRefreshKey] = useState(0);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [deliverableTab, setDeliverableTab] = useState<"arquivo" | "link">("arquivo");
  const [deliverablesRefreshKey, setDeliverablesRefreshKey] = useState(0);
  const [deliverableName, setDeliverableName] = useState("");
  const [deliverableContent, setDeliverableContent] = useState("");
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableFormError, setDeliverableFormError] = useState<string | null>(null);
  const [savingDeliverable, setSavingDeliverable] = useState(false);
  const [offersRefreshKey, setOffersRefreshKey] = useState(0);
  const [offerName, setOfferName] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerBackRedirect, setOfferBackRedirect] = useState("");
  const [offerNextRedirect, setOfferNextRedirect] = useState("");
  const [offerStatus, setOfferStatus] = useState<"active" | "inactive">("active");
  const [offerFree, setOfferFree] = useState(false);
  const [backRedirectEnabled, setBackRedirectEnabled] = useState(true);
  const [nextRedirectEnabled, setNextRedirectEnabled] = useState(true);
  const [firstChargePriceEnabled, setFirstChargePriceEnabled] = useState(false);
  const [fixedChargesEnabled, setFixedChargesEnabled] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState<"mensal" | "trimestral" | "anual">("anual");
  const [subscriptionTitle, setSubscriptionTitle] = useState("");
  const [subscriptionTag, setSubscriptionTag] = useState("");
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [subscriptionPromoPrice, setSubscriptionPromoPrice] = useState("");
  const [subscriptionFirstChargePrice, setSubscriptionFirstChargePrice] = useState("");
  const [subscriptionChargesCount, setSubscriptionChargesCount] = useState("");
  const [subscriptionDefault, setSubscriptionDefault] = useState(false);
  const [selectedCheckoutId, setSelectedCheckoutId] = useState("");
  const [checkoutOptions, setCheckoutOptions] = useState<Checkout[]>([]);
  const [checkoutOptionsLoading, setCheckoutOptionsLoading] = useState(false);
  const [orderBumpEnabled, setOrderBumpEnabled] = useState(false);
  const [orderBumpOffers, setOrderBumpOffers] = useState<ProductOffer[]>([]);
  const [orderBumpOffersLoading, setOrderBumpOffersLoading] = useState(false);
  const [orderBumps, setOrderBumps] = useState<OrderBump[]>([]);
  const [orderBumpForm, setOrderBumpForm] = useState({
    product: "",
    offer: "",
    title: "",
    tag: "",
    price: "",
    description: "",
  });
  const [editingOrderBumpIndex, setEditingOrderBumpIndex] = useState<number | null>(null);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerType, setOfferType] = useState<"preco_unico" | "assinatura">("preco_unico");
  const [planSaving, setPlanSaving] = useState(false);
  const [planForm, setPlanForm] = useState<{
    name: string;
    type: SubscriptionPlanPayload["type"];
    status: SubscriptionPlanPayload["status"];
    plan_price: string;
    normal_price: string;
    discount_price: string;
    cycles: string;
    price_first_cycle: string;
    default: boolean;
  }>({
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

  const formatBRLInput = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    if (!numeric) return "";
    const amount = Number(numeric) / 100;
    return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const parseBRLToNumber = (value?: string) => {
    if (!value) return undefined;
    const numeric = value.replace(/\D/g, "");
    if (!numeric) return undefined;
    return Number(numeric) / 100;
  };
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
            type: "file",
            status: "active",
            size: deliverableFile?.size,
            content: trimmedContent || undefined,
          };

    setSavingDeliverable(true);
    setDeliverableFormError(null);
    try {
      console.log("[productApi] Enviando criação de entregável:", payload);
      const response = await productApi.createDeliverable(productId, payload, token);
      console.log("[productApi] Resposta do servidor (entregável):", response);
      setDeliverablesRefreshKey(prev => prev + 1);
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
    const selectedCheckout = checkoutOptions.find(checkout => checkout.id === selectedCheckoutId);
    const mappedType =
      offerType === "assinatura" ? ProductOfferType.SUBSCRIPTION : ProductOfferType.SINGLE_PURCHASE;

    if (offerType === "assinatura") {
      if (!subscriptionTitle.trim() || !subscriptionPrice.trim()) {
        console.error("Preencha os campos do plano de assinatura antes de salvar a oferta.");
        return;
      }
    }

    const planFromSubscription: SubscriptionPlanPayload | undefined =
      offerType === "assinatura"
        ? {
            type:
              subscriptionFrequency === "anual"
                ? "yearly"
              : subscriptionFrequency === "trimestral"
                ? "quarterly"
                : "monthly",
            status: "active",
            plan_price: parseBRLToNumber(subscriptionPrice) ?? 0,
            name: subscriptionTitle.trim(),
            normal_price: parseBRLToNumber(subscriptionPrice),
            discount_price: parseBRLToNumber(subscriptionPromoPrice),
            default: subscriptionDefault,
            cycles: fixedChargesEnabled && subscriptionChargesCount ? Number(subscriptionChargesCount) : undefined,
            price_first_cycle:
              firstChargePriceEnabled && subscriptionFirstChargePrice
                ? parseBRLToNumber(subscriptionFirstChargePrice)
                : undefined,
          }
        : undefined;

    const payload: ProductOffer = {
      name: offerName.trim() || "Oferta",
      type: mappedType,
      status: offerStatus === "inactive" ? "inactive" : "active",
      offer_price: offerFree ? 0 : parseBRLToNumber(offerPrice),
      free: offerFree,
      back_redirect_url: offerBackRedirect || undefined,
      next_redirect_url: offerNextRedirect || undefined,
      checkout_id: selectedCheckoutId || undefined,
      checkout: selectedCheckout ?? undefined,
      subscription_plan: planFromSubscription,
    };

    setSavingOffer(true);
    try {
      if (offerType === "assinatura" && planFromSubscription) {
        console.log("[productApi] Payload de plano (subscription_plan):", planFromSubscription);
      }
      console.log("[productApi] Enviando criação de oferta:", payload);
      const response = await productApi.createOffer(productId, payload, token);
      if (offerType === "assinatura" && planFromSubscription && response?.id) {
        console.log("[productApi] Enviando plano (subscription_plan) para oferta:", response.id);
        const planResponse = await productApi.createOfferPlan(productId, response.id, planFromSubscription, token);
        console.log("[productApi] Resposta do servidor (plan):", planResponse);
      }
      console.log("[productApi] Resposta do servidor (oferta):", response);
      setOffersRefreshKey(prev => prev + 1);
      setShowOfferModal(false);
      setOfferName("");
      setOfferPrice("");
      setOfferBackRedirect("");
      setOfferNextRedirect("");
      setOfferFree(false);
      setOfferStatus("active");
      setSelectedCheckoutId("");
    } catch (error) {
      console.error("Erro ao criar oferta:", error);
    } finally {
      setSavingOffer(false);
    }
  };

  useEffect(() => {
    setActiveTab((initialTab && tabSlugMap[initialTab]) || "Entregável");
  }, [initialTab]);

  useEffect(() => {
    const loadCheckoutOptions = async () => {
      if (!productId || !token || !showOfferModal) return;
      setCheckoutOptionsLoading(true);
      try {
        const data = await withLoading(
          () => productApi.getCheckoutsByProductId(productId, token),
          "Carregando checkouts"
        );
        console.log("[productApi] Checkouts carregados:", data);
        setCheckoutOptions(data);
        // Preenche back redirect padrão com o primeiro checkout disponível
        if (data.length > 0 && typeof window !== "undefined") {
          const origin = window.location.origin;
          const fallbackCheckout = data[0];
          const fallbackCheckoutId = fallbackCheckout?.id ?? "";
          setOfferBackRedirect(prev =>
            prev || `${origin}/checkout/${productId}/${fallbackCheckoutId}`
          );
        }
      } catch (error) {
        console.error("Erro ao carregar checkouts para oferta:", error);
      } finally {
        setCheckoutOptionsLoading(false);
      }
    };
    void loadCheckoutOptions();
  }, [productId, token, showOfferModal, withLoading]);

  useEffect(() => {
    const loadOrderBumpOffers = async () => {
      if (!productId || !token || !showOfferModal) return;
      setOrderBumpOffersLoading(true);
      try {
        console.log("[offerApi] Buscando ofertas para order bump:", { productId, showOfferModal });
        const data = await withLoading(
          () => productApi.getOffersByProductId(productId, token),
          "Carregando ofertas"
        );
        console.log("[offerApi] Ofertas carregadas:", data);
        setOrderBumpOffers(data);
      } catch (error) {
        console.error("Erro ao carregar ofertas para order bump:", error);
      } finally {
        setOrderBumpOffersLoading(false);
      }
    };
    void loadOrderBumpOffers();
  }, [productId, token, showOfferModal, withLoading]);

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
              <EntregavelTab
                productId={productId}
                token={token ?? undefined}
                withLoading={withLoading}
                onOpenCreate={() => setShowDeliverableModal(true)}
                refreshKey={deliverablesRefreshKey}
              />
            )}

{activeTab === "Ofertas" && (
              <OfertasTab
                productId={productId}
                token={token ?? undefined}
                withLoading={withLoading}
                onOpenOfferModal={() => setShowOfferModal(true)}
                refreshKey={offersRefreshKey}
              />
            )}

            {activeTab === "Checkouts" && (
              <CheckoutsTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}

            {activeTab === "Configurações" && (
              <ConfiguracoesTab
                productId={productId}
                token={token ?? undefined}
                withLoading={withLoading}
                onOpenRecoveryModal={() => setShowRecoveryModal(true)}
              />
            )}

            {activeTab === "Pixels de rastreamento" && (
              <PixelsTab
                productId={productId}
                token={token ?? undefined}
                withLoading={withLoading}
                onOpenPixelForm={() => setShowPixelModal(true)}
                refreshKey={pixelsRefreshKey}
              />
            )}


            {activeTab === "Upsell, downsell e mais" && (
              <UpsellTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}

            {activeTab === "Cupons" && (
              <CuponsTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
            )}

            {activeTab === "Coprodução" && (
              <CoproducaoTab productId={productId} token={token ?? undefined} withLoading={withLoading} />
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
                    <ToggleActive
                      checked={offerStatus === "active"}
                      onCheckedChange={checked => setOfferStatus(checked ? "active" : "inactive")}
                      aria-label="Alternar status da oferta"
                    />
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
              <div className="space-y-3">
                <div className="space-y-1 text-sm">
                  <p className="text-foreground font-semibold">Checkout</p>
                  <p className="text-xs text-muted-foreground">
                    Para usar um novo layout crie um checkout na aba Checkouts e selecione-o aqui.
                  </p>
                    <div className="relative">
                      <select
                        className="h-11 w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 pr-10 text-sm text-foreground shadow-inner transition focus:border-primary focus:outline-none disabled:opacity-60"
                        value={selectedCheckoutId}
                        onChange={event => {
                          const value = event.target.value;
                          setSelectedCheckoutId(value);
                          if (value && typeof window !== "undefined" && productId) {
                            setOfferBackRedirect(`${window.location.origin}/checkout/${productId}/${value}`);
                          }
                        }}
                        disabled={checkoutOptionsLoading || checkoutOptions.length === 0}
                      >
                        <option value="">{checkoutOptionsLoading ? "Carregando checkouts..." : "Selecione um checkout"}</option>
                        {checkoutOptions.map(checkout => (
                          <option key={checkout.id} value={checkout.id ?? ""}>
                            {checkout.name || checkout.id}
                          </option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                        <ChevronDown className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                      <span>Oferta gratuita</span>
                      <ToggleActive
                        checked={offerFree}
                        onCheckedChange={checked => {
                          setOfferFree(checked);
                          if (checked) setOfferPrice("");
                        }}
                        aria-label="Alternar oferta gratuita"
                      />
                    </div>
                    {!offerFree && (
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="R$ 0,00"
                        value={offerPrice}
                        onChange={event => setOfferPrice(formatBRLInput(event.target.value))}
                      />
                    )}
                  </div>
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
                      <div className="relative flex-1">
                        <select
                          className="h-11 w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 pr-10 text-sm text-foreground shadow-inner transition focus:border-primary focus:outline-none"
                          value={subscriptionFrequency}
                          onChange={event =>
                            setSubscriptionFrequency(event.target.value as "mensal" | "trimestral" | "anual")
                          }
                        >
                          <option value="anual">Anual</option>
                          <option value="mensal">Mensal</option>
                          <option value="trimestral">Trimestral</option>
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                          <ChevronDown className="h-4 w-4" aria-hidden />
                        </span>
                      </div>
                      <button
                        className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-foreground/20 bg-card text-foreground"
                        type="button"
                        onClick={() => setSubscriptionFrequency(prev => prev || "anual")}
                        aria-label="Adicionar plano"
                      >
                        +
                      </button>
                    </div>
                  </div>

              {subscriptionFrequency && (
                <div className="space-y-4 rounded-[10px] border border-foreground/15 bg-card/80 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {`Plano ${subscriptionFrequency === "anual" ? "anual" : subscriptionFrequency === "mensal" ? "mensal" : "trimestral"}`}
                  </p>
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border border-foreground/30 bg-card"
                          checked={subscriptionDefault}
                          onChange={event => setSubscriptionDefault(event.target.checked)}
                        />
                        Definir como padrão
                      </label>
                      <div className="grid grid-cols-1 gap-3">
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Título"
                          value={subscriptionTitle}
                          onChange={event => setSubscriptionTitle(event.target.value)}
                        />
                        <div className="relative">
                          <select
                            className="h-10 w-full appearance-none rounded-[8px] border border-foreground/20 bg-card px-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={subscriptionTag}
                            onChange={event => setSubscriptionTag(event.target.value)}
                          >
                            <option value="">Selecione uma tag</option>
                            <option value="novidade">Novidade</option>
                            <option value="desconto">Desconto</option>
                            <option value="recomendado">Recomendado</option>
                          </select>
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Preço normal"
                          value={subscriptionPrice}
                          onChange={event => setSubscriptionPrice(formatBRLInput(event.target.value))}
                        />
                        <input
                          className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Preço promocional"
                          value={subscriptionPromoPrice}
                          onChange={event => setSubscriptionPromoPrice(formatBRLInput(event.target.value))}
                        />
                      </div>
                        <div className="rounded-[8px] border border-foreground/15 bg-card px-3 py-3 text-xs text-muted-foreground">
                          <p className="text-sm font-semibold text-foreground">Pré-visualização do seu comprador:</p>
                          <div className="mt-2 rounded-[6px] border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-foreground">
                            <p className="font-semibold">
                              {subscriptionTitle.trim() ||
                                `Plano ${subscriptionFrequency === "anual" ? "anual" : subscriptionFrequency === "mensal" ? "mensal" : "trimestral"}`}
                            </p>
                            <p>
                              {subscriptionFrequency === "anual"
                                ? "Anual"
                                : subscriptionFrequency === "trimestral"
                                ? "Trimestral"
                                : "Mensal"}{" "}
                              - {subscriptionPrice || "R$ 0,00"}
                            </p>
                          </div>
                        </div>
                        <p className="rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-center text-[11px] text-muted-foreground">
                          Por conta da frequência, o limite de parcelamento é de 12x.
                        </p>
                      </div>

                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                          <span>Preço diferente na primeira cobrança</span>
                          <ToggleActive
                            checked={firstChargePriceEnabled}
                            onCheckedChange={setFirstChargePriceEnabled}
                            aria-label="Ativar preço diferente na primeira cobrança"
                          />
                        </div>
                        {firstChargePriceEnabled && (
                          <input
                            className="h-10 w-full rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                            placeholder="R$ 0,00"
                            value={subscriptionFirstChargePrice}
                            onChange={event => setSubscriptionFirstChargePrice(formatBRLInput(event.target.value))}
                          />
                        )}

                        <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                          <span>Número fixo de cobranças</span>
                          <ToggleActive
                            checked={fixedChargesEnabled}
                            onCheckedChange={setFixedChargesEnabled}
                            aria-label="Ativar número fixo de cobranças"
                          />
                        </div>
                        {fixedChargesEnabled && (
                          <div className="flex items-center gap-2">
                            <input
                              className="h-10 w-20 rounded-[8px] border border-foreground/20 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                              placeholder="00"
                              value={subscriptionChargesCount}
                              onChange={event => setSubscriptionChargesCount(event.target.value.replace(/\D/g, ""))}
                            />
                            <span className="text-sm text-muted-foreground">cobranças</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          className="w-1/2 min-w-[140px] rounded-[8px] bg-rose-900/40 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-900/60"
                          type="button"
                          onClick={() => {
                            setSubscriptionFrequency("anual");
                            setSubscriptionTitle("");
                            setSubscriptionTag("");
                            setSubscriptionPrice("");
                            setSubscriptionPromoPrice("");
                            setSubscriptionFirstChargePrice("");
                            setSubscriptionChargesCount("");
                            setSubscriptionDefault(false);
                            setFirstChargePriceEnabled(false);
                            setFixedChargesEnabled(false);
                          }}
                        >
                          Excluir plano
                        </button>
                      </div>
                  </div>
                )}
              </div>
            )}

            {offerType === "assinatura" && (
              <div className="space-y-1 text-sm">
                <p className="text-foreground font-semibold">Checkout</p>
                <p className="text-xs text-muted-foreground">
                  Para usar um novo layout crie um checkout na aba Checkouts e selecione-o aqui.
                </p>
                <div className="relative">
                  <select
                    className="h-11 w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 pr-10 text-sm text-foreground shadow-inner transition focus:border-primary focus:outline-none disabled:opacity-60"
                    value={selectedCheckoutId}
                    onChange={event => {
                      const value = event.target.value;
                      setSelectedCheckoutId(value);
                      if (value && typeof window !== "undefined" && productId) {
                        setOfferBackRedirect(`${window.location.origin}/checkout/${productId}/${value}`);
                      }
                    }}
                    disabled={checkoutOptionsLoading || checkoutOptions.length === 0}
                  >
                    <option value="">{checkoutOptionsLoading ? "Carregando checkouts..." : "Selecione um checkout"}</option>
                    {checkoutOptions.map(checkout => (
                      <option key={checkout.id} value={checkout.id ?? ""}>
                        {checkout.name || checkout.id}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    <ChevronDown className="h-4 w-4" aria-hidden />
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground">Order Bumps</p>
                  <p className="text-xs text-muted-foreground">
                      Complete as informações para adicionar produtos complementares ao seu plano de assinatura durante o processo de pagamento.
                    </p>
                  </div>
                  <ToggleActive
                    checked={orderBumpEnabled}
                    onCheckedChange={setOrderBumpEnabled}
                    aria-label="Ativar Order Bumps"
                  />
                </div>

                {orderBumpEnabled && (
                  <div className="space-y-4 rounded-[10px] border border-foreground/15 bg-card/70 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1 text-xs text-muted-foreground">
                        <span className="text-foreground">Produto</span>
                        <div className="relative">
                          <select
                            className="h-10 w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={orderBumpForm.product || product?.name || ""}
                            onChange={event => setOrderBumpForm(prev => ({ ...prev, product: event.target.value }))}
                          >
                            <option value={product?.name || product?.id || ""}>{product?.name || "Selecione"}</option>
                          </select>
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          </span>
                        </div>
                      </label>

                      <label className="space-y-1 text-xs text-muted-foreground">
                        <span className="text-foreground">Oferta</span>
                        <div className="relative">
                          <select
                            className="h-10 w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
                            value={orderBumpForm.offer}
                            onChange={event => setOrderBumpForm(prev => ({ ...prev, offer: event.target.value }))}
                            disabled={orderBumpOffersLoading || orderBumpOffers.length === 0}
                          >
                            <option value="">{orderBumpOffersLoading ? "Carregando..." : "Selecione"}</option>
                            {orderBumpOffers.map(offer => (
                              <option key={offer.id ?? offer.name} value={offer.id ?? ""}>
                                {offer.name}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1 text-xs text-muted-foreground">
                        <span className="text-foreground">Título</span>
                        <input
                          className="h-10 w-full rounded-[10px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          placeholder="Digite um título"
                          value={orderBumpForm.title}
                          onChange={event => setOrderBumpForm(prev => ({ ...prev, title: event.target.value }))}
                        />
                      </label>

                      <label className="space-y-1 text-xs text-muted-foreground">
                        <span className="text-foreground">Tag em destaque</span>
                        <div className="relative">
                          <select
                            className="h-10 w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none"
                            value={orderBumpForm.tag}
                            onChange={event => setOrderBumpForm(prev => ({ ...prev, tag: event.target.value }))}
                          >
                            <option value="">Selecione</option>
                            <option value="novidade">Novidade</option>
                            <option value="desconto">Desconto</option>
                            <option value="recomendado">Recomendado</option>
                          </select>
                          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                            <ChevronDown className="h-4 w-4" aria-hidden />
                          </span>
                        </div>
                      </label>
                    </div>

                    <label className="space-y-1 text-xs text-muted-foreground">
                      <span className="text-foreground">Descrição do order bump (opcional)</span>
                      <textarea
                        className="min-h-[70px] rounded-[8px] border border-foreground/15 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Digite uma descrição"
                        value={orderBumpForm.description}
                        onChange={event => setOrderBumpForm(prev => ({ ...prev, description: event.target.value }))}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-[8px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90 disabled:opacity-60"
                        disabled={
                          !orderBumpForm.title.trim() ||
                          ((offerType === "preco_unico"
                            ? parseBRLToNumber(offerPrice)
                            : parseBRLToNumber(subscriptionPrice)) === undefined)
                        }
                        onClick={() => {
                          const baseOfferPrice =
                            offerType === "preco_unico"
                              ? parseBRLToNumber(offerPrice)
                              : parseBRLToNumber(subscriptionPrice);
                          if (baseOfferPrice === undefined || Number.isNaN(baseOfferPrice)) {
                            toast.error("Valor da oferta não fornecido");
                            return;
                          }
                          const next: OrderBump = {
                            title: orderBumpForm.title.trim(),
                            tag: orderBumpForm.tag.trim() || undefined,
                            product: orderBumpForm.product.trim() || product?.name || undefined,
                            offer: orderBumpForm.offer.trim() || undefined,
                            description: orderBumpForm.description.trim() || undefined,
                            price: orderBumpForm.price ? Number(orderBumpForm.price) : undefined,
                          };
                          if (editingOrderBumpIndex !== null) {
                            setOrderBumps(prev => prev.map((item, idx) => (idx === editingOrderBumpIndex ? next : item)));
                          } else {
                            setOrderBumps(prev => [...prev, next]);
                          }
                          setOrderBumpForm({
                            product: "",
                            offer: "",
                            title: "",
                            tag: "",
                            price: "",
                            description: "",
                          });
                          setEditingOrderBumpIndex(null);
                        }}
                      >
                        {editingOrderBumpIndex !== null ? "Salvar Order Bump" : "Adicionar Order Bump"}
                      </button>
                      {editingOrderBumpIndex !== null && (
                        <button
                          type="button"
                          className="rounded-[8px] border border-foreground/20 bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                          onClick={() => {
                            setOrderBumpForm({
                              product: "",
                              offer: "",
                              title: "",
                              tag: "",
                              price: "",
                              description: "",
                            });
                            setEditingOrderBumpIndex(null);
                          }}
                        >
                          Cancelar edição
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {orderBumpEnabled && (
                  <div className="space-y-3 rounded-[10px] border border-dashed border-primary/70 p-4">
                    {orderBumps.map((item, idx) => (
                      <div
                        key={idx}
                        className="overflow-hidden rounded-[12px] border border-primary/50 bg-card/90 shadow-[0_10px_30px_rgba(108,39,215,0.25)]"
                      >
                        <div className="flex items-center justify-between bg-foreground/5 px-4 py-3 text-sm font-semibold text-foreground">
                          <span className="text-lg font-semibold">{String(idx + 1).padStart(2, "0")}</span>
                          <div className="flex items-center gap-2">
                            <button
                              className="inline-flex items-center gap-2 rounded-[8px] border border-foreground/15 bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-foreground/40"
                              onClick={() => {
                                setEditingOrderBumpIndex(idx);
                                setOrderBumpForm({
                                  product: item.product ?? "",
                                  offer: item.offer ?? "",
                                  title: item.title ?? "",
                                  tag: item.tag ?? "",
                                  price: item.price !== undefined ? String(item.price) : "",
                                  description: item.description ?? "",
                                });
                              }}
                            >
                              Editar
                            </button>
                            <button
                              className="inline-flex items-center gap-2 rounded-[8px] border border-rose-900/50 bg-rose-900/20 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:border-rose-400/60"
                              onClick={() => setOrderBumps(prev => prev.filter((_, bumpIdx) => bumpIdx !== idx))}
                            >
                              Excluir
                            </button>
                          </div>
                        </div>

                        <div className="divide-y divide-foreground/10">
                          <div className="flex items-start gap-4 px-4 py-4">
                            <div className="overflow-hidden rounded-[12px] bg-foreground/10">
                              <Image
                                src="/images/produto.png"
                                alt={item.title || "Order bump"}
                                width={120}
                                height={120}
                                className="h-[120px] w-[120px] object-cover"
                              />
                            </div>
                            <div className="flex-1 space-y-2 pt-1">
                              <div className="flex flex-col text-xs text-muted-foreground">
                                {(() => {
                                  const displayProduct =
                                    item.product === product?.id ? product?.name : item.product || product?.name;
                                  return <span className="px-2 py-1 text-foreground">{displayProduct || "—"}</span>;
                                })()}
                              </div>
                              <p className="text-lg font-semibold text-foreground">
                                {(() => {
                                  const bumpPrice =
                                    item.price ??
                                    parseBRLToNumber(offerPrice) ??
                                    parseBRLToNumber(subscriptionPrice);
                                  return bumpPrice !== undefined
                                    ? bumpPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                    : "Preço não informado";
                                })()}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3 px-4 py-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <p className="text-base font-semibold text-foreground">
                                {item.title || "Título"}
                              </p>
                              <div className="inline-flex rounded-full bg-emerald-700/25 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                                {item.tag?.toUpperCase() || "SEM TAG"}
                              </div>
                            </div>
                            {item.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Back Redirect</p>
                      <p className="text-xs text-muted-foreground">
                        Redirecione o comprador para URL cadastrada automaticamente ao sair do checkout.
                      </p>
                    </div>
                    <ToggleActive
                      checked={backRedirectEnabled}
                      onCheckedChange={setBackRedirectEnabled}
                      aria-label="Ativar back redirect"
                    />
                  </div>
                  <input
                    className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Insira o link de back redirect"
                    value={offerBackRedirect}
                    onChange={event => setOfferBackRedirect(event.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Ir para outra página após aprovado</p>
                      <p className="text-xs text-muted-foreground">
                        Você pode redirecionar o comprador para uma página de upsell ou de obrigado personalizada.
                      </p>
                    </div>
                    <ToggleActive
                      checked={nextRedirectEnabled}
                      onCheckedChange={setNextRedirectEnabled}
                      aria-label="Ativar redirecionamento após aprovado"
                    />
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
                  onChange={event =>
                    setPlanForm(prev => ({ ...prev, type: event.target.value as SubscriptionPlanPayload["type"] }))
                  }
                >
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual</option>
                  <option value="quarterly">Trimestral</option>
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

                      const payload: SubscriptionPlanPayload = {
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
                        setPixelsRefreshKey(prev => prev + 1);
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
                        setSelectedPixelPlatform(null);
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
