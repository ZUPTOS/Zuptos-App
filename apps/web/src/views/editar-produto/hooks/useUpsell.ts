'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { productApi } from "@/lib/api";
import type { CreateProductStrategyRequest, ProductOffer, ProductStrategy } from "@/lib/api";
import { readCache, writeCache } from "./tabCache";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function useUpsell({ productId, token, withLoading }: Params) {
  const strategiesCacheKey = productId ? `strategies:${productId}` : null;
  const offersCacheKey = productId ? `offers:${productId}` : null;
  const cachedStrategies = strategiesCacheKey ? readCache<ProductStrategy[]>(strategiesCacheKey) : undefined;
  const cachedOffers = offersCacheKey ? readCache<ProductOffer[]>(offersCacheKey) : undefined;
  const hasCachedStrategies = Array.isArray(cachedStrategies)
    ? cachedStrategies.length > 0
    : Boolean(cachedStrategies);
  const hasCachedOffers = Array.isArray(cachedOffers) ? cachedOffers.length > 0 : Boolean(cachedOffers);
  const [strategies, setStrategies] = useState<ProductStrategy[]>(cachedStrategies ?? []);
  const [strategiesLoading, setStrategiesLoading] = useState(!hasCachedStrategies);
  const [strategiesError, setStrategiesError] = useState<string | null>(null);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [savingStrategy, setSavingStrategy] = useState(false);
  const [offers, setOffers] = useState<ProductOffer[]>(cachedOffers ?? []);
  const [offersLoading, setOffersLoading] = useState(!hasCachedOffers);
  const [editingStrategy, setEditingStrategy] = useState<ProductStrategy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductStrategy | null>(null);
  const [deletingStrategy, setDeletingStrategy] = useState(false);
  const [copiedStrategyId, setCopiedStrategyId] = useState<string | null>(null);
  const lastCopiedRef = useRef<{ id?: string | null; at: number } | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);
  const [strategyForm, setStrategyForm] = useState({
    name: "",
    type: "",
    productId: "",
    acceptAction: "",
    acceptUrl: "",
    rejectAction: "",
    rejectUrl: "",
  });
  const strategiesLoadRef = useRef<Promise<void> | null>(null);
  const offersLoadRef = useRef<Promise<void> | null>(null);
  const strategiesLoadIdRef = useRef(0);
  const offersLoadIdRef = useRef(0);

  const resolveStrategyList = useCallback((raw: unknown): ProductStrategy[] => {
    if (Array.isArray(raw)) return raw;
    const data = (raw as { data?: ProductStrategy[] } | null)?.data;
    return Array.isArray(data) ? data : [];
  }, []);

  const toText = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

  const resolveOfferId = (item: ProductStrategy) => {
    const raw = item as unknown as Record<string, unknown>;
    return (
      item.offer ??
      toText(raw.offer_id) ??
      toText(raw.offerId) ??
      toText(raw.product_id) ??
      toText(raw.productId)
    );
  };

  const offerNameById = useCallback(
    (offerId?: string) => {
      if (!offerId) return undefined;
      const match = offers.find(offer => offer.id === offerId);
      return match?.name;
    },
    [offers]
  );

  const offerById = useCallback(
    (offerId?: string) => {
      if (!offerId) return undefined;
      return offers.find(offer => offer.id === offerId);
    },
    [offers]
  );

  const formatOfferPrice = useCallback((value?: number | string) => {
    if (value === undefined || value === null || value === "") return undefined;
    const numericValue = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(numericValue)) return undefined;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numericValue);
  }, []);

  const resetStrategyForm = useCallback(() => {
    setStrategyForm({
      name: "",
      type: "",
      productId: "",
      acceptAction: "",
      acceptUrl: "",
      rejectAction: "",
      rejectUrl: "",
    });
    setEditingStrategy(null);
  }, []);

  const openCreateStrategy = useCallback(() => {
    resetStrategyForm();
    setShowUpsellModal(true);
  }, [resetStrategyForm]);

  const openEditStrategy = useCallback(
    (strategy: ProductStrategy) => {
      resetStrategyForm();
      setEditingStrategy(strategy);
      setStrategyForm({
        name: strategy.name ?? "",
        type: strategy.type ?? "",
        productId: strategy.offer ?? "",
        acceptAction: strategy.action_successful_type ?? "",
        acceptUrl: strategy.action_successful_url ?? "",
        rejectAction: strategy.action_unsuccessful_type ?? "",
        rejectUrl: strategy.action_unsuccessful_url ?? "",
      });
      setShowUpsellModal(true);
    },
    [resetStrategyForm]
  );

  const closeUpsellModal = useCallback(() => {
    setShowUpsellModal(false);
    resetStrategyForm();
  }, [resetStrategyForm]);

  useEffect(() => {
    if (!strategiesCacheKey) return;
    const cached = readCache<ProductStrategy[]>(strategiesCacheKey);
    const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
    if (hasCache) {
      setStrategies(cached ?? []);
      setStrategiesLoading(false);
    }
  }, [strategiesCacheKey]);

  const loadStrategies = useCallback(
    async (force = false) => {
      if (!productId || !token) return;
      if (!force && strategiesLoadRef.current) return strategiesLoadRef.current;
      const requestId = ++strategiesLoadIdRef.current;
      const cached = strategiesCacheKey ? readCache<ProductStrategy[]>(strategiesCacheKey) : undefined;
      const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
      const shouldShowSkeleton = force || !hasCache;
      if (shouldShowSkeleton) {
        setStrategiesLoading(true);
      }
      setStrategiesError(null);
      const task = (async () => {
        try {
          const fetcher = () => productApi.getProductStrategy(productId, token);
          const data = hasCache ? await fetcher() : await withLoading(fetcher, "Carregando upsells");
          console.log("Estratégias data:", data);
          const normalized = resolveStrategyList(data);
          setStrategies(normalized);
          if (strategiesCacheKey) {
            writeCache(strategiesCacheKey, normalized);
          }
        } catch (error) {
          console.error("Erro ao carregar upsells:", error);
          setStrategiesError("Não foi possível carregar as estratégias agora.");
        } finally {
          if (requestId === strategiesLoadIdRef.current) {
            setStrategiesLoading(false);
          }
        }
      })();
      strategiesLoadRef.current = task;
      try {
        await task;
      } finally {
        if (strategiesLoadRef.current === task) {
          strategiesLoadRef.current = null;
        }
      }
      return task;
    },
    [productId, token, withLoading, strategiesCacheKey, resolveStrategyList]
  );

  useEffect(() => {
    void loadStrategies();
  }, [loadStrategies]);

  useEffect(() => {
    const loadOffers = async (force = false) => {
      if (!token || !productId) return;
      if (!force && offersLoadRef.current) return offersLoadRef.current;
      const requestId = ++offersLoadIdRef.current;
      const cached = offersCacheKey ? readCache<ProductOffer[]>(offersCacheKey) : undefined;
      const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
      const shouldShowSkeleton = force || !hasCache;
      if (shouldShowSkeleton) {
        setOffersLoading(true);
      }
      if (hasCache) {
        setOffers(cached ?? []);
      }
      const task = (async () => {
        try {
          const fetcher = () => productApi.getOffersByProductId(productId, token);
          const data = hasCache ? await fetcher() : await withLoading(fetcher, "Carregando ofertas");
          const normalized = Array.isArray(data) ? data : [];
          setOffers(normalized);
          if (offersCacheKey) {
            writeCache(offersCacheKey, normalized);
          }
        } catch (error) {
          console.error("Erro ao carregar ofertas para estratégia:", error);
          setOffers([]);
        } finally {
          if (requestId === offersLoadIdRef.current) {
            setOffersLoading(false);
          }
        }
      })();
      offersLoadRef.current = task;
      try {
        await task;
      } finally {
        if (offersLoadRef.current === task) {
          offersLoadRef.current = null;
        }
      }
      return task;
    };
    void loadOffers();
  }, [token, productId, withLoading, offersCacheKey]);

  const handleCopyScript = useCallback(async (scriptUrl?: string, strategyId?: string) => {
    if (!scriptUrl || scriptUrl === "-") return;
    const now = Date.now();
    const lastCopy = lastCopiedRef.current;
    if (lastCopy && lastCopy.id === strategyId && now - lastCopy.at < 1200) {
      return;
    }
    try {
      await navigator.clipboard?.writeText(scriptUrl);
      lastCopiedRef.current = { id: strategyId, at: now };
      setCopiedStrategyId(strategyId ?? null);
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedStrategyId(null);
      }, 500);
      console.log("[strategyApi] Link copiado:", scriptUrl);
    } catch (error) {
      console.error("Não foi possível copiar o link:", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCreateStrategy = useCallback(async () => {
    if (!productId || !token) return;
    if (!strategyForm.type || !strategyForm.productId) return;

    const payload: CreateProductStrategyRequest = {
      name: strategyForm.name.trim() || undefined,
      type: strategyForm.type,
      offer_id: strategyForm.productId,
      action_successful_type: strategyForm.acceptAction || "welcome",
      action_unsuccessful_type: strategyForm.rejectAction || "goodbye",
      action_successful_url: strategyForm.acceptUrl || undefined,
      action_unsuccessful_url: strategyForm.rejectUrl || undefined,
    };

    setSavingStrategy(true);
    try {
      if (editingStrategy?.id) {
        await withLoading(
          () => productApi.updateProductStrategy(productId, editingStrategy.id!, payload, token),
          "Atualizando estratégia"
        );
      } else {
        await withLoading(() => productApi.createProductStrategy(productId, payload, token), "Criando estratégia");
      }
      closeUpsellModal();
      await loadStrategies(true);
    } catch (error) {
      console.error("Erro ao salvar estratégia:", error);
    } finally {
      setSavingStrategy(false);
    }
  }, [productId, token, strategyForm, withLoading, loadStrategies, editingStrategy, closeUpsellModal]);

  const handleDeleteStrategy = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingStrategy(true);
    try {
      await productApi.deleteProductStrategy(productId, deleteTarget.id, token);
      setDeleteTarget(null);
      await loadStrategies(true);
    } catch (error) {
      console.error("Erro ao excluir estratégia:", error);
    } finally {
      setDeletingStrategy(false);
    }
  }, [productId, token, deleteTarget, loadStrategies]);

  return {
    strategies,
    strategiesLoading,
    strategiesError,
    showUpsellModal,
    savingStrategy,
    offers,
    offersLoading,
    editingStrategy,
    deleteTarget,
    deletingStrategy,
    copiedStrategyId,
    strategyForm,
    setStrategyForm,
    setShowUpsellModal,
    setDeleteTarget,
    openCreateStrategy,
    openEditStrategy,
    closeUpsellModal,
    handleCopyScript,
    handleCreateStrategy,
    handleDeleteStrategy,
    resolveOfferId,
    offerNameById,
    offerById,
    formatOfferPrice,
    toText,
  };
}
