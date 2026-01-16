'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminProductsApi } from "../requests";
import type { AdminProduct, AdminProductListParams, AdminProductSummary } from "../types";

type ProductStatusLabel =
  | "Aprovado"
  | "Em produção"
  | "Reprovado"
  | "Pendente"
  | "Em atualização"
  | "Inativo";

const toText = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

const toNumber = (value: unknown) => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isNaN(numeric) ? undefined : numeric;
  }
  return undefined;
};

const normalizeTypeLabel = (raw?: string) => {
  if (!raw) return "Produto";
  const normalized = raw.toLowerCase();
  if (["course", "curso"].some(key => normalized.includes(key))) return "Curso";
  if (["book", "ebook", "e-book", "livro"].some(key => normalized.includes(key))) return "E-book";
  if (["service", "servico", "serviço"].some(key => normalized.includes(key))) return "Serviço";
  return raw;
};

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

const resolveList = (raw: unknown): AdminProduct[] => {
  if (Array.isArray(raw)) return raw as AdminProduct[];
  const record = raw as {
    data?: AdminProduct[] | { products?: AdminProduct[]; data?: AdminProduct[]; results?: AdminProduct[] };
    products?: AdminProduct[];
    results?: AdminProduct[];
  } | null;
  if (Array.isArray(record?.data)) return record?.data ?? [];
  const nested = record?.data as { products?: AdminProduct[]; data?: AdminProduct[]; results?: AdminProduct[] } | undefined;
  return nested?.products ?? nested?.data ?? nested?.results ?? record?.products ?? record?.results ?? [];
};

const mapProduct = (raw: AdminProduct) => {
  const record = raw as unknown as Record<string, unknown>;
  const owner =
    (record.user as Record<string, unknown> | undefined) ??
    (record.producer as Record<string, unknown> | undefined) ??
    (record.owner as Record<string, unknown> | undefined) ??
    (record.creator as Record<string, unknown> | undefined);
  const id =
    toText(raw.id) ??
    toText(record.product_id) ??
    toText(record.productId) ??
    `product-${Math.random()}`;
  const name = raw.name ?? toText(record.name) ?? toText(record.title) ?? "Produto";
  const typeLabel = normalizeTypeLabel(
    raw.type ?? toText(record.type) ?? toText(record.product_type) ?? toText(record.productType)
  );
  const statusLabel = normalizeStatusLabel(
    raw.status ?? toText(record.status) ?? toText(record.product_status) ?? toText(record.productStatus)
  );
  const produtor =
    raw.user?.name ??
    raw.producer?.name ??
    toText(owner?.name) ??
    toText(owner?.full_name) ??
    toText(owner?.fullName) ??
    toText(record.user_name) ??
    toText(record.userName) ??
    "-";
  const email =
    raw.user?.email ??
    raw.producer?.email ??
    toText(owner?.email) ??
    toText(record.email) ??
    toText(record.user_email) ??
    toText(record.userEmail) ??
    "-";
  const telefone =
    raw.user?.phone ??
    raw.producer?.phone ??
    toText(owner?.phone) ??
    toText(owner?.phone_number) ??
    toText(record.phone) ??
    toText(record.user_phone) ??
    "-";
  const suporte =
    raw.support_email ??
    raw.supportEmail ??
    raw.support_phone ??
    raw.supportPhone ??
    toText(record.support_email) ??
    toText(record.supportEmail) ??
    toText(record.support_phone) ??
    toText(record.supportPhone) ??
    "-";

  return {
    id,
    name,
    typeLabel,
    statusLabel,
    produtor,
    email,
    telefone,
    suporte,
    raw,
  };
};

const normalizeSummary = (raw: unknown): AdminProductSummary => {
  const record = raw as Record<string, unknown> | null;
  if (!record) return {};
  const nested = record.data as Record<string, unknown> | undefined;
  const source = nested ?? record;
  return {
    total: toNumber(source.total ?? source.total_products ?? source.totalProducts),
    total_revenue: toNumber(source.total_revenue ?? source.totalRevenue),
    totalRevenue: toNumber(source.totalRevenue ?? source.total_revenue),
    user_id: source.user_id,
  };
};

type AdminProductRow = ReturnType<typeof mapProduct>;

type Params = {
  pageSize?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
};

export function useAdminProducts({ pageSize = 50, category, startDate, endDate }: Params = {}) {
  const { token } = useAuth();
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [summary, setSummary] = useState<AdminProductSummary>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(
    async (overrides: AdminProductListParams = {}) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await adminProductsApi.listProducts(
          {
            page: overrides.page ?? 1,
            pageSize: overrides.pageSize ?? pageSize,
            category: overrides.category ?? category,
            startDate: overrides.startDate ?? startDate,
            endDate: overrides.endDate ?? endDate,
          },
          token
        );
        const normalized = resolveList(response).map(mapProduct);
        setProducts(normalized);
      } catch (err) {
        console.error("Erro ao carregar produtos admin:", err);
        setError("Não foi possível carregar os produtos agora.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, pageSize, category, startDate, endDate]
  );

  const loadSummary = useCallback(async () => {
    if (!token) return;
    setIsSummaryLoading(true);
    try {
      const response = await adminProductsApi.getSummary(token);
      setSummary(normalizeSummary(response));
    } catch (err) {
      console.error("Erro ao carregar resumo de produtos:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const data = useMemo(() => products, [products]);

  return {
    products: data,
    summary,
    isLoading,
    isSummaryLoading,
    error,
    refreshProducts: loadProducts,
    refreshSummary: loadSummary,
  };
}

export type { AdminProductRow, ProductStatusLabel };
