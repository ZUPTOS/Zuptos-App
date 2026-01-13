'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { productApi, ProviderTrackingName, TrackingStatus, TrackingType } from "@/lib/api";
import type { CreateProductTrackingRequest, ProductPlan } from "@/lib/api";
import { readCache, writeCache } from "./tabCache";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

const defaultEvents = {
  add_to_cart: true,
  initiate_checkout: true,
  add_payment_info: true,
  purchase: true,
};

export function usePixels({ productId, token, withLoading }: Params) {
  const cacheKey = productId ? `trackings:${productId}` : null;
  const cachedTrackings = cacheKey ? readCache<ProductPlan[]>(cacheKey) : undefined;
  const hasCachedTrackings = Array.isArray(cachedTrackings) ? cachedTrackings.length > 0 : Boolean(cachedTrackings);
  const [trackings, setTrackings] = useState<ProductPlan[]>(cachedTrackings ?? []);
  const [trackingsLoading, setTrackingsLoading] = useState(!hasCachedTrackings);
  const [trackingsError, setTrackingsError] = useState<string | null>(null);
  const [showPixelModal, setShowPixelModal] = useState(false);
  const [pixelsRefreshKey, setPixelsRefreshKey] = useState(0);
  const [trackingSaving, setTrackingSaving] = useState(false);
  const [editingTracking, setEditingTracking] = useState<ProductPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductPlan | null>(null);
  const [deletingTracking, setDeletingTracking] = useState(false);
  const [trackingStep, setTrackingStep] = useState<"platform" | "form">("platform");
  const [trackingPlatform, setTrackingPlatform] = useState<ProviderTrackingName | null>(null);

  const [trackingType, setTrackingType] = useState<TrackingType>(TrackingType.DEFAULT);
  const [trackingName, setTrackingName] = useState("");
  const [trackingPixelId, setTrackingPixelId] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>(TrackingStatus.ACTIVE);
  const [trackingEvents, setTrackingEvents] = useState(defaultEvents);
  const loadRef = useRef<Promise<void> | null>(null);
  const loadIdRef = useRef(0);

  const resolvePlatform = useCallback((pixel: ProductPlan): ProviderTrackingName | null => {
    const raw = (pixel.provider_tracking_name ?? pixel.platform ?? "").toString().toLowerCase();
    if (!raw) return null;
    if (raw.includes("google")) return ProviderTrackingName.GOOGLE;
    if (raw.includes("face")) return ProviderTrackingName.FACEBOOK;
    if (raw.includes("tiktok")) return ProviderTrackingName.TIKTOK;
    return null;
  }, []);

  const resetForm = useCallback(() => {
    setTrackingStep("platform");
    setTrackingPlatform(null);
    setTrackingType(TrackingType.DEFAULT);
    setTrackingName("");
    setTrackingPixelId("");
    setTrackingToken("");
    setTrackingStatus(TrackingStatus.ACTIVE);
    setTrackingEvents(defaultEvents);
    setEditingTracking(null);
  }, []);

  const handleOpenModal = useCallback(() => {
    resetForm();
    setShowPixelModal(true);
  }, [resetForm]);

  const handleCloseModal = useCallback(() => {
    setShowPixelModal(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (!cacheKey) return;
    const cached = readCache<ProductPlan[]>(cacheKey);
    const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
    if (hasCache) {
      setTrackings(cached ?? []);
      setTrackingsLoading(false);
    }
  }, [cacheKey]);

  const loadTrackings = useCallback(
    async (force = false) => {
      if (!productId || !token) return;
      if (!force && loadRef.current) return loadRef.current;
      const requestId = ++loadIdRef.current;
      const cached = cacheKey ? readCache<ProductPlan[]>(cacheKey) : undefined;
      const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
      const shouldShowSkeleton = force || !hasCache;
      if (shouldShowSkeleton) {
        setTrackingsLoading(true);
      }
      setTrackingsError(null);
      const task = (async () => {
        try {
          const fetcher = () => productApi.getPlansByProductId(productId, token);
          const data = hasCache ? await fetcher() : await withLoading(fetcher, "Carregando pixels");
          setTrackings(data);
          console.log("data", data);
          if (cacheKey) {
            writeCache(cacheKey, data);
          }
        } catch (error) {
          console.error("Erro ao carregar pixels:", error);
          setTrackingsError("Não foi possível carregar os pixels agora.");
        } finally {
          if (requestId === loadIdRef.current) {
            setTrackingsLoading(false);
          }
        }
      })();
      loadRef.current = task;
      try {
        await task;
      } finally {
        if (loadRef.current === task) {
          loadRef.current = null;
        }
      }
      return task;
    },
    [productId, token, withLoading, cacheKey]
  );

  useEffect(() => {
    void loadTrackings(pixelsRefreshKey > 0);
  }, [loadTrackings, pixelsRefreshKey]);

  const handleSaveTracking = useCallback(async () => {
    if (!productId || !token) return;
    if (!trackingPlatform) return;
    if (!trackingName.trim() || !trackingPixelId.trim()) return;
    if (trackingType === TrackingType.API && !trackingToken.trim()) return;

    const payload: CreateProductTrackingRequest = {
      name: trackingName.trim(),
      type: trackingType,
      status: trackingStatus,
      provider_tracking_name: trackingPlatform,
      provider_tracking_id: trackingPixelId.trim(),
      token_api_connection: trackingType === TrackingType.API ? trackingToken.trim() : undefined,
      add_to_cart: trackingEvents.add_to_cart,
      initiate_checkout: trackingEvents.initiate_checkout,
      add_payment_info: trackingEvents.add_payment_info,
      purchase: trackingEvents.purchase,
    };

    setTrackingSaving(true);
    try {
      if (editingTracking?.id) {
        await withLoading(
          () => productApi.updateTracking(productId, editingTracking.id, payload, token),
          "Atualizando pixel"
        );
      } else {
        await withLoading(() => productApi.createPlan(productId, payload, token), "Criando pixel");
      }
      setPixelsRefreshKey(prev => prev + 1);
      resetForm();
      setShowPixelModal(false);
    } catch (error) {
      console.error("Erro ao salvar pixel:", error);
    } finally {
      setTrackingSaving(false);
    }
  }, [
    productId,
    token,
    trackingPlatform,
    editingTracking,
    trackingName,
    trackingPixelId,
    trackingType,
    trackingToken,
    trackingStatus,
    trackingEvents,
    withLoading,
    resetForm,
  ]);

  const openEditTracking = useCallback(
    (tracking: ProductPlan) => {
      const platform = resolvePlatform(tracking) ?? ProviderTrackingName.GOOGLE;
      setTrackingPlatform(platform);
      setTrackingStep("form");
      setTrackingType(
        (tracking.type ?? "").toString().toLowerCase() === TrackingType.API
          ? TrackingType.API
          : TrackingType.DEFAULT
      );
      setTrackingStatus(
        (tracking.status ?? "").toString().toLowerCase() === TrackingStatus.INACTIVE
          ? TrackingStatus.INACTIVE
          : TrackingStatus.ACTIVE
      );
      setTrackingName(tracking.name ?? "");
      setTrackingPixelId(tracking.provider_tracking_id ?? tracking.pixel_id ?? "");
      setTrackingToken(tracking.token_api_connection ?? "");
      setTrackingEvents({
        add_to_cart: tracking.add_to_cart ?? defaultEvents.add_to_cart,
        initiate_checkout: tracking.initiate_checkout ?? defaultEvents.initiate_checkout,
        add_payment_info: tracking.add_payment_info ?? defaultEvents.add_payment_info,
        purchase: tracking.purchase ?? defaultEvents.purchase,
      });
      setEditingTracking(tracking);
      setShowPixelModal(true);
    },
    [resolvePlatform]
  );

  const handleDeleteTracking = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingTracking(true);
    try {
      await withLoading(
        () => productApi.deleteTracking(productId, deleteTarget.id, token),
        "Excluindo pixel"
      );
      setDeleteTarget(null);
      setPixelsRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Erro ao excluir pixel:", error);
    } finally {
      setDeletingTracking(false);
    }
  }, [productId, token, deleteTarget, withLoading]);

  return {
    trackings,
    trackingsLoading,
    trackingsError,
    showPixelModal,
    trackingSaving,
    editingTracking,
    deleteTarget,
    deletingTracking,
    trackingStep,
    trackingPlatform,
    trackingType,
    trackingName,
    trackingPixelId,
    trackingToken,
    trackingStatus,
    trackingEvents,
    resolvePlatform,
    setTrackingStep,
    setTrackingPlatform,
    setTrackingType,
    setTrackingName,
    setTrackingPixelId,
    setTrackingToken,
    setTrackingStatus,
    setTrackingEvents,
    setDeleteTarget,
    handleOpenModal,
    handleCloseModal,
    handleSaveTracking,
    openEditTracking,
    handleDeleteTracking,
  };
}
