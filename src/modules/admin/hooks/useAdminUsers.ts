'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminUsersApi } from "../requests";
import type { AdminUser, AdminUsersListParams, AdminUsersSummary } from "../types";

const toText = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

const toNumber = (value: unknown) => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isNaN(numeric) ? undefined : numeric;
  }
  return undefined;
};

const formatCurrency = (value?: unknown) => {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "string" && value.includes("R$")) return value;
  const numeric = typeof value === "number" ? value : toNumber(value);
  if (numeric === undefined) return "-";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numeric);
};

const formatPercent = (value?: unknown) => {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "string" && value.includes("%")) return value;
  const numeric = typeof value === "number" ? value : toNumber(value);
  if (numeric === undefined) return "-";
  return `${numeric}%`;
};

const normalizeStatusLabel = (raw?: string) => {
  if (!raw) return "Pendente";
  const normalized = raw.toLowerCase();
  if (["approved", "aprovado", "active", "ativo"].includes(normalized)) return "Aprovado";
  if (["pending", "pendente", "in_progress", "em_analise"].includes(normalized)) return "Pendente";
  if (["rejected", "reprovado", "blocked"].includes(normalized)) return "Reprovado";
  if (["suspended", "suspenso"].includes(normalized)) return "Suspenso";
  if (["inactive", "inativo"].includes(normalized)) return "Suspenso";
  return raw;
};

const resolveList = (raw: unknown): AdminUser[] => {
  if (Array.isArray(raw)) return raw as AdminUser[];
  const data = raw as {
    data?: AdminUser[] | { users?: AdminUser[]; data?: AdminUser[]; results?: AdminUser[] };
    users?: AdminUser[];
    results?: AdminUser[];
  } | null;
  if (Array.isArray(data?.data)) return data?.data ?? [];
  const nested = data?.data as { users?: AdminUser[]; data?: AdminUser[]; results?: AdminUser[] } | undefined;
  return nested?.users ?? nested?.data ?? nested?.results ?? data?.users ?? data?.results ?? [];
};

const mapUser = (raw: AdminUser): AdminUser & { totalLabel: string; taxLabel: string; statusLabel: string } => {
  const record = raw as unknown as Record<string, unknown>;
  const id =
    toText(raw.id) ??
    toText(record.user_id) ??
    toText(record.userId) ??
    toText(record.id) ??
    `user-${Math.random()}`;
  const name =
    raw.name ??
    toText(record.name) ??
    toText(record.full_name) ??
    toText(record.fullName) ??
    toText(record.username) ??
    "Usuário";
  const email = raw.email ?? toText(record.email) ?? "-";
  const document =
    raw.document ??
    toText(record.document) ??
    toText(record.document_number) ??
    toText(record.cpf) ??
    toText(record.cnpj) ??
    "-";
  const rawStatus =
    raw.status ??
    toText(record.status) ??
    toText(record.kyc_status) ??
    toText(record.kycStatus) ??
    toText(record.account_status) ??
    toText(record.accountStatus);
  const total =
    raw.total ??
    record.total ??
    record.total_invoiced ??
    record.totalInvoiced ??
    record.totalSold ??
    record.amount;
  const tax = raw.tax ?? record.tax ?? record.fee ?? record.fee_percent ?? record.feePercent;

  return {
    ...raw,
    id,
    name,
    email,
    document,
    status: rawStatus ?? raw.status,
    totalLabel: formatCurrency(total),
    taxLabel: formatPercent(tax),
    statusLabel: normalizeStatusLabel(rawStatus),
  };
};

const normalizeSummary = (raw: unknown): AdminUsersSummary => {
  const record = raw as Record<string, unknown> | null;
  if (!record) return {};
  const nested = record.data as Record<string, unknown> | undefined;
  const source = nested ?? record;
  return {
    total: toNumber(source.total ?? source.total_users ?? source.totalUsers),
    active: toNumber(source.active ?? source.active_users ?? source.activeUsers),
    pending: toNumber(source.pending ?? source.pending_users ?? source.pendingUsers),
    suspended: toNumber(source.suspended ?? source.suspended_users ?? source.suspendedUsers),
    inactive: toNumber(source.inactive ?? source.inactive_users ?? source.inactiveUsers),
  };
};

type AdminUserRow = ReturnType<typeof mapUser>;

type Params = {
  pageSize?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export function useAdminUsers({ pageSize = 50, status, startDate, endDate }: Params = {}) {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [summary, setSummary] = useState<AdminUsersSummary>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(
    async (overrides: AdminUsersListParams = {}) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await adminUsersApi.listUsers(
          {
            page: overrides.page ?? 1,
            pageSize: overrides.pageSize ?? pageSize,
            startDate: overrides.startDate ?? startDate,
            endDate: overrides.endDate ?? endDate,
            status: overrides.status ?? status,
          },
          token
        );
        const normalized = resolveList(response).map(mapUser);
        setUsers(normalized);
      } catch (err) {
        console.error("Erro ao carregar usuários admin:", err);
        setError("Não foi possível carregar os usuários agora.");
      } finally {
        setIsLoading(false);
      }
    },
    [token, pageSize, startDate, endDate, status]
  );

  const loadSummary = useCallback(async () => {
    if (!token) return;
    setIsSummaryLoading(true);
    try {
      const response = await adminUsersApi.getSummary(token);
      setSummary(normalizeSummary(response));
    } catch (err) {
      console.error("Erro ao carregar resumo de usuários:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const data = useMemo(() => users, [users]);

  return {
    users: data,
    summary,
    isLoading,
    isSummaryLoading,
    error,
    refreshUsers: loadUsers,
    refreshSummary: loadSummary,
  };
}

export type { AdminUserRow };
