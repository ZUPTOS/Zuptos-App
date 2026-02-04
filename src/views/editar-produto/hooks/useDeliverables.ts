'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { productApi } from "@/lib/api";
import type { ProductDeliverable } from "@/lib/api";
import { notify } from "@/shared/ui/notification-toast";
import { notifyApiError } from "@/lib/notify-error";
import { readCache, writeCache } from "./tabCache";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

const normalizeDeliverables = (data: unknown): ProductDeliverable[] => {
  if (Array.isArray(data)) return data;
  const list = (data as { data?: ProductDeliverable[] } | null)?.data;
  return Array.isArray(list) ? list : [];
};

export function useDeliverables({ productId, token, withLoading }: Params) {
  const cacheKey = productId ? `deliverables:${productId}` : null;
  const cachedDeliverables = cacheKey ? readCache<ProductDeliverable[]>(cacheKey) : undefined;
  const hasCachedDeliverables = Array.isArray(cachedDeliverables)
    ? cachedDeliverables.length > 0
    : Boolean(cachedDeliverables);
  const [deliverables, setDeliverables] = useState<ProductDeliverable[]>(cachedDeliverables ?? []);
  const [loading, setLoading] = useState(!hasCachedDeliverables);
  const [error, setError] = useState<string | null>(null);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [deliverableTab, setDeliverableTab] = useState<"arquivo" | "link">("arquivo");
  const [deliverableName, setDeliverableName] = useState("");
  const [deliverableContent, setDeliverableContent] = useState("");
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableFormError, setDeliverableFormError] = useState<string | null>(null);
  const [savingDeliverable, setSavingDeliverable] = useState(false);
  const [editingDeliverable, setEditingDeliverable] = useState<ProductDeliverable | null>(null);
  const [loadingDeliverable, setLoadingDeliverable] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductDeliverable | null>(null);
  const [deletingDeliverable, setDeletingDeliverable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loadRef = useRef<Promise<void> | null>(null);
  const loadIdRef = useRef(0);

  const isEditing = Boolean(editingDeliverable);

  useEffect(() => {
    if (!cacheKey) return;
    const cached = readCache<ProductDeliverable[]>(cacheKey);
    const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
    if (hasCache) {
      setDeliverables(cached ?? []);
      setLoading(false);
    }
  }, [cacheKey]);

  const loadDeliverables = useCallback(
    async (force = false) => {
    if (!productId || !token) return;
    if (!force && loadRef.current) return loadRef.current;
    const requestId = ++loadIdRef.current;
    const cached = cacheKey ? readCache<ProductDeliverable[]>(cacheKey) : undefined;
    const hasCache = Array.isArray(cached) ? cached.length > 0 : Boolean(cached);
    const shouldShowSkeleton = force || !hasCache;
    if (shouldShowSkeleton) {
      setLoading(true);
    }
    setError(null);
      const task = (async () => {
        try {
          const fetcher = () => productApi.getDeliverablesByProductId(productId, token);
          const data = hasCache ? await fetcher() : await withLoading(fetcher, "Carregando entregáveis");
          console.log("Entregáveis carregados:", data);
          const normalized = normalizeDeliverables(data);
          setDeliverables(normalized);
          if (cacheKey) {
            writeCache(cacheKey, normalized);
          }
        } catch (err) {
          console.error("Erro ao carregar entregáveis:", err);
          setError("Não foi possível carregar os entregáveis agora.");
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
    },
    [productId, token, withLoading, cacheKey]
  );

  useEffect(() => {
    void loadDeliverables();
  }, [loadDeliverables]);

  const resetDeliverableForm = useCallback(() => {
    setDeliverableName("");
    setDeliverableContent("");
    setDeliverableFile(null);
    setDeliverableFormError(null);
    setDeliverableTab("arquivo");
    setEditingDeliverable(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const openCreateDeliverable = useCallback(() => {
    resetDeliverableForm();
    setShowDeliverableModal(true);
  }, [resetDeliverableForm]);

  const openEditDeliverable = useCallback(
    async (deliverableId: string) => {
      if (!productId || !token) return;
      setLoadingDeliverable(true);
      setDeliverableFormError(null);
      try {
        const data = await withLoading(
          () => productApi.getDeliverableById(productId, deliverableId, token),
          "Carregando entregável"
        );
        console.log("Entregável carregado:", data);
        setEditingDeliverable(data);
        setDeliverableTab((data.type ?? "file").toLowerCase() === "link" ? "link" : "arquivo");
        setDeliverableName("");
        setDeliverableContent("");
        setDeliverableFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setShowDeliverableModal(true);
      } catch (err) {
        console.error("Erro ao carregar entregável:", err);
        setDeliverableFormError("Não foi possível carregar o entregável selecionado.");
      } finally {
        setLoadingDeliverable(false);
      }
    },
    [productId, token, withLoading]
  );

  const closeDeliverableModal = useCallback(() => {
    setShowDeliverableModal(false);
    resetDeliverableForm();
  }, [resetDeliverableForm]);

  const handleCreateDeliverable = useCallback(async () => {
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
      if (deliverableTab === "arquivo" && deliverableFile) {
        try {
          await productApi.uploadDeliverableFile(productId, response.id, deliverableFile, token);
        } catch (uploadError) {
          console.error("Erro ao enviar arquivo do entregável:", uploadError);
        }
      }
      notify.success("Entregável criado");
      await loadDeliverables(true);
      closeDeliverableModal();
    } catch (err) {
      console.error("Erro ao criar entregável:", err);
      setDeliverableFormError("Não foi possível salvar o entregável.");
      notifyApiError(err, { title: "Não foi possível criar o entregável" });
    } finally {
      setSavingDeliverable(false);
    }
  }, [
    productId,
    token,
    deliverableName,
    deliverableContent,
    deliverableFile,
    deliverableTab,
    loadDeliverables,
    closeDeliverableModal,
  ]);

  const handleUpdateDeliverable = useCallback(async () => {
    if (!productId || !token || !editingDeliverable) return;
    const trimmedName = deliverableName.trim();
    const trimmedContent = deliverableContent.trim();
    const nextType = deliverableTab === "link" ? "link" : "file";
    const currentType = (editingDeliverable.type ?? "").toLowerCase();

    if (nextType === "link" && !trimmedContent && !editingDeliverable.content) {
      setDeliverableFormError("Preencha o link do entregável.");
      return;
    }

    if (nextType === "file" && !deliverableFile && currentType !== "file") {
      setDeliverableFormError("Selecione um arquivo para enviar.");
      return;
    }

    const payload = {
      name: trimmedName || editingDeliverable.name || "Entregável",
      type: nextType,
      status: editingDeliverable.status ?? "active",
      content: trimmedContent || editingDeliverable.content || undefined,
      size: deliverableFile?.size ?? editingDeliverable.size,
    };

    setSavingDeliverable(true);
    setDeliverableFormError(null);
    try {
      console.log("[productApi] Enviando atualização de entregável:", payload);
      const response = await productApi.updateDeliverable(
        productId,
        editingDeliverable.id,
        payload,
        token
      );
      console.log("[productApi] Resposta do servidor (entregável):", response);
      if (deliverableTab === "arquivo" && deliverableFile) {
        try {
          await productApi.uploadDeliverableFile(productId, editingDeliverable.id, deliverableFile, token);
        } catch (uploadError) {
          console.error("Erro ao enviar arquivo do entregável:", uploadError);
        }
      }
      notify.success("Entregável atualizado");
      await loadDeliverables(true);
      closeDeliverableModal();
    } catch (err) {
      console.error("Erro ao atualizar entregável:", err);
      setDeliverableFormError("Não foi possível atualizar o entregável.");
      notifyApiError(err, { title: "Não foi possível atualizar o entregável" });
    } finally {
      setSavingDeliverable(false);
    }
  }, [
    productId,
    token,
    editingDeliverable,
    deliverableName,
    deliverableContent,
    deliverableFile,
    deliverableTab,
    loadDeliverables,
    closeDeliverableModal,
  ]);

  const handleDeleteDeliverable = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingDeliverable(true);
    try {
      await productApi.deleteDeliverable(productId, deleteTarget.id, token);
      notify.success("Entregável deletado");
      await loadDeliverables(true);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erro ao excluir entregável:", err);
      notifyApiError(err, { title: "Não foi possível excluir o entregável" });
    } finally {
      setDeletingDeliverable(false);
    }
  }, [productId, token, deleteTarget, loadDeliverables]);

  return {
    deliverables,
    loading,
    error,
    showDeliverableModal,
    deliverableTab,
    deliverableName,
    deliverableContent,
    deliverableFile,
    deliverableFormError,
    savingDeliverable,
    editingDeliverable,
    loadingDeliverable,
    deleteTarget,
    deletingDeliverable,
    fileInputRef,
    isEditing,
    setDeliverableTab,
    setDeliverableName,
    setDeliverableContent,
    setDeliverableFile,
    setShowDeliverableModal,
    setDeleteTarget,
    openCreateDeliverable,
    openEditDeliverable,
    closeDeliverableModal,
    handleCreateDeliverable,
    handleUpdateDeliverable,
    handleDeleteDeliverable,
  };
}
