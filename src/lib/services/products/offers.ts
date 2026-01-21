import type { CreateOrderBumpRequest, ProductOffer, ProductPlan, SubscriptionPlanPayload } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const offersApi = {
  getOffersByProductId: async (id: string, token?: string): Promise<ProductOffer[]> => {
    const authToken = token ?? readStoredToken();
    return request<ProductOffer[]>(`/product/${id}/offers`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  createOffer: async (id: string, payload: ProductOffer, token?: string): Promise<ProductOffer> => {
    if (!id) {
      throw new Error("Missing product id for offer creation");
    }
    if (!payload?.name || !payload?.type) {
      throw new Error("Missing offer name or type");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for offer creation");
    }

    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
    );

    console.log("🔄 [productApi] Enviando criação de oferta:", body);
    const response = await request<ProductOffer>(`/product/${id}/offers`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    console.log("✅ [productApi] Resposta criação de oferta:", response);
    return response;
  },

  updateOffer: async (
    productId: string,
    offerId: string,
    payload: ProductOffer,
    token?: string
  ): Promise<ProductOffer> => {
    if (!productId || !offerId) {
      throw new Error("Missing product id or offer id for offer update");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for offer update");
    }

    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
    );

    console.log("🔄 [productApi] Enviando atualização de oferta:", body);
    const response = await request<ProductOffer>(`/product/${productId}/offers/${offerId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    console.log("✅ [productApi] Resposta atualização de oferta:", response);
    return response;
  },

  deleteOffer: async (productId: string, offerId: string, token?: string): Promise<void> => {
    if (!productId || !offerId) {
      throw new Error("Missing product id or offer id for offer deletion");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for offer deletion");
    }
    console.log("🔄 [productApi] Deletando oferta:", { productId, offerId });
    await request(`/product/${productId}/offers/${offerId}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  },

  createOfferPlan: async (
    productId: string,
    offerId: string,
    payload: SubscriptionPlanPayload,
    token?: string
  ): Promise<ProductPlan> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product plans");
    }
    return request<ProductPlan>(`/product/${productId}/offer/${offerId}/plans`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  createOfferBump: async (
    productId: string,
    offerId: string,
    payload: CreateOrderBumpRequest,
    token?: string
  ) => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for order bumps");
    }
    return request(`/product/${productId}/offer/${offerId}/bumps`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },
};
