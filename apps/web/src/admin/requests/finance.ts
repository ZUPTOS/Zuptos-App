import type { ApiError } from "@/lib/api-types";
import { buildQuery, readStoredToken, request } from "@/lib/request";
import type {
  AdminFinanceSummary,
  AdminFinanceRecord,
  AdminFinanceListParams,
  AdminFinanceListResponse,
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

export const adminFinanceApi = {
  /**
   * Get finance summary for admin dashboard
   */
  getSummary: async (
    params?: { startDate?: string; endDate?: string },
    token?: string
  ): Promise<AdminFinanceSummary> => {
    const query = buildQuery({
      start_date: params?.startDate,
      end_date: params?.endDate,
    });
    const init = {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    };
    return requestWithFallback<AdminFinanceSummary>(
      `/admin/finance/summary${query}`,
      `/admin/admin/finance/summary${query}`,
      init
    );
  },

  /**
   * Get specific finance record by ID
   */
  getFinanceById: async (id: string, token?: string): Promise<AdminFinanceRecord> => {
    const init = {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    };
    return requestWithFallback<AdminFinanceRecord>(
      `/admin/finance/${id}`,
      `/admin/admin/finance/${id}`,
      init
    );
  },

  /**
   * Get all finance records for a specific user
   */
  listFinancesByUser: async (
    userId: string,
    params?: Omit<AdminFinanceListParams, 'userId'>,
    token?: string
  ): Promise<AdminFinanceListResponse> => {
    const query = buildQuery({
      page: params?.page,
      page_size: params?.limit,
      start_date: params?.startDate,
      end_date: params?.endDate,
      type: params?.type,
      status: params?.status,
    });
    return request<AdminFinanceListResponse>(`/admin/finance/user/${userId}${query}`, {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    });
  },

  /**
   * List all finance records with pagination and filters
   */
  listFinances: async (
    params: AdminFinanceListParams = {},
    token?: string
  ): Promise<AdminFinanceListResponse> => {
    const query = buildQuery({
      page: params.page,
      page_size: params.limit,
      user_id: params.userId,
      start_date: params.startDate,
      end_date: params.endDate,
      type: params.type,
      status: params.status,
    });
    const init = {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    };
    return requestWithFallback<AdminFinanceListResponse>(
      `/admin/finance${query}`,
      `/admin/admin/finance${query}`,
      init
    );
  },
};
