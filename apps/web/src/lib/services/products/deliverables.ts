import type { ProductDeliverable } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

const PRODUCTS_BASE = API_BASE_URL;

export const deliverablesApi = {
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
    const response = await request<ProductDeliverable>(
      `/product/${productId}/deliverables/${deliverableId}`,
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
};
