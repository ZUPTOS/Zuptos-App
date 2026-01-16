import type { WithdrawResponse, CreateWithdrawRequest } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

export const withdrawFinanceApi = {
  /**
   * Get withdraw history
   */
  getWithdrawHistory: async (token?: string): Promise<WithdrawResponse> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for withdraw history request");
    }

    console.log("🔁 [Finance/Withdraw] Fetching withdraw history from /finance/withdraw");
    const response = await request<WithdrawResponse>("/finance/withdraw", {
      method: "GET",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ [Finance/Withdraw] Response:", response);
    return response;
  },

  /**
   * Create a new withdraw request
   */
  createWithdraw: async (data: CreateWithdrawRequest, token?: string): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for withdraw creation");
    }
    
    console.log("🔁 [Finance/Withdraw] Creating withdraw request");
    const response = await request<unknown>("/finance/withdraw", {
      method: "POST",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(data),
    });
    console.log("✅ [Finance/Withdraw] Withdraw created:", response);
    return response;
  },

  /**
   * Cancel a withdraw request
   */
  cancelWithdraw: async (id: string, token?: string): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for withdraw cancellation");
    }
    
    console.log(`🔁 [Finance/Withdraw] Cancelling withdraw ${id}`);
    const response = await request<unknown>(`/finance/withdraw/${id}`, {
      method: "DELETE",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ [Finance/Withdraw] Withdraw cancelled:", response);
    return response;
  },
};
