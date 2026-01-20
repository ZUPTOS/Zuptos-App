import type {
  CreateProductRequest,
  Product,
  ProductListParams,
  ProductSettingsStatus,
} from "../../api-types";
import { API_BASE_URL, buildQuery, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const productsApi = {
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

  deleteProduct: async (id: string, token?: string): Promise<void> => {
    const authToken = token ?? readStoredToken();
    await request(`/product/${id}`, {
      method: "DELETE",
      baseUrl: PRODUCTS_BASE,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
  },

  updateProductStatus: async (
    productId: string,
    status: ProductSettingsStatus,
    token?: string
  ): Promise<Product> => {
    if (!productId) {
      throw new Error("Missing product id for status update");
    }
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product status update");
    }
    const body = { status };
    console.log("🔄 [productApi] Atualizando status do produto:", { productId, status });
    return request<Product>(`/product/${productId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
  },
};
