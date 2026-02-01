import { API_BASE_URL, readStoredToken, request } from "../../../request";

const PRODUCTS_BASE = API_BASE_URL;

type PaymentMethodPayload = {
  accept_document_company: boolean;
  accept_document_individual: boolean;
  accept_pix: boolean;
  accept_credit_card: boolean;
  accept_ticket: boolean;
  accept_coupon: boolean;
  shown_seller_detail: boolean;
  require_address: boolean;
  detail_discount?: Record<string, unknown>;
  detail_payment_method?: Record<string, unknown>;
};

export const paymentMethodRequests = {
  getCheckoutPaymentMethods: async (
    productId: string,
    checkoutId: string,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout payment methods");

    try {
      return await request(`/product/${productId}/checkouts/${checkoutId}/paymentMethods`, {
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
  saveCheckoutPaymentMethods: async (
    productId: string,
    checkoutId: string,
    payload: PaymentMethodPayload,
    token?: string
  ): Promise<unknown> => {
    if (!productId || !checkoutId) {
      throw new Error("Missing product or checkout id for checkout payment methods");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout payment methods");

    console.log("🔄 [productApi] Enviando métodos de pagamento:", payload);
    const response = await request(`/product/${productId}/checkouts/${checkoutId}/paymentMethods`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
    console.log("✅ [productApi] Resposta métodos de pagamento:", response);
    return response;
  },

  getCheckoutPaymentMethodById: async (
    productId: string,
    checkoutId: string,
    paymentMethodId: string,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout payment method");

    const tryGet = async (path: string) => {
      try {
        return await request(path, {
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
    };

    return await tryGet(`/product/${productId}/checkouts/${checkoutId}/paymentMethods/${paymentMethodId}`);
  },

  updateCheckoutPaymentMethod: async (
    productId: string,
    checkoutId: string,
    paymentMethodId: string,
    payload: PaymentMethodPayload,
    token?: string
  ): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) throw new Error("Missing authentication token for checkout payment method");
    if (!paymentMethodId) {
      throw new Error("Missing payment method id for checkout payment method update");
    }

    const body = Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
    console.log("🔄 [productApi] Enviando atualização de métodos de pagamento:", body);
    const response = await request(
      `/product/${productId}/checkouts/${checkoutId}/paymentMethods/${paymentMethodId}`,
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
    console.log("✅ [productApi] Resposta atualização de métodos de pagamento:", response);
    return response;
  },
};
