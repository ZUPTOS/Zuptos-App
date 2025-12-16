import type { CreateSaleRequest, Sale, SaleListResponse } from "../api-types";
import { API_BASE_URL, buildQuery, readStoredToken, readStoredUserId, request } from "../request";

const SALES_BASE = API_BASE_URL;

export const salesApi = {
  listSales: async (token?: string): Promise<SaleListResponse> =>
    request<SaleListResponse>("/sale", {
      method: "GET",
      baseUrl: SALES_BASE,
      headers: (token ?? readStoredToken()) ? { Authorization: `Bearer ${token ?? readStoredToken()}` } : undefined,
    }),

  getSaleById: async (id: string, token?: string): Promise<{ user_id: string; sale: Sale }> =>
    request<{ user_id: string; sale: Sale }>(`/sale/${id}`, {
      method: "GET",
      baseUrl: SALES_BASE,
      headers: (token ?? readStoredToken()) ? { Authorization: `Bearer ${token ?? readStoredToken()}` } : undefined,
    }),

  createSale: async (payload: Partial<CreateSaleRequest>, token?: string): Promise<{ sale_id: string; status: string }> => {
    const user_id = payload.user_id ?? readStoredUserId();
    if (!user_id) {
      throw new Error("Missing user_id for sale creation");
    }
    if (!payload.product_id) {
      throw new Error("Missing product_id for sale creation");
    }
    if (payload.amount === undefined || payload.amount === null) {
      throw new Error("Missing amount for sale creation");
    }
    if (!payload.payment_method) {
      throw new Error("Missing payment_method for sale creation");
    }

    const body: CreateSaleRequest = {
      product_id: payload.product_id,
      user_id,
      amount: payload.amount,
      payment_method: payload.payment_method,
      sale_type: payload.sale_type ?? "PRODUCTOR",
    };

    const auth = token ?? readStoredToken();
    return request<{ sale_id: string; status: string }>("/sale", {
      method: "POST",
      baseUrl: SALES_BASE,
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      body: JSON.stringify(body),
    });
  },
};
