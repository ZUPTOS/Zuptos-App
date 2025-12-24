'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { productApi } from "@/lib/api";
import type { Product, ProductDeliverable, ProductOffer, Checkout } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const tabs = [
  "Área de membros",
  "Entregável",
  "Ofertas",
  "Checkouts",
  "Configurações",
  "Pixels de rastreamento",
  "Upsell, downsell e mais",
  "Cupons",
  "Coprodução",
] as const;

const trackingPixels = [
  { name: "META", id: "688693e", platform: "Facebook", status: "Ativo" }
] as const;

const upsellItems = [
  { name: "META", type: "Upsell", offer: "Oferta 01", value: "R$00,00", script: "<script>" }
] as const;

const coupons = [
  { name: "CUPOM 10", discount: "R$ 00,00", code: "ZUPTOS10", status: "Ativo" },
  { name: "CUPOM 10", discount: "10%", code: "ZUPTOS10", status: "Inativo" },
] as const;

const coproductions = [
  { name: "BÁSICO", start: "dd/mm/aaaa", commission: "0%", duration: "Vitalícia", status: "Aprovado" },
] as const;

type TabLabel = (typeof tabs)[number];

const tabSlugMap: Record<string, TabLabel> = {
  entregaveis: "Entregável",
  ofertas: "Ofertas",
  checkouts: "Checkouts",
};

const tabToSlug: Record<TabLabel, string> = {
  "Área de membros": "area-de-membros",
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
  const [product, setProduct] = useState<Product | null>(null);
  const [, setIsLoading] = useState(false);
  const initialTabLabel = (initialTab && tabSlugMap[initialTab]) || "Entregável";
  const [activeTab, setActiveTab] = useState<TabLabel>(initialTabLabel);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [showPixelModal, setShowPixelModal] = useState(false);
  const [showPixelFormModal, setShowPixelFormModal] = useState(false);
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
  const [pixelType, setPixelType] = useState<"padrao" | "api">("padrao");
  const [couponUnit, setCouponUnit] = useState<"valor" | "percent">("valor");
  const [offerType, setOfferType] = useState<"preco_unico" | "assinatura">("preco_unico");
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [checkoutsLoading, setCheckoutsLoading] = useState(false);
  const [checkoutsError, setCheckoutsError] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId || !token) return;
      setIsLoading(true);
      try {
        const data = await productApi.getProductById(productId, token);
        setProduct(data);
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchProduct();
  }, [productId, token]);

  const loadDeliverables = useCallback(async () => {
    if (!productId || !token || activeTab !== "Entregável") return;
    setDeliverablesLoading(true);
    setDeliverablesError(null);
    try {
      const data = await productApi.getDeliverablesByProductId(productId, token);
      console.log("[productApi] Entregáveis recebidos:", data);
      setDeliverables(data);
    } catch (error) {
      console.error("Erro ao carregar entregáveis:", error);
      setDeliverablesError("Não foi possível carregar os entregáveis agora.");
    } finally {
      setDeliverablesLoading(false);
    }
  }, [activeTab, productId, token]);

  useEffect(() => {
    void loadDeliverables();
  }, [loadDeliverables]);

  const loadOffers = useCallback(async () => {
    if (!productId || !token || activeTab !== "Ofertas") return;
    setOffersLoading(true);
    setOffersError(null);
    try {
      const data = await productApi.getOffersByProductId(productId, token);
      console.log("[productApi] Ofertas recebidas:", data);
      setOffers(data);
    } catch (error) {
      console.error("Erro ao carregar ofertas:", error);
      setOffersError("Não foi possível carregar as ofertas agora.");
    } finally {
      setOffersLoading(false);
    }
  }, [activeTab, productId, token]);

  useEffect(() => {
    void loadOffers();
  }, [loadOffers]);

  const loadCheckouts = useCallback(async () => {
    if (!productId || !token || activeTab !== "Checkouts") return;
    setCheckoutsLoading(true);
    setCheckoutsError(null);
    try {
      const data = await productApi.getCheckoutsByProductId(productId, token);
      console.log("[productApi] Checkouts recebidos:", data);
      setCheckouts(data);
    } catch (error) {
      console.error("Erro ao carregar checkouts:", error);
      setCheckoutsError("Não foi possível carregar os checkouts agora.");
    } finally {
      setCheckoutsLoading(false);
    }
  }, [activeTab, productId, token]);

  useEffect(() => {
    void loadCheckouts();
  }, [loadCheckouts]);

  const formatSize = (size?: number) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

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
    const thumb = product?.image_url || "/images/produto.png";
    const name = product?.name ?? "Produto";
    const status = (product as Product & { status?: string })?.status ?? "Ativo";
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
            <span className="text-xs font-semibold text-emerald-400">{status}</span>
          </div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">R$ 0,00 faturados</p>
          <p>0 vendas realizadas</p>
        </div>
      </div>
    );
  }, [product]);

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
                      <div className="px-4 py-4 text-sm text-muted-foreground">Carregando entregáveis...</div>
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
                      <div className="px-4 py-4 text-sm text-muted-foreground">Carregando ofertas...</div>
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
                      <div className="px-4 py-4 text-sm text-muted-foreground">Carregando checkouts...</div>
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
                      <span className="text-foreground">E-mail</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Insira o e-mail"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Telefone</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Insira o e-mail"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Categoria</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Selecione a categoria"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Formato</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Curso"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Idioma</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Português"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Moeda base</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="Real"
                      />
                    </label>
                    <label className="space-y-1 text-sm text-muted-foreground">
                      <span className="text-foreground">Página de vendas</span>
                      <input
                        className="h-10 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                        placeholder="www.site.com"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-[10px] border border-foreground/15 bg-card px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Status do produto</p>
                      <p className="text-xs text-muted-foreground">Gerencie se o produto estará ou não ativo para vendas</p>
                    </div>
                    <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                      <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
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
                  <button className="rounded-[8px] bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90">
                    Salvar alterações
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
                      onClick={() => setShowPixelModal(true)}
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
                    {trackingPixels.map(pixel => (
                      <div
                        key={`${pixel.name}-${pixel.id}`}
                        className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold uppercase">{pixel.name}</span>
                        <span className="text-muted-foreground">{pixel.id}</span>
                        <span className="flex items-center gap-2 text-muted-foreground">{pixel.platform}</span>
                        <div className="flex justify-end">
                          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-[6px] text-xs font-semibold text-emerald-300">
                            {pixel.status}
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
                    {upsellItems.map(item => (
                      <div
                        key={`${item.name}-${item.offer}`}
                        className="grid grid-cols-5 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold uppercase">{item.name}</span>
                        <span className="text-muted-foreground">{item.type}</span>
                        <span className="text-muted-foreground">{item.offer}</span>
                        <span className="font-semibold">{item.value}</span>
                        <div className="flex justify-end">
                          <span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-[6px] text-[11px] font-semibold text-muted-foreground">
                            {item.script}
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
                      onClick={() => setShowCouponModal(true)}
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
                    {coupons.map(coupon => (
                      <div
                        key={`${coupon.name}-${coupon.code}-${coupon.discount}`}
                        className="grid grid-cols-4 items-center gap-4 px-4 py-4 text-sm text-foreground"
                      >
                        <span className="font-semibold uppercase">{coupon.name}</span>
                        <span className="font-semibold">{coupon.discount}</span>
                        <span className="text-muted-foreground">{coupon.code}</span>
                        <div className="flex justify-end">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${
                              coupon.status === "Ativo"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-muted/60 text-muted-foreground"
                            }`}
                          >
                            {coupon.status}
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
                  { name: "Google Ads", icon: "/images/google-ads.png" },
                  { name: "Facebook", icon: "/images/facebook.png" },
                  { name: "TikTok", icon: "/images/tiktok.png" },
                ].map(platform => (
                  <label
                    key={platform.name}
                    className="flex items-center justify-between gap-3 rounded-[12px] border border-foreground/15 bg-card/80 px-4 py-3 text-sm text-muted-foreground transition hover:border-foreground/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-foreground/10">
                        <Image src={platform.icon} alt={platform.name} width={32} height={32} className="object-contain" />
                      </div>
                      <span className="text-base text-foreground">{platform.name}</span>
                    </div>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-foreground/25" />
                  </label>
                ))}
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
                    setShowPixelModal(false);
                    setShowPixelFormModal(true);
                  }}
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
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPixelType("padrao")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      pixelType === "padrao"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    Padrão
                  </button>
                  <button
                    type="button"
                    onClick={() => setPixelType("api")}
                    className={`rounded-[8px] border px-3 py-3 text-center text-sm font-semibold shadow-inner ${
                      pixelType === "api"
                        ? "border-foreground/20 bg-[#d9d9d9] text-black"
                        : "border-foreground/10 bg-card text-muted-foreground"
                    }`}
                  >
                    API
                  </button>
                </div>
              </div>

              <label className="space-y-2 text-sm text-muted-foreground">
                <span className="text-foreground">Nome</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                />
              </label>

              {pixelType === "api" && (
                <label className="space-y-2 text-sm text-muted-foreground">
                  <span className="text-foreground">Token acesso API conversões</span>
                  <input
                    className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="Digite um nome"
                  />
                </label>
              )}

              <label className="space-y-2 text-sm text-muted-foreground">
                <span className="text-foreground">Pixel Id</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Digite um nome"
                />
              </label>

              <div className="flex items-center gap-3 pt-2 text-sm font-semibold text-foreground">
                <span>Status</span>
                <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                  <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
                </button>
                <span className="text-muted-foreground">Ativo</span>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-sm font-semibold text-foreground">Configure eventos do pixel</p>
                <p className="text-xs text-muted-foreground">Registro e otimização de conversões.</p>
                {[
                  "Adicionar um item ao carrinho (AddToCart)",
                  "Iniciar finalização da compra (InitiateCheckout)",
                  "Adicionar dados de pagamento (AddPaymentInfo)",
                  "Compra (Purchase)",
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
                  onClick={() => setShowPixelFormModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_10px_30px_rgba(108,39,215,0.35)] transition hover:bg-primary/90"
                  onClick={() => setShowPixelFormModal(false)}
                >
                  Adicionar
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
                />
              </label>

              <label className="space-y-3 text-sm text-muted-foreground">
                <span className="text-foreground">Código de Cupom</span>
                <input
                  className="h-11 w-full rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Selecione um produto"
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
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="R$ 0,00"
                  />
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="R$ 0,00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="dd/mm/aaaa"
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                    Não vence
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="h-10 rounded-[8px] border border-foreground/15 bg-card px-3 text-sm text-muted-foreground focus:border-primary focus:outline-none"
                    placeholder="0"
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="h-4 w-4 rounded border border-foreground/30 bg-card" />
                    Não tem limites
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                <span>Status</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Ativo</span>
                  <button className="relative inline-flex h-5 w-10 items-center rounded-full bg-primary/70">
                    <span className="absolute left-[calc(100%-18px)] h-4 w-4 rounded-full bg-white transition" />
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
                  onClick={() => setShowCouponModal(false)}
                >
                  Adicionar
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
