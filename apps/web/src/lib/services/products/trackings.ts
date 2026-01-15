import type { CreateProductTrackingRequest, ProductPlan } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const trackingsApi = {
  getPlansByProductId: async (productId: string, token?: string): Promise<ProductPlan[]> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product trackings");
    }
    return request<ProductPlan[]>(`/product/${productId}/trackings`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  createPlan: async (
    productId: string,
    payload: CreateProductTrackingRequest,
    token?: string
  ): Promise<ProductPlan> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product trackings");
    }
    return request<ProductPlan>(`/product/${productId}/trackings`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  updateTracking: async (
    productId: string,
    trackingId: string,
    payload: CreateProductTrackingRequest,
    token?: string
  ): Promise<ProductPlan> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product trackings");
    }
    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    return request<ProductPlan>(`/product/${productId}/trackings/${trackingId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
  },

  deleteTracking: async (
    productId: string,
    trackingId: string,
    token?: string
  ): Promise<{ id?: string; status?: string; message?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product trackings");
    }
    return request<{ id?: string; status?: string; message?: string }>(
      `/product/${productId}/trackings/${trackingId}`,
      {
        method: "DELETE",
        baseUrl: PRODUCTS_BASE,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      }
    );
  },
};
