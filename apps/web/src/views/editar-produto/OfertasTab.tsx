'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { productApi } from "@/lib/api";
import type {
  Checkout,
  CreateOrderBumpRequest,
  OrderBump,
  Product,
  ProductOffer,
  SubscriptionPlanPayload,
} from "@/lib/api";
import { ProductOfferType } from "@/lib/api";
import ToggleActive from "@/components/ToggleActive";
import PaginatedTable from "@/components/PaginatedTable";

type OrderBumpOfferOption = ProductOffer & { productId?: string; productName?: string };

type Props = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

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

const TruncatedWithTooltip = ({ text, className }: { text?: string; className?: string }) => {
  const content = text ?? "-";
  return (
    <span className={`relative block w-full truncate ${className ?? ""}`}>
      <span className="group block w-full truncate">
        {content}
        <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden max-w-[260px] -translate-x-1/2 rounded-md border border-foreground/15 bg-card px-2 py-1 text-[11px] text-foreground shadow-lg group-hover:block">
          {content}
        </span>
      </span>
    </span>
  );
};

export function OfertasTab({ productId, token, withLoading }: Props) {
  const [offers, setOffers] = useState<ProductOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<ProductOffer | null>(null);
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
  const [orderBumpOffers, setOrderBumpOffers] = useState<OrderBumpOfferOption[]>([]);
  const [orderBumpOffersLoading, setOrderBumpOffersLoading] = useState(false);
  const [orderBumpProducts, setOrderBumpProducts] = useState<Product[]>([]);
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
  const [offerDeleteTarget, setOfferDeleteTarget] = useState<ProductOffer | null>(null);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const lastCopiedRef = useRef<{ id?: string; at: number } | null>(null);

  const resetOfferForm = useCallback(() => {
    setEditingOffer(null);
    setOfferName("");
    setOfferPrice("");
    setOfferBackRedirect("");
    setOfferNextRedirect("");
    setOfferStatus("active");
    setOfferFree(false);
    setBackRedirectEnabled(true);
    setNextRedirectEnabled(true);
    setFirstChargePriceEnabled(false);
    setFixedChargesEnabled(false);
    setSubscriptionFrequency("anual");
    setSubscriptionTitle("");
    setSubscriptionTag("");
    setSubscriptionPrice("");
    setSubscriptionPromoPrice("");
    setSubscriptionFirstChargePrice("");
    setSubscriptionChargesCount("");
    setSubscriptionDefault(false);
    setSelectedCheckoutId("");
    setOrderBumpEnabled(false);
    setOrderBumps([]);
    setOrderBumpForm({
      product: "",
      offer: "",
      title: "",
      tag: "",
      price: "",
      description: "",
    });
    setEditingOrderBumpIndex(null);
    setOfferType("preco_unico");
  }, []);

  const openCreateOffer = useCallback(() => {
    resetOfferForm();
    setShowOfferModal(true);
  }, [resetOfferForm]);

  const openEditOffer = useCallback((offer: ProductOffer) => {
    resetOfferForm();
    setEditingOffer(offer);
    const normalizedType = offer.type?.toLowerCase();
    setOfferType(normalizedType === "subscription" ? "assinatura" : "preco_unico");
    setOfferName(offer.name ?? "");
    setOfferStatus(offer.status?.toLowerCase() === "inactive" ? "inactive" : "active");
    setOfferFree(Boolean(offer.free));
    if (!offer.free && offer.offer_price != null) {
      setOfferPrice(formatBRLInput(String(offer.offer_price)));
    }
    setOfferBackRedirect(offer.back_redirect_url ?? "");
    setOfferNextRedirect(offer.next_redirect_url ?? "");
    setSelectedCheckoutId(offer.checkout_id ?? offer.checkout?.id ?? "");
    const plan = offer.subscription_plan ?? (offer as { plan?: SubscriptionPlanPayload | null }).plan;
    if (plan) {
      setSubscriptionFrequency(plan.type === "yearly" ? "anual" : plan.type === "quarterly" ? "trimestral" : "mensal");
      setSubscriptionTitle(plan.name ?? "");
      setSubscriptionPrice(plan.plan_price != null ? formatBRLInput(String(plan.plan_price)) : "");
      setSubscriptionPromoPrice(plan.discount_price != null ? formatBRLInput(String(plan.discount_price)) : "");
      setSubscriptionFirstChargePrice(
        plan.price_first_cycle != null ? formatBRLInput(String(plan.price_first_cycle)) : ""
      );
      setSubscriptionChargesCount(plan.cycles != null ? String(plan.cycles) : "");
      setSubscriptionDefault(Boolean(plan.default));
      setFirstChargePriceEnabled(Boolean(plan.price_first_cycle));
      setFixedChargesEnabled(Boolean(plan.cycles));
    }
    setShowOfferModal(true);
  }, [resetOfferForm]);

  const closeOfferModal = useCallback(() => {
    setShowOfferModal(false);
    resetOfferForm();
  }, [resetOfferForm]);

  const load = useCallback(async () => {
    if (!productId || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await withLoading(
        () => productApi.getOffersByProductId(productId, token),
        "Carregando ofertas"
      );
      console.log("[offerApi] Ofertas carregadas:", data);
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar ofertas:", err);
      setError("Não foi possível carregar as ofertas agora.");
    } finally {
      setLoading(false);
    }
  }, [productId, token, withLoading]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const handleCopyAccess = useCallback(async (accessUrl?: string, offerId?: string) => {
    if (!accessUrl || accessUrl === "-") return;
    const now = Date.now();
    const lastCopy = lastCopiedRef.current;
    if (lastCopy && lastCopy.id === offerId && now - lastCopy.at < 1200) {
      return;
    }
    try {
      await navigator.clipboard?.writeText(accessUrl);
      lastCopiedRef.current = { id: offerId, at: now };
      setCopiedOfferId(offerId ?? null);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedOfferId(null);
      }, 500);
      console.log("[offerApi] Link de acesso copiado:", accessUrl);
    } catch (err) {
      console.error("Não foi possível copiar o link de acesso:", err);
    }
  }, []);

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
        const productsList =
          (await withLoading(
            () => productApi.listProducts({ page: 1, limit: 50 }, token),
            "Carregando produtos"
          )) ?? [];
        const otherProducts = Array.isArray(productsList)
          ? productsList.filter(prod => prod?.id && prod.id !== productId)
          : [];
        setOrderBumpProducts(otherProducts);
        const offersPromises = otherProducts.map(async prod => {
          const offers = (await productApi.getOffersByProductId(prod.id!, token)) ?? [];
          return offers.map(offer => ({ ...offer, productId: prod.id, productName: prod.name }));
        });
        const offersNested = await Promise.all(offersPromises);
        const flattened = offersNested.flat().filter(offer => offer?.id);
        console.log("[offerApi] Ofertas carregadas para order bump:", flattened);
        setOrderBumpOffers(flattened);
      } catch (error) {
        console.error("Erro ao carregar ofertas para order bump:", error);
      } finally {
        setOrderBumpOffersLoading(false);
      }
    };
    void loadOrderBumpOffers();
  }, [productId, token, showOfferModal, withLoading]);

  const handleCreateOffer = async () => {
    if (!productId || !token) return;
    const isEditing = Boolean(editingOffer?.id);
    const selectedCheckout = checkoutOptions.find(checkout => checkout.id === selectedCheckoutId);
    const mappedType =
      offerType === "assinatura" ? ProductOfferType.SUBSCRIPTION : ProductOfferType.SINGLE_PURCHASE;

    const hasPlanData =
      Boolean(subscriptionTitle.trim()) ||
      Boolean(subscriptionPrice.trim()) ||
      Boolean(subscriptionPromoPrice.trim()) ||
      Boolean(subscriptionFirstChargePrice.trim()) ||
      Boolean(subscriptionChargesCount.trim());

    if (offerType === "assinatura" && hasPlanData) {
      if (!subscriptionTitle.trim() || !subscriptionPrice.trim()) {
        console.error("Preencha os campos do plano de assinatura antes de salvar a oferta.");
        return;
      }
    }

    const planFromSubscription: SubscriptionPlanPayload | undefined =
      offerType === "assinatura" && hasPlanData
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

    if (!isEditing && orderBumpEnabled) {
      const hasBumps = orderBumps.length > 0;
      const hasMissingInfo = orderBumps.some(bump => !bump.title || !bump.offer);
      if (!hasBumps || hasMissingInfo) {
        toast.error("Oder bump não especificado");
        return;
      }
    }

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
      if (!isEditing && offerType === "assinatura" && planFromSubscription) {
        console.log("[productApi] Payload de plano (subscription_plan):", planFromSubscription);
      }
      if (isEditing && editingOffer?.id) {
        console.log("[productApi] Enviando atualização de oferta:", payload);
        const response = await productApi.updateOffer(productId, editingOffer.id, payload, token);
        console.log("[productApi] Resposta do servidor (oferta):", response);
      } else {
        console.log("[productApi] Enviando criação de oferta:", payload);
        const response = await productApi.createOffer(productId, payload, token);
        if (offerType === "assinatura" && planFromSubscription && response?.id) {
          console.log("[productApi] Enviando plano (subscription_plan) para oferta:", response.id);
          const planResponse = await productApi.createOfferPlan(productId, response.id, planFromSubscription, token);
          console.log("[productApi] Resposta do servidor (plan):", planResponse);
        }
        if (orderBumpEnabled && response?.id) {
          const bumpsPayload: CreateOrderBumpRequest[] = orderBumps
            .filter(bump => bump.offer)
            .map(bump => ({
              bumped_offer_show_id: bump.offer as string,
              title: bump.title,
              description: bump.description,
              tag_display: bump.tag,
            }));
          console.log("[productApi] Enviando order bumps:", bumpsPayload);
          await Promise.all(
            bumpsPayload.map(bumpPayload => productApi.createOfferBump(productId, response.id!, bumpPayload, token))
          );
        }
        console.log("[productApi] Resposta do servidor (oferta):", response);
        if (response?.id && productId && typeof window !== "undefined") {
          const publicCheckoutLink = `${window.location.origin}/checkout/${response.id}/product/${productId}`;
          setOfferBackRedirect(publicCheckoutLink);
          console.log("[productApi] Link público do checkout:", publicCheckoutLink);
        }
      }
      setRefreshKey(prev => prev + 1);
      closeOfferModal();
    } catch (error) {
      console.error("Erro ao criar oferta:", error);
    } finally {
      setSavingOffer(false);
    }
  };

  return (
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
              disabled
            />
          </div>
          <button
            type="button"
            className="whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            onClick={openCreateOffer}
          >
            Adicionar oferta
          </button>
        </div>
      </div>

      <PaginatedTable<ProductOffer>
        data={offers}
        rowsPerPage={6}
        rowKey={offer => offer.id ?? offer.name ?? Math.random().toString()}
        isLoading={loading}
        emptyMessage={error || "Nenhuma oferta cadastrada."}
        columns={[
          {
            id: "nome",
            header: "Nome",
            render: offer => (
              <TruncatedWithTooltip text={offer.name} className="font-semibold uppercase" />
            ),
          },
          {
            id: "checkout",
            header: "Checkout",
            render: offer => {
              const checkoutObj = offer.checkout as unknown as { name?: string; id?: string } | undefined;
              const t = offer.template as unknown as { checkout?: { name?: string; id?: string }; name?: string; id?: string };
              const checkoutName =
                checkoutObj?.name ||
                checkoutObj?.id ||
                t?.checkout?.name ||
                t?.name ||
                t?.checkout?.id ||
                t?.id ||
                (typeof offer.template === "string" ? offer.template : offer.checkout_id ?? "default");
              return (
                <TruncatedWithTooltip
                  text={checkoutName}
                  className="font-semibold text-muted-foreground"
                />
              );
            },
          },
          {
            id: "tipo",
            header: "Tipo",
            render: offer => {
              const normalizedType = offer.type?.toLowerCase();
              const typeLabel =
                normalizedType === "subscription"
                  ? "Assinatura"
                  : normalizedType === "single_purchase" || normalizedType === "single"
                  ? "Preço único"
                  : offer.type ?? "-";
              return <TruncatedWithTooltip text={typeLabel} className="text-muted-foreground" />;
            },
          },
          {
            id: "valor",
            header: "Valor",
            render: offer => {
              const formatBRL = (value: number) =>
                new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
              return (
                <span className="font-semibold">
                  {offer.free ? "Gratuito" : offer.offer_price != null ? formatBRL(Number(offer.offer_price)) : "-"}
                </span>
              );
            },
          },
          {
            id: "acesso",
            header: "Acesso",
            width: "170px",
            render: offer => {
              const computedUrl =
                typeof window !== "undefined" && productId && offer.id
                  ? `${window.location.origin}/checkout/${offer.id}/product/${productId}`
                  : undefined;
              const backendUrl = offer.back_redirect_url ?? offer.next_redirect_url;
              const accessUrl =
                backendUrl && offer.id && backendUrl.includes(offer.id)
                  ? backendUrl
                  : computedUrl ?? backendUrl ?? "-";
              const accessLabel =
                accessUrl && accessUrl !== "-"
                  ? accessUrl.replace(/^https?:\/\//, "").slice(0, 24)
                  : "-";
              const offerKey = offer.id ?? accessUrl ?? "-";
              return (
                <div className="relative w-full max-w-[150px]">
                  <button
                    type="button"
                    className="w-full truncate rounded-[6px] border border-foreground/15 bg-card px-3 py-2 text-xs text-foreground transition hover:border-foreground/30 disabled:opacity-60"
                    disabled={!accessUrl || accessUrl === "-"}
                    onClick={() => handleCopyAccess(accessUrl, offerKey)}
                    title={accessUrl && accessUrl !== "-" ? "Copiar link de acesso" : "Sem link"}
                  >
                    {accessLabel}
                  </button>
                  {copiedOfferId === offerKey && (
                    <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-emerald-400">
                      Link copiado
                    </span>
                  )}
                </div>
              );
            },
          },
          {
            id: "status",
            header: "Status",
            render: offer => {
              const isActive = offer.status?.toLowerCase() === "active";
              return (
                <span
                  className={`inline-flex items-center rounded-full px-3 py-[6px] text-xs font-semibold ${
                    isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {isActive ? "Ativo" : "Inativo"}
                </span>
              );
            },
          },
          {
            id: "acoes",
            header: "",
            headerClassName: "text-center",
            cellClassName: "text-center",
            render: offer => (
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-foreground/15 bg-card text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
                  onClick={() => openEditOffer(offer)}
                  aria-label="Editar oferta"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-[8px] border border-rose-500/30 bg-rose-500/10 text-rose-200 transition hover:border-rose-500/60"
                  onClick={() => setOfferDeleteTarget(offer)}
                  aria-label="Excluir oferta"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ),
          },
        ]}
      />

      {showOfferModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={closeOfferModal}
            aria-label="Fechar modal"
          />
          <div className="relative h-full w-full max-w-[520px] overflow-y-auto rounded-[12px] border border-foreground/10 bg-card px-8 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-2xl font-semibold text-foreground">Criar oferta</h2>
              <button
                type="button"
                onClick={closeOfferModal}
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
                          if (!value) {
                            setOfferBackRedirect("");
                          }
                        }}
                        disabled={checkoutOptionsLoading || checkoutOptions.length === 0}
                      >
                        <option value="">
                          {checkoutOptionsLoading ? "Carregando checkouts..." : "Selecione um checkout"}
                        </option>
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
                        if (!value) {
                          setOfferBackRedirect("");
                        }
                      }}
                      disabled={checkoutOptionsLoading || checkoutOptions.length === 0}
                    >
                      <option value="">
                        {checkoutOptionsLoading ? "Carregando checkouts..." : "Selecione um checkout"}
                      </option>
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
                            className="h-10 w-full appearance-none rounded-[10px] border border-foreground/15 bg-card px-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none disabled:opacity-60"
                            value={orderBumpForm.product}
                            onChange={event =>
                              setOrderBumpForm(prev => ({
                                ...prev,
                                product: event.target.value,
                                offer: "",
                              }))
                            }
                            disabled={orderBumpOffersLoading || orderBumpProducts.length === 0}
                          >
                            <option value="">
                              {orderBumpOffersLoading
                                ? "Carregando produtos..."
                                : orderBumpProducts.length === 0
                                ? "Cadastre um outro produto com oferta"
                                : "Selecione um produto"}
                            </option>
                            {orderBumpProducts.map(prod => (
                              <option key={prod.id} value={prod.id}>
                                {prod.name}
                              </option>
                            ))}
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
                            disabled={
                              orderBumpOffersLoading || orderBumpOffers.length === 0 || !orderBumpForm.product
                            }
                          >
                            <option value="">
                              {orderBumpOffersLoading
                                ? "Carregando..."
                                : !orderBumpForm.product
                                ? "Selecione um produto primeiro"
                                : orderBumpOffers.length === 0
                                ? "Nenhuma oferta disponível"
                                : "Selecione"}
                            </option>
                            {orderBumpOffers
                              .filter(offer => offer.productId === orderBumpForm.product)
                              .map(offer => (
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
                          !orderBumpForm.product ||
                          !orderBumpForm.offer ||
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
                          if (!orderBumpForm.product || !orderBumpForm.offer) {
                            toast.error("Selecione produto e oferta para o Order Bump");
                            return;
                          }
                          if (!orderBumpForm.offer) {
                            toast.error("Selecione a oferta do order bump");
                            return;
                          }
                          const next: OrderBump = {
                            title: orderBumpForm.title.trim(),
                            tag: orderBumpForm.tag.trim() || undefined,
                            product: orderBumpForm.product.trim() || undefined,
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
                                  const displayProduct = orderBumpProducts.find(prod => prod.id === item.product)?.name;
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
                  {savingOffer ? "Salvando..." : editingOffer ? "Atualizar oferta" : "Adicionar oferta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {offerDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOfferDeleteTarget(null)}
            aria-label="Fechar confirmação"
          />
          <div className="relative w-full max-w-sm rounded-[12px] border border-foreground/10 bg-card p-6 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
            <h3 className="text-lg font-semibold text-foreground">Excluir oferta</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A exclusão ainda não está disponível no backend. Este modal já está pronto para quando a rota existir.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-[8px] border border-foreground/15 bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40"
                onClick={() => setOfferDeleteTarget(null)}
              >
                Fechar
              </button>
              <button
                type="button"
                className="rounded-[8px] bg-rose-500 px-4 py-2 text-sm font-semibold text-white opacity-50"
                disabled
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
