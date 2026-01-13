'use client';

import { useCallback, useEffect, useRef, useState } from "react";
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
import { formatBRLInput, parseBRLToNumber } from "./offerUtils";

type OrderBumpOfferOption = ProductOffer & { productId?: string; productName?: string };
const createEmptyOrderBumpForm = () => ({
  product: "",
  offer: "",
  title: "",
  tag: "",
  price: "",
  description: "",
});

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function useOffers({ productId, token, withLoading }: Params) {
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
  const [orderBumpForm, setOrderBumpForm] = useState(createEmptyOrderBumpForm());
  const [editingOrderBumpIndex, setEditingOrderBumpIndex] = useState<number | null>(null);
  const [savingOffer, setSavingOffer] = useState(false);
  const [offerType, setOfferType] = useState<"preco_unico" | "assinatura">("preco_unico");
  const [offerDeleteTarget, setOfferDeleteTarget] = useState<ProductOffer | null>(null);
  const [copiedOfferId, setCopiedOfferId] = useState<string | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const lastCopiedRef = useRef<{ id?: string; at: number } | null>(null);

  const resetOrderBumpForm = useCallback(() => {
    setOrderBumpForm(createEmptyOrderBumpForm());
    setEditingOrderBumpIndex(null);
  }, []);

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
    resetOrderBumpForm();
    setOfferType("preco_unico");
  }, [resetOrderBumpForm]);

  const openCreateOffer = useCallback(() => {
    resetOfferForm();
    setShowOfferModal(true);
  }, [resetOfferForm]);

  const openEditOffer = useCallback(
    (offer: ProductOffer) => {
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
    },
    [resetOfferForm]
  );

  const closeOfferModal = useCallback(() => {
    setShowOfferModal(false);
    resetOfferForm();
  }, [resetOfferForm]);

  const loadOffers = useCallback(async () => {
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
    void loadOffers();
  }, [loadOffers, refreshKey]);

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

  const handleSaveOrderBump = useCallback(() => {
    const baseOfferPrice =
      offerType === "preco_unico" ? parseBRLToNumber(offerPrice) : parseBRLToNumber(subscriptionPrice);
    if (baseOfferPrice === undefined || Number.isNaN(baseOfferPrice)) {
      toast.error("Valor da oferta não fornecido");
      return;
    }
    if (!orderBumpForm.product || !orderBumpForm.offer) {
      toast.error("Selecione produto e oferta para o Order Bump");
      return;
    }
    if (!orderBumpForm.title.trim()) {
      toast.error("Informe o título do order bump");
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
    setOrderBumps(prev =>
      editingOrderBumpIndex !== null
        ? prev.map((item, idx) => (idx === editingOrderBumpIndex ? next : item))
        : [...prev, next]
    );
    resetOrderBumpForm();
  }, [
    offerType,
    offerPrice,
    subscriptionPrice,
    orderBumpForm,
    editingOrderBumpIndex,
    resetOrderBumpForm,
  ]);

  const handleEditOrderBump = useCallback(
    (index: number) => {
      const item = orderBumps[index];
      if (!item) return;
      setEditingOrderBumpIndex(index);
      setOrderBumpForm({
        product: item.product ?? "",
        offer: item.offer ?? "",
        title: item.title ?? "",
        tag: item.tag ?? "",
        price: item.price !== undefined ? String(item.price) : "",
        description: item.description ?? "",
      });
    },
    [orderBumps]
  );

  const handleDeleteOrderBump = useCallback((index: number) => {
    setOrderBumps(prev => prev.filter((_, bumpIdx) => bumpIdx !== index));
  }, []);

  const handleCancelOrderBumpEdit = useCallback(() => {
    resetOrderBumpForm();
  }, [resetOrderBumpForm]);

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

  return {
    offers,
    loading,
    error,
    showOfferModal,
    editingOffer,
    offerName,
    offerPrice,
    offerBackRedirect,
    offerNextRedirect,
    offerStatus,
    offerFree,
    backRedirectEnabled,
    nextRedirectEnabled,
    firstChargePriceEnabled,
    fixedChargesEnabled,
    subscriptionFrequency,
    subscriptionTitle,
    subscriptionTag,
    subscriptionPrice,
    subscriptionPromoPrice,
    subscriptionFirstChargePrice,
    subscriptionChargesCount,
    subscriptionDefault,
    selectedCheckoutId,
    checkoutOptions,
    checkoutOptionsLoading,
    orderBumpEnabled,
    orderBumpOffers,
    orderBumpOffersLoading,
    orderBumpProducts,
    orderBumps,
    orderBumpForm,
    editingOrderBumpIndex,
    savingOffer,
    offerType,
    offerDeleteTarget,
    copiedOfferId,
    setOfferName,
    setOfferPrice,
    setOfferBackRedirect,
    setOfferNextRedirect,
    setOfferStatus,
    setOfferFree,
    setBackRedirectEnabled,
    setNextRedirectEnabled,
    setFirstChargePriceEnabled,
    setFixedChargesEnabled,
    setSubscriptionFrequency,
    setSubscriptionTitle,
    setSubscriptionTag,
    setSubscriptionPrice,
    setSubscriptionPromoPrice,
    setSubscriptionFirstChargePrice,
    setSubscriptionChargesCount,
    setSubscriptionDefault,
    setSelectedCheckoutId,
    setOrderBumpEnabled,
    setOrderBumps,
    setOrderBumpForm,
    setEditingOrderBumpIndex,
    setOfferType,
    setOfferDeleteTarget,
    openCreateOffer,
    openEditOffer,
    closeOfferModal,
    handleCopyAccess,
    handleSaveOrderBump,
    handleEditOrderBump,
    handleDeleteOrderBump,
    handleCancelOrderBumpEdit,
    handleCreateOffer,
  };
}
