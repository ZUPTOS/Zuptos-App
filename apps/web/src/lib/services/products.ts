import type { CreateProductRequest, Product, ProductListParams, UpdateProductRequest } from "../api-types";
import { API_BASE_URL, buildQuery, readStoredToken, readStoredUserId, request } from "../request";

const PRODUCTS_BASE = API_BASE_URL;

export const productApi = {
  listProducts: async (params: ProductListParams, token?: string): Promise<Product[]> => {
    const query = buildQuery({
      user_id: params.user_id,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
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

  createProduct: async (
    payload: Partial<CreateProductRequest & { user_id?: string }>,
    token?: string
  ): Promise<{ id: string; status?: string; message?: string }> => {
    const user_id = payload.user_id ?? readStoredUserId();
    if (!payload.name) {
      throw new Error("Missing name for product creation");
    }
    if (!payload.type) {
      throw new Error("Missing type for product creation");
    }

    const body: Record<string, unknown> = {
      name: payload.name,
      type: payload.type,
      image_url: payload.image_url,
      total_invoiced: payload.total_invoiced ?? 0,
      total_sold: payload.total_sold ?? 0,
      description: payload.description,
    };
    if (user_id) {
      body.user_id = user_id;
    }
    console.log("🔄 [productApi] Enviando criação de produto:", body);
    const authToken = token ?? readStoredToken();
    return request<{ id: string; status?: string; message?: string }>("/product", {
      method: "POST",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
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
};
