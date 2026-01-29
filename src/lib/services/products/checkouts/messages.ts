import { API_BASE_URL, readStoredToken, request } from "../../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const messagesRequests = {
  getCheckoutMessages: async (productId: string, checkoutId: string, token?: string): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout messages");

    return request(`/product/${productId}/checkouts/${checkoutId}/messages`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  getCheckoutMessageById: async (
    productId: string,
    checkoutId: string,
    messageId: string,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout message");

    return request(`/product/${productId}/checkouts/${checkoutId}/messages/${messageId}`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  updateCheckoutMessage: async (
    productId: string,
    checkoutId: string,
    messageId: string,
    payload: Record<string, unknown>,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout message");

    const body = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    console.log("🔄 [productApi] Enviando atualização de mensagens:", body);
    const response = await request(`/product/${productId}/checkouts/${checkoutId}/messages/${messageId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    console.log("✅ [productApi] Resposta atualização de mensagens:", response);
    return response;
  },
};
