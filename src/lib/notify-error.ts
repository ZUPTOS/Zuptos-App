'use client';

import { notify } from "@/shared/ui/notification-toast";
import type { ApiError } from "@/lib/api-types";

type ErrorMessage = {
  title: string;
  description?: string;
};

const STATUS_MESSAGES: Record<number, ErrorMessage> = {
  400: { title: "Requisição inválida", description: "Verifique os dados enviados e tente novamente." },
  401: { title: "Sessão expirada", description: "Faça login novamente para continuar." },
  403: { title: "Acesso negado", description: "Você não tem permissão para realizar esta ação." },
  404: { title: "Não encontrado", description: "O recurso solicitado não foi encontrado." },
  409: { title: "Conflito de dados", description: "Já existe um registro com essas informações." },
  422: { title: "Dados inválidos", description: "Revise os campos obrigatórios antes de enviar." },
  429: { title: "Muitas requisições", description: "Aguarde alguns instantes e tente novamente." },
  500: { title: "Erro no servidor", description: "Tente novamente em instantes." },
};

const resolveErrorMessage = (
  error: unknown,
  fallback: ErrorMessage = { title: "Não foi possível concluir a ação" }
): ErrorMessage => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return { title: fallback.title, description: error };
  }

  if (error instanceof Error) {
    return { title: fallback.title, description: error.message || fallback.description };
  }

  const apiError = error as ApiError & { data?: unknown };
  const status = apiError.status ?? (apiError as { status?: number })?.status;
  const data = apiError.data as { message?: string; error?: string } | undefined;
  const statusMessage = status ? STATUS_MESSAGES[status] : undefined;

  return {
    title: statusMessage?.title ?? fallback.title,
    description:
      data?.message ||
      data?.error ||
      statusMessage?.description ||
      fallback.description,
  };
};

export const notifyApiError = (error: unknown, fallback?: ErrorMessage) => {
  const message = resolveErrorMessage(error, fallback);
  notify.error(message.title, message.description);
};

export const toErrorMessage = (error: unknown, fallback = "Ocorreu um erro inesperado.") => {
  const message = resolveErrorMessage(error, { title: fallback });
  return message.description ?? message.title;
};

