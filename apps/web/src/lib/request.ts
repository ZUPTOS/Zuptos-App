import type { ApiError } from "./api-types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://86.48.22.80:3000/v1";

export async function request<T>(
  path: string,
  init: RequestInit & { baseUrl?: string } = {}
): Promise<T> {
  const { baseUrl, ...rest } = init;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl ?? API_BASE_URL}${normalizedPath}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers ?? {}),
    },
    ...rest,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    console.error("[api] Request failed", {
      path: normalizedPath,
      url,
      status: res.status,
      data,
    });
    const err = new Error(
      (data as { error?: string; message?: string })?.error ||
        (data as { message?: string })?.message ||
        `Request failed: ${res.status}`
    ) as ApiError;
    err.status = res.status;
    err.response = res;
    throw err;
  }

  return data as T;
}

export const readStoredUserId = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = localStorage.getItem("authUser");
    if (!stored) return undefined;
    const parsed = JSON.parse(stored) as { id?: string };
    return parsed.id;
  } catch {
    return undefined;
  }
};

export const readStoredToken = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    return localStorage.getItem("authToken") ?? undefined;
  } catch {
    return undefined;
  }
};

export const buildQuery = (params: Record<string, string | number | undefined>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  const qs = new URLSearchParams(entries as [string, string][]);
  return qs.toString() ? `?${qs.toString()}` : "";
};
