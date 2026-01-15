import type { ApiError } from "@/lib/api-types";
import { buildQuery, readStoredToken, request } from "@/lib/request";
import type {
  AdminProduct,
  AdminProductListParams,
  AdminProductListResponse,
  AdminProductSummary,
} from "../types";

const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? process.env.NEXT_PUBLIC_PUBLIC_API_URL ?? "";

const buildAuthHeaders = (token?: string) => {
  const authToken = token ?? readStoredToken();
  return authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
};

const requestWithFallback = async <T>(
  path: string,
  fallbackPath: string | null,
  init: RequestInit & { baseUrl?: string; silent?: boolean }
) => {
  try {
    return await request<T>(path, init);
  } catch (err) {
    const status = (err as ApiError | undefined)?.status;
    if (status === 404 && fallbackPath) {
      return request<T>(fallbackPath, init);
    }
    throw err;
  }
};

export const adminProductsApi = {
  listProducts: async (
    params: AdminProductListParams = {},
    token?: string
  ): Promise<AdminProductListResponse> => {
    const query = buildQuery({
      page: params.page,
      page_size: params.pageSize,
      category: params.category,
      start_date: params.startDate,
      end_date: params.endDate,
    });
    const init = {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    };
    return requestWithFallback<AdminProductListResponse>(
      `/admin/product${query}`,
      `/admin/admin/product${query}`,
      init
    );
  },

  getProductById: async (id: string, token?: string): Promise<AdminProduct> => {
    const init = {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    };
    return requestWithFallback<AdminProduct>(
      `/admin/product/${id}`,
      `/admin/admin/product/${id}`,
      init
    );
  },

  listProductsByUser: async (userId: string, token?: string): Promise<AdminProductListResponse> => {
    return request<AdminProductListResponse>(`/admin/product/user/${userId}`, {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    });
  },

  getSummary: async (token?: string): Promise<AdminProductSummary> => {
    return request<AdminProductSummary>("/admin/product/summary", {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    });
  },
};
