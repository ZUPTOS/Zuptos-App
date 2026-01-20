import { request, API_BASE_URL, readStoredToken } from "@/lib/request";

// --- Raw API Response Types (based on screenshot) ---

export interface RawSaleItem {
  id: string;
  amount: string;
  created_at: string;
  payment_method: string;
  sale_date: string;
  sale_type: string;
  status: string;
}

export interface RawFinanceItem {
  id: string;
  transaction_type: string; // "WITHDRAWAL", "SALE"
  amount_total?: string;
  amount_tax?: string;
  total_with_tax?: string;
  created_at?: string;
  status?: string;
  // Fallback for fields that might vary
  [key: string]: unknown;
}

export interface RawHealth {
  chargebacks: number;
  med: number;
  reimbursement: number;
  score: number;
  status: string;
}

export interface RawJourney {
  level: string;
  next_level: string;
  progress_percentage: number;
  total_sales_amount: number;
}

// --- UI Types (consumed by components) ---

export interface DashboardSalesResponse {
  grossRevenue: number;
  growthPercentage: number;
  lines: Array<{
    id: string;
    label: string;
    key: string;
    color: string;
  }>;
  daily: Array<{
    time: string;
    [key: string]: string | number;
  }>;
  monthly: Array<{
    month: string;
    [key: string]: string | number;
  }>;
  yearly: Array<{
    year: string;
    [key: string]: string | number;
  }>;
}

export interface DashboardFinanceResponse {
  availableBalance: number;
  pendingBalance: number;
  paymentMethods: Array<{
    id: string;
    name: string;
    icon: string;
    percentage: number;
    data: Array<{
      time: string;
      value: number;
    }>;
  }>;
}

export interface DashboardHealthResponse {
  healthScore: number;
  healthDetails: Array<{
    label: string;
    percentage: number;
  }>;
}

export interface DashboardJourneyResponse {
  user: {
    id: string;
    name: string;
    email: string;
    location: string;
    avatar: string;
    level: string;
    levelName: string;
    nextLevel: string;
    progress: number;
  };
  levels: Array<{
    id: string;
    name: string;
    threshold: number;
    color: string;
    unlocked: boolean;
  }>;
}

// --- Endpoints (returning Raw types) ---

export const getDashboardSales = async (token?: string): Promise<RawSaleItem[]> => {
  const authToken = token ?? readStoredToken();
  if (!authToken) throw new Error("Missing auth token");

  return request<RawSaleItem[]>("dashboard/sales", {
    baseUrl: API_BASE_URL,
    headers: { Authorization: `Bearer ${authToken}` }
  });
};

import { type FinancesResponse } from "@/lib/api-types";

export const getDashboardFinance = async (token?: string): Promise<FinancesResponse> => {
  const authToken = token ?? readStoredToken();
  if (!authToken) throw new Error("Missing auth token");

  return request<FinancesResponse>("finance", {
    baseUrl: API_BASE_URL,
    headers: { Authorization: `Bearer ${authToken}` }
  });
};

export const getDashboardAccountHealth = async (token?: string): Promise<RawHealth> => {
  const authToken = token ?? readStoredToken();
  if (!authToken) throw new Error("Missing auth token");

  return request<RawHealth>("dashboard/account-health", {
    baseUrl: API_BASE_URL,
    headers: { Authorization: `Bearer ${authToken}` }
  });
};

export const getDashboardAccountJourney = async (token?: string): Promise<RawJourney> => {
  const authToken = token ?? readStoredToken();
  if (!authToken) throw new Error("Missing auth token");

  return request<RawJourney>("dashboard/account-journey", {
    baseUrl: API_BASE_URL,
    headers: { Authorization: `Bearer ${authToken}` }
  });
};
