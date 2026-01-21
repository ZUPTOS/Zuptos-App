import type { CreateProductStrategyRequest, ProductStrategy } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const strategiesApi = {
  getProductStrategy: async (id: string, token?: string): Promise<ProductStrategy[]> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product strategy");
    }
    return request<ProductStrategy[]>(`/product/${id}/strategies`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  createProductStrategy: async (
    id: string,
    payload: CreateProductStrategyRequest,
    token?: string
  ): Promise<{ id: string; message?: string; status?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product strategy creation");
    }
    return request<{ id: string; message?: string; status?: string }>(`/product/${id}/strategies`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  updateProductStrategy: async (
    productId: string,
    strategyId: string,
    payload: CreateProductStrategyRequest,
    token?: string
  ): Promise<ProductStrategy> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product strategy update");
    }
    return request<ProductStrategy>(`/product/${productId}/strategies/${strategyId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  deleteProductStrategy: async (productId: string, strategyId: string, token?: string): Promise<void> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product strategy deletion");
    }
    await request(`/product/${productId}/strategies/${strategyId}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  },
};
