import { API_BASE_URL, readStoredToken, request } from "../../../request";

const PRODUCTS_BASE = API_BASE_URL;

type DepoimentPayload = {
  image?: string;
  name?: string;
  depoiment?: string;
  active?: boolean;
  ratting?: string | number;
};

export const depoimentsRequests = {
  createCheckoutDepoiment: async (
    productId: string,
    checkoutId: string,
    payload: DepoimentPayload & { name: string; depoiment: string },
    token?: string
  ): Promise<{ id?: string; status?: string; message?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout depoiments");

    console.log("🔄 [productApi] Enviando criação de depoimento:", payload);
    const response = await request<{ id?: string; status?: string; message?: string }>(
      `/product/${productId}/checkouts/${checkoutId}/depoiments`,
      {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
      }
    );
    console.log("✅ [productApi] Resposta criação de depoimento:", response);
    return response;
  },

  getCheckoutDepoiments: async (productId: string, checkoutId: string, token?: string): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout depoiments");

    return request(`/product/${productId}/checkouts/${checkoutId}/depoiments`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  getCheckoutDepoiment: async (
    productId: string,
    checkoutId: string,
    depoimentId: string,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout depoiment");

    return request(`/product/${productId}/checkouts/${checkoutId}/depoiments/${depoimentId}`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  updateCheckoutDepoiment: async (
    productId: string,
    checkoutId: string,
    depoimentId: string,
    payload: DepoimentPayload,
    token?: string
  ): Promise<{ id?: string; status?: string; message?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout depoiment");

    const body = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    console.log("🔄 [productApi] Enviando atualização de depoimento:", body);
    const response = await request<{ id?: string; status?: string; message?: string }>(
      `/product/${productId}/checkouts/${checkoutId}/depoiments/${depoimentId}`,
      {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
      }
    );
    console.log("✅ [productApi] Resposta atualização de depoimento:", response);
    return response;
  },

  deleteCheckoutDepoiment: async (
    productId: string,
    checkoutId: string,
    depoimentId: string,
    token?: string
  ): Promise<void> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout depoiment");

    await request(`/product/${productId}/checkouts/${checkoutId}/depoiments/${depoimentId}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  uploadCheckoutDepoimentImage: async (
    productId: string,
    checkoutId: string,
    depoimentId: string,
    file: File | Blob,
    token?: string
  ): Promise<unknown> => {
    if (!productId || !checkoutId || !depoimentId) {
      throw new Error("Missing ids for depoiment upload");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for depoiment upload");

    const formData = new FormData();
    formData.append("file", file);

    console.log("🔄 [productApi] Enviando upload de depoimento:", {
      depoimentId,
      name: file instanceof File ? file.name : "blob",
      size: file.size,
    });

    const response = await request(
      `/product/${productId}/checkouts/${checkoutId}/depoiments/${depoimentId}/upload`,
      {
        method: "POST",
        baseUrl: PRODUCTS_BASE,
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      }
    );

    console.log("✅ [productApi] Resposta upload de depoimento:", response);
    return response;
  },
};
