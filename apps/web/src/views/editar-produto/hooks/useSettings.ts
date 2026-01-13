'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { productApi } from "@/lib/api";
import type { Product, ProductSettings, UpdateProductSettingsRequest } from "@/lib/api";
import { notify } from "@/components/ui/notification-toast";
import { readCache, writeCache } from "./tabCache";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function useSettings({ productId, token, withLoading }: Params) {
  const productCacheKey = productId ? `product:${productId}` : null;
  const settingsCacheKey = productId ? `settings:${productId}` : null;
  const cachedProduct = productCacheKey ? readCache<Product>(productCacheKey) : undefined;
  const cachedSettings = settingsCacheKey ? readCache<ProductSettings>(settingsCacheKey) : undefined;
  const [product, setProduct] = useState<Product | null>(cachedProduct ?? null);
  const [settings, setSettings] = useState<ProductSettings | null>(cachedSettings ?? null);
  const [loading, setLoading] = useState(!cachedSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [formValues, setFormValues] = useState({
    support_email: "",
    phone_support: "",
    language: "",
    currency: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
  });
  const loadRef = useRef<Promise<void> | null>(null);
  const loadIdRef = useRef(0);
  const [statusDraft, setStatusDraft] = useState<"active" | "inactive">(
    cachedSettings?.status === "inactive" ? "inactive" : "active"
  );

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId || !token) return;
      const cached = productCacheKey ? readCache<Product>(productCacheKey) : undefined;
      if (cached) {
        setProduct(cached);
      }
      try {
        const fetcher = () => productApi.getProductById(productId, token);
        const data = cached ? await fetcher() : await withLoading(fetcher, "Carregando produto");
        setProduct(data);
        if (productCacheKey && data) {
          writeCache(productCacheKey, data);
        }
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
      }
    };
    void loadProduct();
  }, [productId, token, withLoading, productCacheKey]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!productId || !token) return;
      if (loadRef.current) return loadRef.current;
      const cached = settingsCacheKey ? readCache<ProductSettings>(settingsCacheKey) : undefined;
      if (cached) {
        setSettings(cached);
        if (cached.status) {
          setStatusDraft(cached.status === "inactive" ? "inactive" : "active");
        }
        setLoading(false);
      }
      const requestId = ++loadIdRef.current;
      const shouldShowSkeleton = !cached;
      if (shouldShowSkeleton) {
        setLoading(true);
      }
      setError(null);
      const task = (async () => {
        try {
          const fetcher = () => productApi.getProductSettings(productId, token);
          const data = cached ? await fetcher() : await withLoading(fetcher, "Carregando configurações");
          setSettings(data);
          console.log("Configurações carregadas:", data);
          if (data?.status) {
            setStatusDraft(data.status === "inactive" ? "inactive" : "active");
          }
          if (settingsCacheKey && data) {
            writeCache(settingsCacheKey, data);
          }
        } catch (err) {
          console.error("Erro ao carregar configurações:", err);
          setError("Não foi possível carregar as configurações agora.");
        } finally {
          if (requestId === loadIdRef.current) {
            setLoading(false);
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
    };
    void loadSettings();
  }, [productId, token, withLoading, settingsCacheKey]);

  const handleSave = useCallback(async () => {
    if (!productId || !token) return;
    setSaving(true);
    setError(null);
    try {
      const payload: UpdateProductSettingsRequest = {};
      const supportEmail = formValues.support_email.trim();
      const phoneSupport = formValues.phone_support.trim();
      const language = formValues.language.trim();
      const currency = formValues.currency.trim();
      const nextName = productForm.name.trim();
      const nextDescription = productForm.description.trim();

      if (supportEmail && supportEmail !== settings?.support_email) {
        payload.support_email = supportEmail;
      }
      if (phoneSupport && phoneSupport !== settings?.phone_support) {
        payload.phone_support = phoneSupport;
      }
      if (language && language !== settings?.language) {
        payload.language = language;
      }
      if (currency && currency !== settings?.currency) {
        payload.currency = currency;
      }
      if (statusDraft && statusDraft !== settings?.status) {
        payload.status = statusDraft;
      }

      if (nextName || nextDescription) {
        payload.product = {
          id: productId,
          name: nextName || product?.name,
          description: nextDescription || product?.description,
        };
      }

      if (Object.keys(payload).length === 0) {
        setSaving(false);
        return;
      }

      const updatedSettings = await withLoading(
        () => productApi.updateProductSettings(productId, payload, token),
        "Salvando configurações"
      );
      let nextSettings = updatedSettings ?? settings;
      let nextProduct = product;

      try {
        const [freshSettings, freshProduct] = await Promise.all([
          productApi.getProductSettings(productId, token),
          productApi.getProductById(productId, token),
        ]);
        nextSettings = freshSettings ?? nextSettings;
        nextProduct = freshProduct ?? nextProduct;
        if (settingsCacheKey && freshSettings) {
          writeCache(settingsCacheKey, freshSettings);
        }
        if (productCacheKey && freshProduct) {
          writeCache(productCacheKey, freshProduct);
        }
      } catch (refreshError) {
        console.warn("Falha ao atualizar dados após salvar configurações:", refreshError);
      }

      if (nextSettings) {
        setSettings(nextSettings);
      }
      if (nextProduct) {
        setProduct(nextProduct);
      }
      setFormValues({
        support_email: "",
        phone_support: "",
        language: "",
        currency: "",
      });
      setProductForm({ name: "", description: "" });
      console.log("Configurações salvas com sucesso!", { payload });
    } catch (err) {
      console.error("Erro ao salvar configurações:", err);
      setError("Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  }, [productId, token, formValues, productForm, statusDraft, settings, product, withLoading]);

  const handleDeactivateProduct = useCallback(async () => {
    if (!productId || !token) return;
    setSaving(true);
    setError(null);
    const payload = { status: "inactive" };
    try {
      console.log("[settings] Enviando atualização de status:", payload);
      const response = await withLoading(
        () => productApi.updateProductSettings(productId, payload, token),
        "Desativando produto"
      );
      console.log("[settings] Resposta desativação:", response);
      setStatusDraft("inactive");
      notify.success("Produto desativado");
    } catch (err) {
      console.error("Erro ao desativar produto:", err);
      setError("Não foi possível desativar o produto.");
    } finally {
      setSaving(false);
    }
  }, [productId, token, withLoading]);

  return {
    product,
    settings,
    loading,
    saving,
    error,
    showRecoveryModal,
    formValues,
    productForm,
    statusDraft,
    setShowRecoveryModal,
    setFormValues,
    setProductForm,
    setStatusDraft,
    handleSave,
    handleDeactivateProduct,
  };
}
