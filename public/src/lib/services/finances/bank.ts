import type { BankDataResponse } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

export const bankFinanceApi = {
  /**
   * Get bank account data
   */
  getBankData: async (token?: string): Promise<BankDataResponse> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for bank data request");
    }
    
    console.log("🔁 [Finance/Bank] Fetching bank data from /finance/bank");
    const response = await request<BankDataResponse>("/finance/bank", {
      method: "GET",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ [Finance/Bank] Response from /finance/bank:", response);
    return response;
  },

  /**
   * Create or update bank account
   */
  updateBankData: async (data: Partial<BankDataResponse>, token?: string): Promise<BankDataResponse> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for bank data update");
    }
    
    // Prepare payload according to API specification
    const payload = {
      bank_institution: data.bank_institution || data.bank_name || "",
      account_key: data.account_key || "", // The actual key value (e.g. test-key-123)
      account_type: data.account_type || "", // The type (e.g. RANDOM_KEY)
    };
    
    console.log("🔁 [Finance/Bank] Updating bank data at /finance/bank");
    console.log("📤 [Finance/Bank] Payload being sent:", JSON.stringify(payload, null, 2));
    
    const response = await request<BankDataResponse>("/finance/bank", {
      method: "POST",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify(payload),
    });
    
    console.log("✅ [Finance/Bank] Bank data updated successfully");
    console.log("📥 [Finance/Bank] Server response:", JSON.stringify(response, null, 2));
    
    return response;
  },
};
