'use client';

import { useCallback, useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import type { Product, ProductSettings, UpdateProductSettingsRequest } from "@/lib/api";
import { notify } from "@/components/ui/notification-toast";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

export function useSettings({ productId, token, withLoading }: Params) {
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<ProductSettings | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [statusDraft, setStatusDraft] = useState<"active" | "inactive">("active");

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId || !token) return;
      try {
        const data = await withLoading(
          () => productApi.getProductById(productId, token),
          "Carregando produto"
        );
        setProduct(data);
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
      }
    };
    void loadProduct();
  }, [productId, token, withLoading]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!productId || !token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await withLoading(
          () => productApi.getProductSettings(productId, token),
          "Carregando configurações"
        );
        setSettings(data);
        console.log("Configurações carregadas:", data);
        if (data?.status) {
          setStatusDraft(data.status === "inactive" ? "inactive" : "active");
        }
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
        setError("Não foi possível carregar as configurações agora.");
      } finally {
        setLoading(false);
      }
    };
    void loadSettings();
  }, [productId, token, withLoading]);

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
