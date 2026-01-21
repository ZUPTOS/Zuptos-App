import type { Checkout, CheckoutPayload } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const checkoutsApi = {
  createCheckout: async (
    id: string,
    payload: CheckoutPayload,
    token?: string
  ): Promise<CheckoutPayload> => {
    if (!id) {
      throw new Error("Missing product id for checkout creation");
    }
    if (!payload?.name) {
      throw new Error("Missing checkout name");
    }

    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for checkout creation");
    }

    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
    );

    console.log("🔄 [productApi] Enviando criação de checkout:", body);
    const response = await request<CheckoutPayload>(`/product/${id}/checkouts`, {
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
    if (!authToken) {
      throw new Error("Missing authentication token for checkout update");
    }
    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
    );
    return request<Checkout>(`/product/${productId}/checkouts/${checkoutId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
  },

  getCheckoutsByProductId: async (id: string, token?: string): Promise<Checkout[]> => {
    const authToken = token ?? readStoredToken();
    return request<Checkout[]>(`/product/${id}/checkouts`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  getCheckoutById: async (productId: string, checkoutId: string, token?: string): Promise<Checkout> => {
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
    if (!authToken) {
      throw new Error("Missing authentication token for checkout deletion");
    }
    await request(`/product/${productId}/checkouts/${checkoutId}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  },

  createCheckoutDepoiment: async (
    productId: string,
    checkoutId: string,
    payload: {
      image?: string;
      name: string;
      depoiment: string;
      active?: boolean;
      ratting?: string | number;
    },
    token?: string
  ): Promise<{ id?: string; status?: string; message?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for checkout depoiments");
    }
    return request(`/product/${productId}/checkouts/${checkoutId}/depoiments`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  getCheckoutDepoiments: async (
    productId: string,
    checkoutId: string,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for checkout depoiments");
    }
    return request(`/product/${productId}/checkouts/${checkoutId}/depoiments`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  },

  getCheckoutDepoiment: async (
    productId: string,
    checkoutId: string,
    depoimentId: string,
    token?: string
  ): Promise<{ id?: string; status?: string; message?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for checkout depoiment");
    }
    return request(`/product/${productId}/checkout/${checkoutId}/depoiments/${depoimentId}`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  },

  updateCheckoutDepoiment: async (
    productId: string,
    checkoutId: string,
    depoimentId: string,
    payload: {
      image?: string;
      name?: string;
      depoiment?: string;
      active?: boolean;
      ratting?: string | number;
    },
    token?: string
  ): Promise<{ id?: string; status?: string; message?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for checkout depoiment");
    }
    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    return request(`/product/${productId}/checkouts/${checkoutId}/depoiments/${depoimentId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
  },

  deleteCheckoutDepoiment: async (
    productId: string,
    checkoutId: string,
    depoimentId: string,
    token?: string
  ): Promise<void> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for checkout depoiment");
    }
    await request(`/product/${productId}/checkouts/${checkoutId}/depoiments/${depoimentId}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  },
};
