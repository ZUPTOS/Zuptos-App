'use client';

import { useCallback, useEffect, useState } from "react";
import { productApi } from "@/lib/api";
import type { Coproducer, CreateCoproducerRequest } from "@/lib/api";

type Params = {
  productId?: string;
  token?: string;
  withLoading: <T>(task: () => Promise<T>, label?: string) => Promise<T>;
};

const emptyCoproducerForm = {
  name: "",
  email: "",
  commission: "",
  durationMonths: "",
  lifetime: false,
  shareSalesDetails: false,
  extendProductStrategies: false,
  splitInvoice: false,
};

export function useCoproducers({ productId, token, withLoading }: Params) {
  const [coproducers, setCoproducers] = useState<Coproducer[]>([]);
  const [coproducersLoading, setCoproducersLoading] = useState(false);
  const [coproducersError, setCoproducersError] = useState<string | null>(null);
  const [selectedCoproducer, setSelectedCoproducer] = useState<Coproducer | null>(null);
  const [showCoproductionModal, setShowCoproductionModal] = useState(false);
  const [showCoproductionDetailModal, setShowCoproductionDetailModal] = useState(false);
  const [coproducerSaving, setCoproducerSaving] = useState(false);
  const [coproducerFormError, setCoproducerFormError] = useState<string | null>(null);
  const [editingCoproducer, setEditingCoproducer] = useState<Coproducer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coproducer | null>(null);
  const [deletingCoproducer, setDeletingCoproducer] = useState(false);
  const [coproducerForm, setCoproducerForm] = useState({ ...emptyCoproducerForm });

  const normalizeCoproducers = useCallback((raw: unknown): Coproducer[] => {
    if (Array.isArray(raw)) return raw;
    const data = (raw as { data?: Coproducer[] } | null)?.data;
    return Array.isArray(data) ? data : [];
  }, []);

  const loadCoproducers = useCallback(async () => {
    if (!productId || !token) return;
    setCoproducersLoading(true);
    setCoproducersError(null);
    try {
      const data = await withLoading(
        () => productApi.getCoproducersByProductId(productId, token),
        "Carregando coprodutores"
      );
      setCoproducers(normalizeCoproducers(data));
    } catch (error) {
      console.error("Erro ao carregar coprodutores:", error);
      setCoproducersError("Não foi possível carregar os coprodutores agora.");
    } finally {
      setCoproducersLoading(false);
    }
  }, [productId, token, withLoading, normalizeCoproducers]);

  useEffect(() => {
    void loadCoproducers();
  }, [loadCoproducers]);

  const resetCoproducerForm = useCallback(() => {
    setCoproducerForm({ ...emptyCoproducerForm });
    setEditingCoproducer(null);
    setCoproducerFormError(null);
  }, []);

  const openCreateCoproducer = useCallback(() => {
    resetCoproducerForm();
    setShowCoproductionModal(true);
  }, [resetCoproducerForm]);

  const closeCoproductionModal = useCallback(() => {
    setShowCoproductionModal(false);
    resetCoproducerForm();
  }, [resetCoproducerForm]);

  const openEditCoproducer = useCallback(
    (coproducer: Coproducer) => {
      const durationMonths = coproducer.duration_months ?? 0;
      const isLifetime = durationMonths === 0;
      const commissionValue =
        coproducer.revenue_share_percentage ??
        coproducer.commission_percentage ??
        (typeof coproducer.commission === "number"
          ? coproducer.commission
          : Number(coproducer.commission));
      setCoproducerForm({
        name: coproducer.name ?? "",
        email: coproducer.email ?? "",
        commission: Number.isNaN(commissionValue) ? "" : String(commissionValue),
        durationMonths: isLifetime ? "" : String(durationMonths),
        lifetime: isLifetime,
        shareSalesDetails: Boolean(coproducer.share_sales_details),
        extendProductStrategies: Boolean(coproducer.extend_product_strategies),
        splitInvoice: Boolean(coproducer.split_invoice),
      });
      setEditingCoproducer(coproducer);
      setShowCoproductionModal(true);
    },
    []
  );

  const handleSaveCoproducer = useCallback(async () => {
    if (!productId || !token) return;
    setCoproducerFormError(null);

    const commissionValue = Number(coproducerForm.commission);
    if (Number.isNaN(commissionValue)) {
      setCoproducerFormError("Informe uma comissão válida.");
      return;
    }

    const payload: CreateCoproducerRequest = {
      name: coproducerForm.name.trim(),
      email: coproducerForm.email.trim(),
      duration_months: coproducerForm.lifetime ? 0 : Number(coproducerForm.durationMonths || 0),
      revenue_share_percentage: commissionValue,
      share_sales_details: Boolean(coproducerForm.shareSalesDetails),
      extend_product_strategies: Boolean(coproducerForm.extendProductStrategies),
      split_invoice: Boolean(coproducerForm.splitInvoice),
    };

    setCoproducerSaving(true);
    try {
      if (editingCoproducer?.id) {
        console.log("[coproducer] Enviando atualização:", payload);
        const response = await withLoading(
          () => productApi.updateCoproducer(productId, editingCoproducer.id!, payload, token),
          "Atualizando coprodutor"
        );
        console.log("[coproducer] Resposta atualização:", response);
      } else {
        console.log("[coproducer] Enviando criação:", payload);
        const response = await withLoading(
          () => productApi.createCoproducer(productId, payload, token),
          "Criando coprodutor"
        );
        console.log("[coproducer] Resposta do servidor:", response);
      }
      const refreshed = await productApi.getCoproducersByProductId(productId, token);
      setCoproducers(normalizeCoproducers(refreshed));
      resetCoproducerForm();
      setShowCoproductionModal(false);
    } catch (error) {
      console.error("Erro ao salvar coprodutor:", error);
      setCoproducerFormError("Não foi possível salvar o coprodutor.");
    } finally {
      setCoproducerSaving(false);
    }
  }, [productId, token, coproducerForm, withLoading, editingCoproducer, normalizeCoproducers, resetCoproducerForm]);

  const handleDeleteCoproducer = useCallback(async () => {
    if (!productId || !token || !deleteTarget?.id) return;
    setDeletingCoproducer(true);
    try {
      await withLoading(
        () => productApi.deleteCoproducer(productId, deleteTarget.id!, token),
        "Excluindo coprodutor"
      );
      setDeleteTarget(null);
      const refreshed = await productApi.getCoproducersByProductId(productId, token);
      setCoproducers(normalizeCoproducers(refreshed));
    } catch (error) {
      console.error("Erro ao excluir coprodutor:", error);
      setCoproducerFormError("Não foi possível excluir o coprodutor.");
    } finally {
      setDeletingCoproducer(false);
    }
  }, [productId, token, deleteTarget, withLoading, normalizeCoproducers]);

  const openDetailModal = useCallback((coproducer: Coproducer) => {
    setSelectedCoproducer(coproducer);
    setShowCoproductionDetailModal(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedCoproducer(null);
    setShowCoproductionDetailModal(false);
  }, []);

  return {
    coproducers,
    coproducersLoading,
    coproducersError,
    selectedCoproducer,
    showCoproductionModal,
    showCoproductionDetailModal,
    coproducerSaving,
    coproducerFormError,
    editingCoproducer,
    deleteTarget,
    deletingCoproducer,
    coproducerForm,
    setCoproducerForm,
    setDeleteTarget,
    setShowCoproductionModal,
    openCreateCoproducer,
    closeCoproductionModal,
    openEditCoproducer,
    handleSaveCoproducer,
    handleDeleteCoproducer,
    openDetailModal,
    closeDetailModal,
  };
}
