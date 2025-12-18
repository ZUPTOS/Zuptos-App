import type { KycDocumentResponse, KycPayload, KycResponse } from "../api-types";
import { API_BASE_URL, readStoredToken, request } from "../request";

type KycStatusResponse =
  | { id?: string; status?: string }
  | Array<{ id?: string; status?: string }>
  | null
  | undefined;

const parseKycCompleted = (data: KycStatusResponse) => {
  if (!data) return false;

  if (Array.isArray(data)) {
    return data.length > 0;
  }

  if (typeof data === "object") {
    const status = (data as { status?: string }).status;
    const id = (data as { id?: string }).id;
    if (status) {
      const normalized = status.toLowerCase();
      if (["approved", "aprovado", "completed", "complete", "validado"].includes(normalized)) {
        return true;
      }
      if (["pending", "in_progress", "processing", "waiting"].includes(normalized)) {
        return false;
      }
    }
    return Boolean(id);
  }

  return false;
};

export const kycApi = {
  getStatus: async (token?: string): Promise<boolean> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) return false;

    try {
      const data = await request<KycStatusResponse>("/kyc", {
        method: "GET",
        baseUrl: API_BASE_URL,
        headers: { Authorization: `Bearer ${authToken}` },
        silent: true,
      });

      return parseKycCompleted(data);
    } catch {
      return false;
    }
  },

  get: async (token?: string): Promise<KycResponse | null> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) return null;

    const data = await request<KycResponse>("/kyc", {
      method: "GET",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
      silent: true,
    });

    return data ?? null;
  },

  create: async (payload: KycPayload, token?: string): Promise<KycResponse> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for KYC creation");
    }
    console.log("[KYC] Token para envio:", authToken.slice(0, 8), "(len:", authToken.length, ")");
    return request<KycResponse>("/kyc", {
      method: "POST",
      baseUrl: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  update: async (id: string, payload: Partial<KycPayload>, token?: string): Promise<KycResponse> => {
    if (!id) throw new Error("Missing KYC id for update");
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for KYC update");
    }
    return request<KycResponse>(`/kyc/${id}`, {
      method: "PATCH",
      baseUrl: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });
  },

  uploadDocument: async (documentName: string, file: File | Blob, token?: string): Promise<KycDocumentResponse> => {
    if (!documentName) throw new Error("Missing document name for upload");
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for KYC document upload");
    }

    const formData = new FormData();
    const fileName = file instanceof File ? file.name : `${documentName}.bin`;
    formData.append("file", file, fileName);

    return request<KycDocumentResponse>(`/kyc/document/${encodeURIComponent(documentName)}`, {
      method: "POST",
      baseUrl: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: formData,
    });
  },
};
