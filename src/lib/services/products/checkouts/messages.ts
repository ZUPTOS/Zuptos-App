import { API_BASE_URL, readStoredToken, request } from "../../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const messagesRequests = {
  createCheckoutMessage: async (
    productId: string,
    checkoutId: string,
    payload: Record<string, unknown>,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout message");

    const body = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    console.log("🔄 [productApi] Enviando criação de mensagem:", body);
    const response = await request(`/product/${productId}/checkouts/${checkoutId}/messages`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    console.log("✅ [productApi] Resposta criação de mensagem:", response);
    return response;
  },
  getCheckoutMessages: async (productId: string, checkoutId: string, token?: string): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout messages");

    try {
      return await request(`/product/${productId}/checkouts/${checkoutId}/messages`, {
        method: "GET",
        baseUrl: PRODUCTS_BASE,
        headers: { Authorization: `Bearer ${authToken}` },
        silent: true,
      });
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 404) return [];
      throw error;
    }
  },

  getCheckoutMessageById: async (
    productId: string,
    checkoutId: string,
    messageId: string,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout message");

    try {
      return await request(`/product/${productId}/checkouts/${checkoutId}/messages/${messageId}`, {
        method: "GET",
        baseUrl: PRODUCTS_BASE,
        headers: { Authorization: `Bearer ${authToken}` },
        silent: true,
      });
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 404) return null;
      throw error;
    }
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
