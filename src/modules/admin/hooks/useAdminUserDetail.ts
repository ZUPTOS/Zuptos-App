'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminUsersApi } from "../requests";
import type { AdminUser } from "../types";

const toText = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);

const toDateParts = (value?: string) => {
  if (!value) return { date: "-", time: "" };
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return { date: value, time: "" };
  const date = parsed.toLocaleDateString("pt-BR");
  const time = parsed.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return { date, time: `às ${time}` };
};

type DetailState = {
  name: string;
  document: string;
  razao: string;
  tipoConta: string;
  dataCriacao: string;
  horaCriacao: string;
};

export function useAdminUserDetail(userId?: string) {
  const { token } = useAuth();
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [rawUser, setRawUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!token || !userId) return;
    setIsLoading(true);
    try {
      const response = await adminUsersApi.getUserById(userId, token);
      const wrapper = response as unknown as { data?: AdminUser; user?: AdminUser };
      const userData = wrapper?.data ?? wrapper?.user ?? response;
      const record = userData as unknown as Record<string, unknown>;
      const name =
        userData.name ??
        toText(record.name) ??
        toText(record.full_name) ??
        toText(record.fullName) ??
        toText(record.username) ??
        "Usuário";
      const document =
        userData.document ??
        toText(record.document) ??
        toText(record.document_number) ??
        toText(record.cpf) ??
        toText(record.cnpj) ??
        "-";
      const razao =
        toText(record.razao) ??
        toText(record.razao_social) ??
        toText(record.corporate_name) ??
        "-";
      const tipoConta =
        toText(record.tipo_conta) ??
        toText(record.account_type) ??
        toText(record.accountType) ??
        "-";
      const created =
        toText(record.created_at) ??
        toText(record.createdAt) ??
        toText((userData as { created_at?: string }).created_at) ??
        toText((userData as { createdAt?: string }).createdAt);
      const { date, time } = toDateParts(created);
      setRawUser(userData);
      setDetail({
        name,
        document,
        razao,
        tipoConta: tipoConta,
        dataCriacao: date,
        horaCriacao: time,
      });
    } catch (err) {
      console.error("Erro ao carregar detalhes do usuário:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const data = useMemo(() => detail, [detail]);

  return { detail: data, rawUser, isLoading, reload: loadDetail };
}
