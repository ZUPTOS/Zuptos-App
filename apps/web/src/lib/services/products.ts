import type {
  CreateProductRequest,
  Product,
  ProductDeliverable,
  ProductListParams,
  ProductOffer,
  UpdateProductRequest,
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
    if (payload.type.toLowerCase() === "link" && !payload.content) {
      throw new Error("Missing deliverable content for link");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for deliverable creation");
    }

    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== null)
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
};
