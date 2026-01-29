import type { Checkout, CheckoutPayload } from "../../../api-types";
import { API_BASE_URL, buildQuery, readStoredToken, request } from "../../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const checkoutRequests = {
  createCheckout: async (
    productId: string,
    payload: CheckoutPayload,
    token?: string
  ): Promise<CheckoutPayload> => {
    if (!productId) throw new Error("Missing product id for checkout creation");
    if (!payload?.name) throw new Error("Missing checkout name");

    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout creation");

    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
    );

    console.log("🔄 [productApi] Enviando criação de checkout:", body);
    const response = await request<CheckoutPayload>(`/product/${productId}/checkouts`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    console.log("✅ [productApi] Resposta criação de checkout:", response);
    return response;
  },

  updateCheckout: async (
    productId: string,
    checkoutId: string,
    payload: CheckoutPayload,
    token?: string
  ): Promise<Checkout> => {
    if (!productId || !checkoutId) {
      throw new Error("Missing product or checkout id for checkout update");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout update");

    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
    );
    console.log("🔄 [productApi] Enviando atualização de checkout:", body);
    const response = await request<Checkout>(`/product/${productId}/checkouts/${checkoutId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    console.log("✅ [productApi] Resposta atualização de checkout:", response);
    return response;
  },

  getCheckoutsByProductId: async (productId: string, token?: string): Promise<Checkout[]> => {
    const authToken = token ?? readStoredToken();
    return request<Checkout[]>(`/product/${productId}/checkouts`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  getCheckoutById: async (
    productId: string,
    checkoutId: string,
    token?: string
  ): Promise<Checkout> => {
    const authToken = token ?? readStoredToken();
    return request<Checkout>(`/product/${productId}/checkouts/${checkoutId}`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  deleteCheckout: async (productId: string, checkoutId: string, token?: string): Promise<void> => {
    if (!productId || !checkoutId) {
      throw new Error("Missing product or checkout id for checkout deletion");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout deletion");

    await request(`/product/${productId}/checkouts/${checkoutId}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  uploadCheckoutAsset: async (
    productId: string,
    checkoutId: string,
    type: "logo" | "banner",
    file: File | Blob,
    token?: string
  ): Promise<unknown> => {
    if (!productId || !checkoutId) throw new Error("Missing product or checkout id for checkout upload");
    if (!type) throw new Error("Missing upload type for checkout");

    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout upload");

    const formData = new FormData();
    formData.append("file", file);
    const query = buildQuery({ type });

    console.log("🔄 [productApi] Enviando upload de checkout:", {
      type,
      name: file instanceof File ? file.name : "blob",
      size: file.size,
    });

    const response = await request(`/product/${productId}/checkouts/${checkoutId}/upload${query}`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });
    console.log("✅ [productApi] Resposta upload de checkout:", response);
    return response;
  },
};
