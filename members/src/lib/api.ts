import { getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
// TODO: extract shared API/auth helpers with the public app once backends align.

type RequestOptions<T> = RequestInit & {
  baseUrl?: string;
  mock?: () => T;
};

export async function request<T>(
  path: string,
  options: RequestOptions<T> = {}
): Promise<T> {
  const { baseUrl, mock, ...rest } = options;
  const shouldMock = process.env.NEXT_PUBLIC_MEMBERS_MOCK === "1";

  if (shouldMock && mock) {
    return mock();
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl ?? API_BASE_URL}${normalizedPath}`;
  const headers = new Headers(rest.headers);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = rest.body !== undefined && rest.body !== null;
  const isFormData = typeof FormData !== "undefined" && rest.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...rest,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
