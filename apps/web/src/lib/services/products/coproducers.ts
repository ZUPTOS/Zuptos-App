import type { Coproducer, CreateCoproducerRequest } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const coproducersApi = {
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

  updateCoproducer: async (
    productId: string,
    coproducerId: string,
    payload: CreateCoproducerRequest,
    token?: string
  ): Promise<Coproducer> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for coproducer update");
    }
    const body = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    );
    return request<Coproducer>(`/product/${productId}/coproducers/${coproducerId}`, {
      method: "PATCH",
      baseUrl: PRODUCTS_BASE,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(body),
    });
  },

  deleteCoproducer: async (
    productId: string,
    coproducerId: string,
    token?: string
  ): Promise<{ id?: string; status?: string; message?: string }> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing authentication token for coproducer deletion");
    }
    return request<{ id?: string; status?: string; message?: string }>(
      `/product/${productId}/coproducers/${coproducerId}`,
      {
        method: "DELETE",
        baseUrl: PRODUCTS_BASE,
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      }
    );
  },
};
