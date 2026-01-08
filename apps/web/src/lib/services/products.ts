import type {
  CreateProductRequest,
  Product,
  ProductDeliverable,
  CheckoutPayload,
  Checkout,
  ProductListParams,
  ProductOffer,
  UpdateProductRequest,
  ProductSettings,
  UpdateProductSettingsRequest,
  ProductPlan,
  CreateProductTrackingRequest,
  ProductStrategy,
  CreateProductStrategyRequest,
  ProductCoupon,
  CreateProductCouponRequest,
  Coproducer,
  CreateCoproducerRequest,
  SubscriptionPlanPayload,
  CreateOrderBumpRequest,
} from "../api-types";
import { API_BASE_URL, buildQuery, readStoredToken, request } from "../request";

const PRODUCTS_BASE = API_BASE_URL;

export const productApi = {
  listProducts: async (params: ProductListParams = {}, token?: string): Promise<Product[]> => {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 10);
    const query = buildQuery({
      page,
      limit,
    });
    const authToken = token ?? readStoredToken();
    return request<Product[]>(`/product${query}`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  getProductById: async (id: string, token?: string): Promise<Product> => {
    const authToken = token ?? readStoredToken();
    return request<Product>(`/product/${id}`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  getDeliverablesByProductId: async (id: string, token?: string): Promise<ProductDeliverable[]> => {
    const authToken = token ?? readStoredToken();
    return request<ProductDeliverable[]>(`/product/${id}/deliverables`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  getDeliverableById: async (
    productId: string,
    deliverableId: string,
    token?: string
  ): Promise<ProductDeliverable> => {
    const authToken = token ?? readStoredToken();
    return request<ProductDeliverable>(`/product/${productId}/deliverables/${deliverableId}`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  createProduct: async (
    payload: Partial<CreateProductRequest>,
    token?: string
  ): Promise<{ id: string; status?: string; message?: string }> => {
    if (!payload.name) {
      throw new Error("Missing name for product creation");
    }
    if (!payload.type) {
      throw new Error("Missing type for product creation");
    }

    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product creation");
    }

    const bodyEntries = {
      name: payload.name,
      type: payload.type,
      description: payload.description,
      category: payload.category,
      internal_description: payload.internal_description,
      sale_url: payload.sale_url,
      login_username: payload.login_username,
      login_password: payload.login_password,
    };
    const body = Object.fromEntries(
      Object.entries(bodyEntries).filter(([, value]) => value !== undefined && value !== null)
    );

    console.log("🔄 [productApi] Enviando criação de produto:", body);
    return request<{ id: string; status?: string; message?: string }>("/product", {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
  },

  updateProduct: async (id: string, payload: UpdateProductRequest, token?: string): Promise<Product> => {
    if (!id) {
      throw new Error("Missing id for product update");
    }
    const bodyEntries = {
      name: payload.name,
      type: payload.type,
      image_url: payload.image_url,
      total_invoiced: payload.total_invoiced,
      total_sold: payload.total_sold,
      description: payload.description,
    };
    const hasUpdates = Object.values(bodyEntries).some(value => value !== undefined);
    if (!hasUpdates) {
      throw new Error("No fields provided for product update");
    }

    const authToken = token ?? readStoredToken();
    return request<Product>(`/product/${id}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: JSON.stringify(
        Object.fromEntries(
          Object.entries(bodyEntries).filter(([, value]) => value !== undefined)
        )
      ),
    });
  },

  deleteProduct: async (id: string, token?: string): Promise<void> => {
    const authToken = token ?? readStoredToken();
    await request(`/product/${id}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  createDeliverable: async (
    id: string,
    payload: { name: string; type: string; status?: string; content?: string; size?: number },
    token?: string
  ): Promise<ProductDeliverable> => {
    if (!id) {
      throw new Error("Missing product id for deliverable creation");
    }
    if (!payload?.name) {
      throw new Error("Missing deliverable name");
    }
    if (!payload?.type) {
      throw new Error("Missing deliverable type");
    }
    const normalizedType = payload.type.toLowerCase();
    const normalizedStatus = payload.status ?? "active";
    if (normalizedType === "link" && !payload.content) {
      throw new Error("Missing deliverable content for link");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for deliverable creation");
    }

    const body = Object.fromEntries(
      Object.entries({
        ...payload,
        type: normalizedType,
        status: normalizedStatus,
      }).filter(([, value]) => value !== undefined && value !== null)
    );

    console.log("🔄 [productApi] Enviando criação de entregável:", body);
    const response = await request<ProductDeliverable>(`/product/${id}/deliverables`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    console.log("✅ [productApi] Resposta criação de entregável:", response);
    return response;
  },

  updateDeliverable: async (
    productId: string,
    deliverableId: string,
    payload: { name?: string; type?: string; status?: string; content?: string; size?: number },
    token?: string
  ): Promise<ProductDeliverable> => {
    if (!productId || !deliverableId) {
      throw new Error("Missing deliverable id for update");
    }

    const body = Object.fromEntries(
      Object.entries(payload ?? {}).filter(([, value]) => value !== undefined && value !== null)
    );
    if (!Object.keys(body).length) {
      throw new Error("No fields provided for deliverable update");
    }

    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for deliverable update");
    }

    console.log("🔄 [productApi] Enviando atualização de entregável:", body);
    const response = await request<ProductDeliverable>(`/product/${productId}/deliverables/${deliverableId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
    console.log("✅ [productApi] Resposta atualização de entregável:", response);
    return response;
  },

  deleteDeliverable: async (productId: string, deliverableId: string, token?: string): Promise<void> => {
    if (!productId || !deliverableId) {
      throw new Error("Missing deliverable id for deletion");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for deliverable deletion");
    }
    await request(`/product/${productId}/deliverables/${deliverableId}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  },

  uploadDeliverableFile: async (
    productId: string,
    deliverableId: string,
    file: File,
    token?: string
  ): Promise<ProductDeliverable> => {
    if (!productId || !deliverableId) {
      throw new Error("Missing deliverable id for file upload");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for deliverable upload");
    }
    const formData = new FormData();
    formData.append("file", file);

    console.log("🔄 [productApi] Enviando upload de arquivo do entregável:", {
      productId,
      deliverableId,
      name: file.name,
      size: file.size,
    });
    const response = await request<ProductDeliverable>(
      `/product/${productId}/deliverables/${deliverableId}/upload`,
      {
        method: "POST",
        baseUrl: PRODUCTS_BASE,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      }
    );
    console.log("✅ [productApi] Resposta upload de entregável:", response);
    return response;
  },

  getOffersByProductId: async (id: string, token?: string): Promise<ProductOffer[]> => {
    const authToken = token ?? readStoredToken();
    return request<ProductOffer[]>(`/product/${id}/offers`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  createOffer: async (
    id: string,
    payload: ProductOffer,
    token?: string
  ): Promise<ProductOffer> => {
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
    const response = await request<ProductOffer>(`/products/${productId}/offers/${offerId}`, {
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
      // Fallback to legacy path if available
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

  getCoproducersByProductId: async (id: string, token?: string): Promise<Coproducer[]> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for coproducers");
    }
    return request<Coproducer[]>(`/product/${id}/coproducers`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  createCoproducer: async (
    id: string,
    payload: CreateCoproducerRequest,
    token?: string
  ): Promise<{ id: string; message?: string; status?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for coproducer creation");
    }
    return request<{ id: string; message?: string; status?: string }>(`/product/${id}/coproducers`, {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  getProductCoupons: async (id: string, token?: string): Promise<ProductCoupon[]> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product coupons");
    }
    return request<ProductCoupon[]>(`/product/${id}/coupons`, {
      method: "GET",
      baseUrl: PRODUCTS_BASE,
      headers: { Authorization: `Bearer ${authToken}` },
    });
  },

  createProductCoupon: async (
    id: string,
    payload: CreateProductCouponRequest,
    token?: string
  ): Promise<{ id: string; message?: string; status?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product coupons");
    }
    return request<{ id: string; message?: string; status?: string }>(`/product/${id}/coupons`, {
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
