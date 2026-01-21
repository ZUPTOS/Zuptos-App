import type { CreateProductCouponRequest, ProductCoupon } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const couponsApi = {
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

  updateProductCoupon: async (
    productId: string,
    couponId: string,
    payload: CreateProductCouponRequest,
    token?: string
  ): Promise<ProductCoupon> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product coupons");
    }
    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    return request<ProductCoupon>(`/product/${productId}/coupons/${couponId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
  },

  deleteProductCoupon: async (
    productId: string,
    couponId: string,
    token?: string
  ): Promise<{ id?: string; status?: string; message?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for product coupons");
    }
    return request<{ id?: string; status?: string; message?: string }>(
      `/product/${productId}/coupons/${couponId}`,
      {
        method: "DELETE",
        baseUrl: PRODUCTS_BASE,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      }
    );
  },
};
