import { buildQuery, readStoredToken, request } from "@/lib/request";
import type { AdminUser, AdminUsersListParams, AdminUsersListResponse, AdminUsersSummary } from "../types";

const ADMIN_BASE = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? process.env.NEXT_PUBLIC_PUBLIC_API_URL ?? "";

const buildAuthHeaders = (token?: string) => {
  const authToken = token ?? readStoredToken();
  return authToken ? { Authorization: `Bearer ${authToken}` } : undefined;
};

export const adminUsersApi = {
  listUsers: async (
    params: AdminUsersListParams = {},
    token?: string
  ): Promise<AdminUsersListResponse> => {
    const query = buildQuery({
      page: params.page,
      pageSize: params.pageSize,
      startDate: params.startDate,
      endDate: params.endDate,
      status: params.status,
    });
    return request<AdminUsersListResponse>(`/admin/users${query}`, {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    });
  },

  getUserById: async (id: string, token?: string): Promise<AdminUser> => {
    return request<AdminUser>(`/admin/users/${id}`, {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    });
  },

  getSummary: async (token?: string): Promise<AdminUsersSummary> => {
    return request<AdminUsersSummary>("/admin/users/summary", {
      method: "GET",
      baseUrl: ADMIN_BASE,
      headers: buildAuthHeaders(token),
    });
  },
};
