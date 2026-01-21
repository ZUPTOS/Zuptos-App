import type { FinancesResponse } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

export const baseFinanceApi = {
  /**
   * Get base finance data (available balance, pending balance, commissions)
   */
  getFinanceData: async (token?: string): Promise<FinancesResponse> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for finances request");
    }
    
    console.log("🔁 [Finance/Base] Fetching finance data from /finance");
    const response = await request<FinancesResponse>("/finance", {
      method: "GET",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ [Finance/Base] Response from /finance:", response);
    return response;
  },
};
