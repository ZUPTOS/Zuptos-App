'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminProductsApi } from "../requests";
import type { AdminProduct } from "../types";
import type { ProductStatusLabel } from "./useAdminProducts";

const toText = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

const normalizeStatusLabel = (raw?: string): ProductStatusLabel => {
  if (!raw) return "Pendente";
  const normalized = raw.toLowerCase();
  if (["approved", "aprovado", "active", "ativo"].some(key => normalized.includes(key))) return "Aprovado";
  if (["pending", "pendente", "in_progress"].some(key => normalized.includes(key))) return "Pendente";
  if (["rejected", "reprovado", "blocked"].some(key => normalized.includes(key))) return "Reprovado";
  if (["update", "updating", "atualizacao", "em_atualizacao"].some(key => normalized.includes(key))) {
    return "Em atualização";
  }
  if (["production", "produ", "em_producao"].some(key => normalized.includes(key))) return "Em produção";
  if (["inactive", "inativo"].some(key => normalized.includes(key))) return "Inativo";
  return "Pendente";
};

type DetailState = {
  id: string;
  name: string;
  producer: string;
  producerEmail: string;
  status: ProductStatusLabel;
  description: string;
  salesPage: string;
};

export function useAdminProductDetail(productId?: string) {
  const { token } = useAuth();
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [rawProduct, setRawProduct] = useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!token || !productId) return;
    setIsLoading(true);
    try {
      const response = await adminProductsApi.getProductById(productId, token);
      const wrapper = response as unknown as { data?: AdminProduct; product?: AdminProduct };
      const productData = wrapper?.data ?? wrapper?.product ?? response;
      const record = productData as unknown as Record<string, unknown>;
      const owner =
        (record.user as Record<string, unknown> | undefined) ??
        (record.producer as Record<string, unknown> | undefined) ??
        (record.owner as Record<string, unknown> | undefined) ??
        (record.creator as Record<string, unknown> | undefined);
      const id =
        toText(productData.id) ??
        toText(record.product_id) ??
        toText(record.productId) ??
        productId;
      const name =
        productData.name ??
        toText(record.name) ??
        toText(record.title) ??
        "Produto";
      const producer =
        productData.user?.name ??
        productData.producer?.name ??
        toText(owner?.name) ??
        toText(owner?.full_name) ??
        toText(owner?.fullName) ??
        toText(record.user_name) ??
        "-";
      const producerEmail =
        productData.user?.email ??
        productData.producer?.email ??
        toText(owner?.email) ??
        toText(record.email) ??
        toText(record.user_email) ??
        "-";
      const status = normalizeStatusLabel(
        productData.status ??
          toText(record.status) ??
          toText(record.product_status) ??
          toText(record.productStatus)
      );
      const description =
        productData.description ??
        toText(record.description) ??
        toText(record.short_description) ??
        "-";
      const salesPage =
        productData.sale_url ??
        productData.saleUrl ??
        toText(record.sale_url) ??
        toText(record.saleUrl) ??
        toText(record.sales_page) ??
        toText(record.salesPage) ??
        "-";

      setRawProduct(productData);
      setDetail({
        id,
        name,
        producer,
        producerEmail,
        status,
        description,
        salesPage,
      });
    } catch (err) {
      console.error("Erro ao carregar detalhes do produto:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, productId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const data = useMemo(() => detail, [detail]);

  return { detail: data, rawProduct, isLoading, reload: loadDetail };
}
