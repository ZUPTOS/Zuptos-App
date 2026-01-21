import type { ProductSettings, UpdateProductSettingsRequest } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const settingsApi = {
  getProductSettings: async (id: string, token?: string): Promise<ProductSettings> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product settings");
    }
    return request<ProductSettings>(`/product/${id}/settings`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  updateProductSettings: async (
    id: string,
    payload: UpdateProductSettingsRequest,
    token?: string
  ): Promise<ProductSettings> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product settings update");
    }
    try {
      return await request<ProductSettings>(`/product/${id}/settings`, {
        method: "PATCH",
        baseUrl: PRODUCTS_BASE,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
    } catch {
      return request<ProductSettings>(`/product/${id}/settings`, {
        method: "PATCH",
        baseUrl: PRODUCTS_BASE,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
        silent: true,
      });
    }
  },
};
