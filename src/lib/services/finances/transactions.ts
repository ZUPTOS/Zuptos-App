import type { TransactionResponse } from "../../api-types";
import { API_BASE_URL, readStoredToken, request } from "../../request";

export const transactionsFinanceApi = {
  /**
   * Get transactions list
   */
  getTransactions: async (params?: { page?: number; limit?: number }, token?: string): Promise<TransactionResponse> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for transactions request");
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    
    console.log("🔁 [Finance/Transactions] Fetching transactions from /finance/transactions");
    const response = await request<TransactionResponse>(`/finance/transactions${queryString}`, {
      method: "GET",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ [Finance/Transactions] Response:", response);
    return response;
  },

  /**
   * Get transaction by ID
   */
  getTransactionById: async (id: string, token?: string): Promise<unknown> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for transaction request");
    }
    
    console.log(`🔁 [Finance/Transactions] Fetching transaction ${id}`);
    const response = await request<unknown>(`/finance/transactions/${id}`, {
      method: "GET",
      baseUrl: API_BASE_URL,
      headers: { Authorization: `Bearer ${authToken}` },
    });
    console.log("✅ [Finance/Transactions] Transaction details:", response);
    return response;
  },

  /**
   * Get transactions by type
   */
  getTransactionsByType: async (
    transactionType: string,
    params?: { page?: number; limit?: number },
    token?: string
  ): Promise<TransactionResponse> => {
    const authToken = token ?? readStoredToken();
    if (!authToken) {
      throw new Error("Missing auth token for transactions request");
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    console.log(`🔁 [Finance/Transactions] Fetching transactions of type ${transactionType}`);
    const response = await request<TransactionResponse>(
      `/finance/transactions/type/${transactionType}${queryString}`,
      {
        method: "GET",
        baseUrl: API_BASE_URL,
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    console.log("✅ [Finance/Transactions] Response:", response);
    return response;
  },
};
