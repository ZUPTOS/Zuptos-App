import type { ApiError } from "./api-types";

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/v1";
const DEFAULT_API_BASE = RAW_API_BASE.replace(/\/api\/?$/, "/v1");
export const API_BASE_URL = DEFAULT_API_BASE;

export const UNAUTHORIZED_EVENT = "zuptos:unauthorized";

export async function request<T>(
  path: string,
  init: RequestInit & { baseUrl?: string; silent?: boolean } = {}
): Promise<T> {
  const { baseUrl, silent, ...rest } = init;
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  const hasBody = rest.body !== undefined && rest.body !== null;
  const defaultHeaders = isFormData
    ? undefined
    : hasBody
      ? ({ "Content-Type": "application/json" } satisfies Record<string, string>)
      : undefined;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl ?? API_BASE_URL}${normalizedPath}`;
  const method = rest.method?.toUpperCase() ?? "GET";

  if (method === "GET") {
    // Log every GET request to help debug admin endpoints.
    console.log("[api] GET", { url, path: normalizedPath });
  }

  const headers = new Headers(defaultHeaders);
  if (rest.headers) {
    new Headers(rest.headers).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const res = await fetch(url, {
    ...rest,
    headers,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    // ignore parse errors
  }

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      try {
        window.dispatchEvent(
          new CustomEvent(UNAUTHORIZED_EVENT, {
            detail: {
              message: (data as { message?: string })?.message,
              path: normalizedPath,
              url,
              status: res.status,
            },
          })
        );
      } catch {
        // ignore
      }
    }

    if (!silent) {
      console.error("[api] Request failed", {
        path: normalizedPath,
        url,
        status: res.status,
        data,
      });
    }
    const err = new Error(
      (data as { error?: string; message?: string })?.error ||
        (data as { message?: string })?.message ||
        `Request failed: ${res.status}`
    ) as ApiError;
    err.status = res.status;
    err.response = res;
    (err as ApiError & { data?: unknown }).data = data;
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
